export default {
  expo: {
    name: "projectSags",
    slug: "projectSags",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "projectSags",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    ios: {
      bundleIdentifier: "com.usuhbayr.projectSags",
      entitlements: {
        "aps-environment": "development",
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Allow access to location to show nearby places.",
        NSCameraUsageDescription: "Allow access to the camera.",
        NSMicrophoneUsageDescription: "Allow access to the microphone.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
      },
      predictiveBackGestureEnabled: false,
      package: "com.usuhbayr.projectSags",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/adaptive-icon1.png",
            imageWidth: 76,
          },
        },
      ],
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "zaalproject",
        },
      ],
      "expo-dev-client",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.4",
          },
        },
      ],
      "expo-localization",
      [
        "react-native-fbsdk-next",
        {
          appID: process.env.FACEBOOK_APP_ID || "8534089993319728",
          clientToken: process.env.FACEBOOK_CLIENT_ID,
          displayName: "Login with Facebook",
          scheme: `fb${process.env.FACEBOOK_APP_ID}`,
          advertiserIDCollectionEnabled: false,
          autoLogAppEventsEnabled: false,
          isAutoInitEnabled: true,
          iosUserTrackingPermission:
            "This identifier will be used to deliver personalized ads to you.",
        },
      ],
    ],
    experiments: {
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "dba4003f-454c-4ea3-af94-4328a2d590ac",
      },
    },
    owner: "usuhbayr",
  },
};
