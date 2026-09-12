import QtQuick

// Build a subclass against the host's actual installation path. Widget folders
// are file imports, not qs.* modules. The host retains click/focus behavior.
QtObject {
  function create(hostPath, owner) {
    var widgetDirectory = "file://" + hostPath + "/shell/plugins/bar/widgets"
    var source = 'import QtQuick\n'
      + 'import Quickshell.Hyprland\n'
      + 'import ' + JSON.stringify(widgetDirectory) + ' as Stock\n'
      + `Component {
        Stock.Workspaces {
          function workspaceIds() {
            var ids = this.vertical ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            var values = Hyprland.workspaces.values
            for (var i = 0; i < values.length; i++) {
              var id = values[i].id
              if (id > 0 && id <= 10 && ids.indexOf(id) === -1) ids.push(id)
            }
            ids.sort(function(left, right) { return left - right })
            return ids
          }
        }
      }`
    return Qt.createQmlObject(source, owner, "UnboundHostedWorkspaces")
  }
}
