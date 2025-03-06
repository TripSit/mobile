import { Stack } from "expo-router";
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import Constants from 'expo-constants';
import { lightTheme, darkTheme } from './themes';
import { initializeAnalytics, useScreenTracking } from './utils/analytics';
import { useEffect } from 'react';

const API_KEY = Constants.expoConfig?.extra?.posthogPublicKey;
const API_HOST = Constants.expoConfig?.extra?.posthogHost;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Initialize analytics when the app starts
  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Track screen views
  useScreenTracking();

  return (
    <PostHogProvider 
      apiKey={API_KEY!}
      options={{
        host: API_HOST,
        sendFeatureFlagEvent: true,
        preloadFeatureFlags: true
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <Slot />
        </PaperProvider>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}