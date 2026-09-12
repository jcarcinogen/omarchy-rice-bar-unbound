import Quickshell
import QtQuick
import qs.Commons

Item {
  id: root

  property var bar: null
  property var anchorItem: null
  property var destinations: []
  readonly property bool opened: popup.visible

  implicitWidth: 0
  implicitHeight: 0

  function availableDestinations() {
    var serial = bar ? bar.moduleSlots : []
    return destinations.filter(function(row) {
      return bar && bar.findPanelWidget(row.id) !== null
    })
  }

  function open() {
    if (opened || availableDestinations().length === 0) return
    if (bar) {
      bar.hideTooltip(root.anchorItem)
      bar.requestPopout(root.anchorItem)
    }
    popup.visible = true
    Qt.callLater(function() { keyScope.forceActiveFocus() })
  }

  function close() {
    popup.visible = false
    if (bar && anchorItem) bar.releasePopout(anchorItem)
  }

  function activate(index) {
    var rows = availableDestinations()
    if (index < 0 || index >= rows.length) return
    var id = rows[index].id
    root.close()
    Qt.callLater(function() {
      if (root.bar) root.bar.summonBarWidget(id)
    })
  }

  PopupWindow {
    id: popup
    visible: false
    color: "transparent"
    implicitWidth: 224
    implicitHeight: Math.max(52, availableList.count * 42 + 16)
    onVisibleChanged: {
      if (!visible && root.bar && root.anchorItem)
        root.bar.releasePopout(root.anchorItem)
    }

    anchor {
      id: popupAnchor
      window: root.anchorItem && root.anchorItem.QsWindow ? root.anchorItem.QsWindow.window : null
      adjustment: PopupAdjustment.Slide
      edges: Edges.Top | Edges.Left
      gravity: Edges.Bottom | Edges.Right
      rect.width: root.anchorItem ? root.anchorItem.width : 1
      rect.height: 1

      onAnchoring: {
        if (!root.anchorItem || !popupAnchor.window) return
        var point = popupAnchor.window.contentItem.mapFromItem(root.anchorItem, 0, root.anchorItem.height + 6)
        popupAnchor.rect.x = Math.round(point.x)
        popupAnchor.rect.y = Math.round(point.y)
      }
    }

    Rectangle {
      anchors.fill: parent
      radius: 16
      color: Color.bar.background
      border.width: 1
      border.color: Color.accent

      Item {
        id: keyScope
        anchors.fill: parent
        focus: true
        Keys.onEscapePressed: root.close()
        Keys.onUpPressed: availableList.currentIndex = Math.max(0, availableList.currentIndex - 1)
        Keys.onDownPressed: availableList.currentIndex = Math.min(availableList.count - 1, availableList.currentIndex + 1)
        Keys.onReturnPressed: root.activate(availableList.currentIndex)
        Keys.onEnterPressed: root.activate(availableList.currentIndex)

        ListView {
          id: availableList
          anchors.fill: parent
          anchors.margins: 8
          interactive: false
          currentIndex: 0
          model: root.availableDestinations()

          delegate: Rectangle {
            required property var modelData
            required property int index
            width: availableList.width
            height: 42
            radius: 10
            color: ListView.isCurrentItem ? Qt.rgba(Color.accent.r, Color.accent.g, Color.accent.b, 0.22) : "transparent"

            Row {
              anchors.fill: parent
              anchors.leftMargin: 12
              spacing: 12

              Text {
                anchors.verticalCenter: parent.verticalCenter
                text: modelData.icon
                textFormat: Text.PlainText
                color: Color.bar.text
                font.family: Style.font.family
                font.pixelSize: 18
              }

              Text {
                anchors.verticalCenter: parent.verticalCenter
                text: modelData.label
                textFormat: Text.PlainText
                color: Color.bar.text
                font.family: Style.font.family
                font.pixelSize: Style.font.body
              }
            }

            MouseArea {
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onEntered: availableList.currentIndex = index
              onClicked: function(mouse) { root.activate(index) }
            }
          }
        }
      }
    }
  }
}
