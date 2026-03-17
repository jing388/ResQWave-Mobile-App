// app.config.js
module.exports = {
  name: 'ResQWave-Mobile',
  slug: 'ResQWave-Mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'resqwavemobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png'
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.anonymous.ResQWaveMobile',
    softwareKeyboardLayoutMode: 'pan',
    config: {
      googleMaps: {
        apiKey: 'AIzaSyCCv2zW0RiZMKTNz3QGl3sP6LCAwZ_B_VQ'
      }
    }
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000'
        }
      }
    ],
    'expo-font'
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },
  extra: {
    eas: {
      projectId: 'e3de431e-03b5-4d1d-88d0-c1a9194177ad'
    }
  }
};
