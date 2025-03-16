import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './pages/HomeScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import PatchLogsScreen from './pages/PatchLogsScreen';
import { useTheme } from 'react-native-paper';

// Storage keys
const FIRST_LAUNCH_KEY = 'tripsit_first_launch';
const SHOW_PATCH_LOGS_KEY = 'tripsit_show_patch_logs';
const APP_VERSION_KEY = 'tripsit_app_version';

// Current app version - make sure this matches your package.json and PatchLogsScreen
const APP_VERSION = '1.0.0';

export default function Index() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [shouldShowPatchNotes, setShouldShowPatchNotes] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Check if it's first launch
      const firstLaunchValue = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      const isFirstTime = firstLaunchValue === null;
      
      if (isFirstTime) {
        setIsFirstLaunch(true);
        setIsLoading(false);
        return;
      }
      
      // Check if we should show patch notes
      const showPatchLogs = await AsyncStorage.getItem(SHOW_PATCH_LOGS_KEY);
      const lastVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
      
      // If version is different and user wants to see patch notes
      if (lastVersion !== APP_VERSION && showPatchLogs === 'true') {
        setShouldShowPatchNotes(true);
      }
      
      setIsLoading(false);
    } catch (e) {
      console.error('Error checking app state:', e);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isFirstLaunch) {
    return <WelcomeScreen />;
  }
  
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
