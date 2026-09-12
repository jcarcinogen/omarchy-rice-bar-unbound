import QtQuick
import "../styles" as Styles

Item {
  id: root

  property Component contentComponent
  property int horizontalPadding: tokens.capsulePadding
  property int verticalPadding: 2
  property alias contentItem: contentLoader.item

  implicitWidth: contentLoader.implicitWidth > 0 ? contentLoader.implicitWidth + horizontalPadding * 2 : 0
  implicitHeight: tokens.capsuleHeight
  clip: true

  Styles.VisualTokens { id: tokens }

  Rectangle {
    anchors.fill: parent
    color: tokens.capsuleTop
    radius: Math.min(tokens.radius, height / 2)
    border.width: 0
  }

  Loader {
    id: contentLoader
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.leftMargin: root.horizontalPadding
    anchors.rightMargin: root.horizontalPadding
    anchors.verticalCenter: parent.verticalCenter
    height: implicitHeight
    sourceComponent: root.contentComponent
  }
}
