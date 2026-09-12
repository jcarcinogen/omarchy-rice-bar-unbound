import QtQuick

// Detached, entry-scoped shell surface for a hosted third-party widget.
// Callback properties close over the owning ModuleSlot; none return the bar
// root, shell root, registry, or another plugin's service.
QtObject {
  id: api

  required property string moduleName
  property var _ownServiceLookup: null
  property var _summonOwn: null
  property var _hideOwn: null
  property var _toggleOwn: null
  property var _isOwnOpen: null
  property var _updateOwnSettings: null

  function serviceFor(requestedId) {
    requestedId = String(requestedId || "")
    if (requestedId !== moduleName) return null
    return _ownServiceLookup ? _ownServiceLookup() : null
  }

  function firstPartyServiceFor(requestedId) {
    return serviceFor(requestedId)
  }

  function summon(requestedId, payloadJson) {
    return String(requestedId || "") === moduleName && _summonOwn
      ? _summonOwn(String(payloadJson || "")) : false
  }

  function hide(requestedId) {
    return String(requestedId || "") === moduleName && _hideOwn ? _hideOwn() : false
  }

  function toggle(requestedId, payloadJson) {
    return String(requestedId || "") === moduleName && _toggleOwn
      ? _toggleOwn(String(payloadJson || "")) : false
  }

  function isPluginOpen(requestedId) {
    return String(requestedId || "") === moduleName && _isOwnOpen ? _isOwnOpen() : false
  }

  function updateEntryInline(requestedId, settings) {
    return String(requestedId || "") === moduleName && _updateOwnSettings
      ? _updateOwnSettings(settings) : false
  }
}
