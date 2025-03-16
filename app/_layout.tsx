import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, Alert } from 'react-native';
import { Provider, Appbar, Button } from 'react-native-paper';
import { SplashScreen, Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { checkAppState, FIRST_LAUNCH_KEY, APP_VERSION_KEY } from './utils/version';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import themes from the correct location based on your project structure
import { lightTheme, darkTheme } from './themes';

// Force splash screen to be hidden manually
SplashScreen.preventAutoHideAsync().catch(() => {});

// Initialize LogRocket - with safety mechanism
if (!__DEV__) {
  try {
    // Dynamic import using require to prevent bundling issues
    const LogRocket = require('logrocket');
    const { Updates } = require('expo');
    
    // Check if LogRocket is properly loaded
    if (LogRocket && LogRocket.init) {
      console.log('Initializing LogRocket...');
      LogRocket.init('y07g6k/tripsit-mobile', { 
        updateId: Updates.isEmbeddedLaunch ? undefined : Updates.updateId
      });
      console.log('LogRocket initialized successfully');
    } else {
      console.warn('LogRocket is not available or init method missing');
    }
  } catch (error) {
    // Safely handle missing LogRocket dependency
    console.warn('LogRocket initialization failed:', error);
  }
}

export default function Layout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  // App state
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  
  useEffect(() => {
    console.log("🔵 LAYOUT MOUNTED - CHECKING APP STATE");
    
    async function checkInitialState() {
      try {
        // Check directly from AsyncStorage for most accurate state
        const firstLaunchValue = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        const firstLaunch = firstLaunchValue === 'true' || firstLaunchValue === null;
        
        console.log(`🔵 APP STATE CHECK COMPLETE: First Launch Value: ${firstLaunchValue}, Is First Launch: ${firstLaunch}`);
        
        if (firstLaunch) {
          console.log("🔵 FIRST LAUNCH DETECTED - SHOWING ONBOARDING");
          setIsFirstLaunch(true);
        }
        
        // Hide splash screen after we've checked the state
        setIsLoading(false);
        SplashScreen.hideAsync().catch(() => {});
      } catch (error) {
        console.error("🔵 ERROR CHECKING APP STATE:", error);
        // Default to not first launch on error
        setIsFirstLaunch(false);
        setIsLoading(false);
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    
    checkInitialState();
  }, []);
  
  // Handle first launch by redirecting to onboarding
  useEffect(() => {
    if (!isLoading && isFirstLaunch) {
      console.log("🔵 REDIRECTING TO ONBOARDING");
      router.replace('/onboarding');
    }
  }, [isLoading, isFirstLaunch]);
  
  // Show loading screen while checking app state
  if (isLoading) {
    return (
      <Provider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Provider>
    );
  }

  return (
    <Provider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            // Hide the header/top bar from all screens
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          {/* Main app screens */}
          <Stack.Screen
            name="index"
            options={{
              title: 'TripSit',
            }}
          />
          
          {/* Onboarding screens - presented modally so they don't go back to home */}
          <Stack.Screen
            name="onboarding"
            options={{
              title: 'Welcome',
              presentation: 'modal',
              gestureEnabled: false, // prevent swipe gestures
            }}
          />
          
          <Stack.Screen
            name="onboarding/install"
            options={{
              title: 'Setup',
              presentation: 'modal',
              gestureEnabled: false, // prevent swipe gestures
              animation: 'slide_from_right', // force specific animation
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}