import Quickshell
import Quickshell.Wayland
import QtQuick
import QtQuick.Layouts
import qs.Commons
import "../UnboundModel.js" as UnboundModel

Capsule {
  id: root

  property var bar: null
  readonly property var activeWindow: ToplevelManager.activeToplevel
  readonly property string windowTitle: UnboundModel.cleanTitle(activeWindow ? activeWindow.title : "")
  readonly property string iconName: UnboundModel.safeIconName(activeWindow ? activeWindow.appId : "")
  readonly property url iconSource: {
    var resolved = Quickshell.iconPath(iconName, true)
    return resolved ? resolved : Quickshell.iconPath("application-x-executable", true)
  }

  visible: windowTitle !== ""
  implicitWidth: visible ? Math.min(360, (contentItem ? contentItem.implicitWidth : 0) + horizontalPadding * 2) : 0

  contentComponent: Component {
    RowLayout {
      id: contentRow
      spacing: Style.space(1)

      Image {
        source: root.iconSource
        sourceSize.width: 18
        sourceSize.height: 18
        Layout.preferredWidth: 18
        Layout.preferredHeight: 18
        fillMode: Image.PreserveAspectFit
        smooth: true
      }

      Text {
        Layout.minimumWidth: 40
        Layout.preferredWidth: Math.min(300, implicitWidth)
        Layout.maximumWidth: 300
        text: root.windowTitle
        textFormat: Text.PlainText
        elide: Text.ElideRight
        maximumLineCount: 1
        color: root.bar ? root.bar.barForeground : Color.bar.text
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        verticalAlignment: Text.AlignVCenter
      }
    }
  }
}
