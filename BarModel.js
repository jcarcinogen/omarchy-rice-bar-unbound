function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function normalizePosition(value) {
  var next = String(value || "").trim()
  return /^(top|bottom|left|right)$/.test(next) ? next : "top"
}

function entrySettings(entry) {
  if (!isPlainObject(entry)) return {}
  var copy = {}
  for (var key in entry) {
    if (key === "id") continue
    copy[key] = entry[key]
  }
  return copy
}

function entryId(entry) {
  if (typeof entry === "string") return entry
  if (isPlainObject(entry)) {
    var id = entry["id"]
    if (id !== undefined && id !== null && String(id) !== "") return String(id)
  }
  return ""
}

function pinTrayToInner(entries, section) {
  var trayEntries = []
  var result = []
  var values = Array.isArray(entries) ? entries : []
  for (var i = 0; i < values.length; i++) {
    if (entryId(values[i]) === "omarchy.tray") trayEntries.push(values[i])
    else result.push(values[i])
  }
  if (section === "right") return trayEntries.concat(result)
  return result.concat(trayEntries)
}

function sourceIndexFor(sourceEntries, normalizedEntries, normalizedIndex) {
  var source = Array.isArray(sourceEntries) ? sourceEntries : []
  var normalized = Array.isArray(normalizedEntries) ? normalizedEntries : []
  var index = Math.round(Number(normalizedIndex))
  if (index < 0 || index >= normalized.length) return -1
  var target = normalized[index]
  for (var exact = 0; exact < source.length; exact++) {
    if (source[exact] === target) return exact
  }

  var id = entryId(target)
  var occurrence = 0
  for (var i = 0; i < index; i++) if (entryId(normalized[i]) === id) occurrence++
  for (var j = 0; j < source.length; j++) {
    if (entryId(source[j]) !== id) continue
    if (occurrence === 0) return j
    occurrence--
  }
  return -1
}

function moduleString(entry, key, fallback) {
  var settings = entrySettings(entry)
  var value = settings[key]
  return value === undefined || value === null ? fallback : String(value)
}

function entryIndex(entries, name) {
  if (!Array.isArray(entries)) return -1
  for (var i = 0; i < entries.length; i++) {
    if (entryId(entries[i]) === name) return i
  }
  return -1
}

function entriesBefore(entries, name) {
  var index = entryIndex(entries, name)
  return index <= 0 ? [] : entries.slice(0, index)
}

function entriesAfter(entries, name) {
  var index = entryIndex(entries, name)
  return index === -1 ? [] : entries.slice(index + 1)
}

// A shell.json write that only changes inline widget settings (the battery
// percentage toggle, a clock format change) must not rebuild the bar.
// Compare two normalized layouts: when the structure is unchanged — same
// entry ids in the same order per region — return the settings-only changes
// as {region, index, instanceKey, entry}. Return null when the change is
// structural, or touches a custom module whose entry is consumed directly
// rather than through the injected settings property. Configured instances are
// keyed by region/index so duplicate ids can still receive isolated updates.
function inlineSettingsDelta(current, next) {
  if (!isPlainObject(current) || !isPlainObject(next)) return null
  var regions = ["left", "center", "right"]
  var changes = []
  for (var s = 0; s < regions.length; s++) {
    var region = regions[s]
    var a = Array.isArray(current[region]) ? current[region] : []
    var b = Array.isArray(next[region]) ? next[region] : []
    if (a.length !== b.length) return null
    for (var j = 0; j < a.length; j++) {
      if (entryId(a[j]) !== entryId(b[j])) return null
      if (JSON.stringify(a[j]) === JSON.stringify(b[j])) continue
      if (customModuleType(a[j]) || customModuleType(b[j])) return null
      changes.push({ region: region, index: j, instanceKey: region + ":" + j, entry: b[j] })
    }
  }
  return changes
}

function expandPath(value, home) {
  var path = String(value || "")
  if (path === "") return ""
  if (path.indexOf("~/") === 0) return home + path.substring(1)
  if (path.indexOf("$HOME/") === 0) return home + path.substring(5)
  return path
}

function customModuleSafeName(name) {
  var value = String(name || "")
  return value !== "" && value.indexOf("..") === -1 && value[0] !== "/"
}

function customModuleType(entry) {
  var settings = entrySettings(entry)
  var type = String(settings.type || "")
  if (type) return type
  if (settings.exec) return "command"
  if (settings.source) return "qml"
  return ""
}

function customModulePath(entry, home, configDir) {
  var settings = entrySettings(entry)
  var name = entryId(entry)
  var source = settings.source ? expandPath(settings.source, home) : ""
  if (!source && customModuleSafeName(name))
    source = String(configDir || "") + "/bar/modules/" + String(name) + ".qml"
  return source
}

// A center module is mounted twice once an anchor is set: the copy that is
// actually drawn, and a zero-size placeholder holding its place in the flow
// beside the anchor. Panel routing has to pick the drawn one — it is the only
// one that can anchor a popup, carry the open-panel mark, or be found again
// by switchPanelFrom — and fall back to the placeholder only when nothing is
// on screen. The order the two are registered in is not stable across a live
// bar reconfiguration, so picking the first match is not good enough.
function isDrawnSlot(slot) {
  return !!slot && slot.visible === true && slot.width > 0 && slot.height > 0
}

function pickDrawnSlot(slots) {
  var placeholder = null
  var list = slots || []
  for (var i = 0; i < list.length; i++) {
    if (!list[i]) continue
    if (isDrawnSlot(list[i])) return list[i]
    if (!placeholder) placeholder = list[i]
  }
  return placeholder
}

// A bar surface is built per monitor, so a panel hotkey has several live
// copies of the same widget to route to, and the panel opens on whichever
// monitor's copy answers. Candidates are `{ slot, screenName, opened }`.
//
// An open copy wins first: hide and toggle have to reach the panel the user
// can actually see, wherever it was opened from. Otherwise the focused
// monitor's copy wins, so a summon lands where the user is working instead of
// on whichever output registered its slot first. Neither narrowing applies on
// a single monitor, or when the focused output has no bar of its own.
function pickPanelSlot(candidates, focusedScreen) {
  var rows = Array.isArray(candidates) ? candidates : []
  var pool = rows.filter(function(row) { return row && row.opened === true })
  if (pool.length === 0) pool = rows.filter(function(row) { return !!row })

  var focused = String(focusedScreen || "")
  if (focused) {
    var onFocused = pool.filter(function(row) { return row.screenName === focused })
    if (onFocused.length > 0) pool = onFocused
  }

  return pickDrawnSlot(pool.map(function(row) { return row.slot }))
}

// Move one configured instance by canonical source index. The destination
// index is the index before which it should land, or the destination length
// to append. IDs are deliberately irrelevant because duplicates are valid.
function moveEntry(config, fromRegion, fromIndex, toRegion, beforeIndex) {
  if (!config || !config.bar || !config.bar.layout) return false
  var fromEntries = config.bar.layout[fromRegion]
  var toEntries = config.bar.layout[toRegion]
  if (!Array.isArray(fromEntries) || !Array.isArray(toEntries)) return false

  fromIndex = Math.round(Number(fromIndex))
  beforeIndex = Math.round(Number(beforeIndex))
  if (!isFinite(fromIndex) || fromIndex < 0 || fromIndex >= fromEntries.length) return false
  if (!isFinite(beforeIndex) || beforeIndex < 0) beforeIndex = toEntries.length
  if (beforeIndex > toEntries.length) beforeIndex = toEntries.length

  var insertIndex = beforeIndex
  if (fromRegion === toRegion && fromIndex < insertIndex) insertIndex -= 1
  if (fromRegion === toRegion && fromIndex === insertIndex) return false

  var moved = fromEntries.splice(fromIndex, 1)[0]
  if (insertIndex < 0) insertIndex = 0
  if (insertIndex > toEntries.length) insertIndex = toEntries.length
  toEntries.splice(insertIndex, 0, moved)
  return true
}

// Resolve a pointer anywhere along the bar to the closest insertion edge.
// Requiring the pointer to sit inside another widget makes the empty space
// around a centered group a dead zone, even though it visually reads as the
// most natural place to drop.
function nearestDropTarget(candidates, point, vertical) {
  var rows = Array.isArray(candidates) ? candidates : []
  var axis = vertical ? Number(point && point.y) : Number(point && point.x)
  if (!isFinite(axis)) return null

  var best = null
  var bestDistance = Infinity
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    if (!row || !row.slot) continue

    var start = Number(vertical ? row.y : row.x)
    var size = Number(vertical ? row.height : row.width)
    if (!isFinite(start) || !isFinite(size) || size <= 0) continue

    var beforeDistance = Math.abs(axis - start)
    var afterDistance = Math.abs(axis - (start + size))
    var after = afterDistance < beforeDistance
    var distance = after ? afterDistance : beforeDistance
    if (distance < bestDistance) {
      best = { slot: row.slot, after: after }
      bestDistance = distance
    }
  }
  return best
}

if (typeof module !== "undefined") {
  module.exports = {
    isDrawnSlot: isDrawnSlot,
    pickDrawnSlot: pickDrawnSlot,
    pickPanelSlot: pickPanelSlot,
    moveEntry: moveEntry,
    nearestDropTarget: nearestDropTarget,
    normalizePosition: normalizePosition,
    entrySettings: entrySettings,
    entryId: entryId,
    pinTrayToInner: pinTrayToInner,
    sourceIndexFor: sourceIndexFor,
    moduleString: moduleString,
    entryIndex: entryIndex,
    entriesBefore: entriesBefore,
    entriesAfter: entriesAfter,
    inlineSettingsDelta: inlineSettingsDelta,
    expandPath: expandPath,
    customModuleSafeName: customModuleSafeName,
    customModuleType: customModuleType,
    customModulePath: customModulePath
  }
}
