export default {
  expo: {
    name: "TripSit",
    slug: "tripsit",
    version: "1.0.0",
    scheme: "tripsit",
    extra: {
      posthogPublicKey: process.env.EXPO_PUBLIC_POSTHOG_KEY || "phc_nybI8ZUbk1MJalTcu7R821IBrpRcQSHYGSh0lg4JkdR",
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    },
    ios: {
      bundleIdentifier: "com.tripsit.mobile",
      buildNumber: "1.0.0",
    },
    android: {
      package: "com.tripsit.mobile",
      versionCode: 1,
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      tsconfigPaths: true,
      newArchEnabled: true
    }
  },
}; 