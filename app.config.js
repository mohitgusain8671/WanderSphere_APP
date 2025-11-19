import 'dotenv/config';

export default {
  expo: {
    name: 'WanderSphere',
    slug: 'MyApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.mohit8671.MyApp',
    },
    web: {
      output: 'static',
      favicon: './assets/images/icon.png',
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    // ✅ Inject environment variables here
    extra: {
      apiHost: process.env.EXPO_PUBLIC_API_HOST || 'http://localhost:5000',
      router: {},
      eas: {
        projectId: 'aa4dd909-a918-4a11-a5a8-28d3d95673d8',
      },
    },
  },
};
