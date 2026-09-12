import QtQuick
import qs.Commons

QtObject {
  readonly property int stripHeight: 40
  readonly property int capsuleHeight: 30
  readonly property int edgeInset: 20
  readonly property int compactEdgeInset: 12
  readonly property int clusterGap: 15
  readonly property int compactGap: 8
  readonly property int capsulePadding: 8
  readonly property int radius: 15
  readonly property color stripColor: Color.bar.background
  readonly property color foreground: Color.bar.text
  readonly property color accent: Color.accent
  // Opaque, lightly lifted surface: readable on wallpaper without neon rings.
  readonly property color capsuleTop: Qt.rgba(
    Color.bar.background.r * 0.96 + Color.bar.text.r * 0.04,
    Color.bar.background.g * 0.96 + Color.bar.text.g * 0.04,
    Color.bar.background.b * 0.96 + Color.bar.text.b * 0.04, 1)
  readonly property color capsuleBottom: Qt.rgba(Color.accent.r, Color.accent.g, Color.accent.b, 0.20)
  readonly property color capsuleBorder: Qt.rgba(Color.accent.r, Color.accent.g, Color.accent.b, 0.58)
}
