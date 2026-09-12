import QtQuick

// Build a subclass against the host's actual installation path. Widget folders
// are file imports, not qs.* modules. The host retains all tray menus/actions.
QtObject {
  function create(hostPath, owner) {
    var widgetDirectory = "file://" + hostPath + "/shell/plugins/bar/widgets"
    var source = 'import QtQuick\n'
      + 'import Quickshell.Services.SystemTray\n'
      + 'import ' + JSON.stringify(widgetDirectory) + ' as Stock\n'
      + `Component {
        Stock.Tray {
          id: unboundTray
          readonly property real openPanelIndicatorWidth: trayItemExtent
          readonly property real openPanelIndicatorHeight: trayItemExtent
          readonly property real openPanelIndicatorCenterX: activeTrayAnchor
            ? activeTrayAnchor.mapToItem(unboundTray, activeTrayAnchor.width / 2, activeTrayAnchor.height / 2).x
            : width / 2
          readonly property real openPanelIndicatorCenterY: activeTrayAnchor
            ? activeTrayAnchor.mapToItem(unboundTray, activeTrayAnchor.width / 2, activeTrayAnchor.height / 2).y
            : height / 2

          function bucket(category) {
            // No drawer or chevron; active items all use the visible row.
            if (category !== "pinned") return []
            var values = SystemTray.items.values
            var result = []
            for (var i = 0; i < values.length; i++) {
              if (values[i].status !== Status.Passive) result.push(values[i])
            }
            return result
          }
          function iconIsSymbolic(icon) { return true }
          function trayIconSource(icon) {
            var values = SystemTray.items.values
            for (var i = 0; i < values.length; i++) {
              var item = values[i]
              if (String(item.icon) !== String(icon)) continue
              var name = (String(item.id || "") + " " + String(item.title || "") + " " + String(icon)).toLowerCase()
              if (name.indexOf("1password") !== -1)
                return Qt.resolvedUrl("icons/password-symbolic.svg")
              if (name.indexOf("bluebubbles") !== -1 || name.indexOf("openbubbles") !== -1)
                return Qt.resolvedUrl("icons/bubbles-symbolic.svg")
            }
            return String(icon || "")
          }
        }
      }`
    return Qt.createQmlObject(source, owner, "UnboundHostedTray")
  }
}
