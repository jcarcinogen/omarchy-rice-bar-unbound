import QtQuick
import qs.Commons

Item {
  id: root

  property var bar: null
  property var destinations: []
  readonly property bool opened: popup.opened
  readonly property bool tooltipHovered: hover.hovered
  property bool interactive: true
  property bool pressable: true
  property bool concealed: false

  implicitWidth: destinations.length > 0 ? 32 : 0
  implicitHeight: 32
  visible: destinations.length > 0

  function open() { popup.open() }
  function close() { popup.close() }
  function closeForPopoutSwitch() { popup.close() }
  function triggerPress(button) { if (button === Qt.LeftButton) opened ? close() : open() }

  Text {
    anchors.centerIn: parent
    text: "󰒓"
    textFormat: Text.PlainText
    color: root.bar ? root.bar.barForeground : Color.bar.text
    font.family: root.bar ? root.bar.fontFamily : Style.font.family
    font.pixelSize: 18
  }

  HoverHandler {
    id: hover
    onHoveredChanged: {
      if (!root.bar) return
      if (hovered) root.bar.showTooltip(root, "Quick controls")
      else root.bar.hideTooltip(root)
    }
  }

  MouseArea {
    anchors.fill: parent
    cursorShape: Qt.PointingHandCursor
    onClicked: function(mouse) { root.triggerPress(mouse.button) }
  }

  ControlLauncherPopup {
    id: popup
    bar: root.bar
    anchorItem: root
    destinations: root.destinations
  }
}
