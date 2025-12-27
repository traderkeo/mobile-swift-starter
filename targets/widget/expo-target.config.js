/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'HelloWidget',
  // Colors that can be used in SwiftUI with Color("colorName")
  colors: {
    // Accent color for widget edit mode
    $accent: '#0a7ea4',
    // Widget background color with light/dark mode support
    $widgetBackground: {
      light: '#ffffff',
      dark: '#1c1c1e',
    },
    // Custom brand color
    brandBlue: {
      light: '#0a7ea4',
      dark: '#5ac8fa',
    },
  },
  // Deployment target (iOS 17+ for newer widget features)
  deploymentTarget: '17.0',
};
