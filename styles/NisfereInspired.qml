import QtQuick
import "../UnboundModel.js" as UnboundModel

Item {
  id: root

  property Component leftComponent
  property Component centerComponent
  property Component rightComponent
  property bool transparent: false
  readonly property var geometry: UnboundModel.topGeometry(width, centerLoader.implicitWidth || 320)
  readonly property real centerShift: centerLoader.item && !centerLoader.item.overflowing && centerLoader.item.anchorOffset >= 0
    ? centerLoader.width / 2 - centerLoader.item.anchorOffset : 0

  Rectangle {
    anchors.fill: parent
    color: root.transparent ? "transparent" : tokens.stripColor
  }

  VisualTokens { id: tokens }

  Loader {
    id: leftLoader
    x: root.geometry.edgeInset
    anchors.verticalCenter: parent.verticalCenter
    width: Math.min(implicitWidth, Math.max(0, root.geometry.sideMax - Math.abs(root.centerShift)))
    height: root.geometry.capsuleHeight
    clip: true
    sourceComponent: root.leftComponent
  }

  Loader {
    id: centerLoader
    anchors.centerIn: parent
    anchors.horizontalCenterOffset: root.centerShift
    width: Math.min(implicitWidth, root.geometry.centerWidth)
    height: root.geometry.capsuleHeight
    clip: true
    sourceComponent: root.centerComponent
  }

  Loader {
    id: rightLoader
    x: parent.width - root.geometry.edgeInset - width
    anchors.verticalCenter: parent.verticalCenter
    width: Math.min(implicitWidth, Math.max(0, root.geometry.sideMax - Math.abs(root.centerShift)))
    height: root.geometry.capsuleHeight
    clip: true
    sourceComponent: root.rightComponent
  }
}
