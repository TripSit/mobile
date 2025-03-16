import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const FIRST_LAUNCH_KEY = 'tripsit_first_launch';
export const SHOW_PATCH_LOGS_KEY = 'tripsit_show_patch_logs';
export const APP_VERSION_KEY = 'tripsit_app_version';

// Current app version - update this when releasing new versions
export const APP_VERSION = '1.0.0';

export interface PatchNote {
  version: string;
  title: string;
  date: string;
  notes: string[];
}

// Add new patch notes here when releasing updates
export const PATCH_NOTES: PatchNote[] = [
  {
    version: '1.0.0',
    title: 'Initial Release',
    date: 'April 2024',
    notes: [
      'Initial release of the TripSit mobile app',
      'Access to drug information database',
      'Drug combination safety checker',
      'Easy-to-use interface with Material Design 3',
      'Welcome screen for first time users',
    ],
  },
  // Add new versions above this line
];

interface AppState {
  isFirstLaunch: boolean;
  shouldShowPatchNotes: boolean;
}

export async function checkAppState(): Promise<AppState> {
  try {
    const storedFirstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    const storedVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
    const showPatchLogs = await AsyncStorage.getItem(SHOW_PATCH_LOGS_KEY);

    // Check if it's first launch
    if (storedFirstLaunch === null) {
      return { isFirstLaunch: true, shouldShowPatchNotes: false };
    }

    // Check if it's an update
    if (storedVersion !== APP_VERSION && showPatchLogs === 'true') {
      return { isFirstLaunch: false, shouldShowPatchNotes: true };
    }

    return { isFirstLaunch: false, shouldShowPatchNotes: false };
  } catch (e) {
    console.error('Error checking app state:', e);
    return { isFirstLaunch: true, shouldShowPatchNotes: false };
  }
}

// Add a default export to satisfy TypeScript
export default checkAppState;

export const markVersionSeen = async () => {
  try {
    await AsyncStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    return true;
  } catch (e) {
    console.error('Failed to mark version as seen:', e);
    return false;
  }
};

export const setPatchLogsPreference = async (shouldShow: boolean) => {
  try {
    await AsyncStorage.setItem(SHOW_PATCH_LOGS_KEY, shouldShow ? 'true' : 'false');
    return true;
  } catch (e) {
    console.error('Failed to save patch logs preference:', e);
    return false;
  }
};

export const getPatchLogsPreference = async () => {
  try {
    const preference = await AsyncStorage.getItem(SHOW_PATCH_LOGS_KEY);
    return preference !== 'false'; // Default to true if not set
  } catch (e) {
    console.error('Failed to get patch logs preference:', e);
    return true; // Default to true on error
  }
};

// For development only
export const resetAppState = async () => {
  try {
    await AsyncStorage.multiRemove([
      FIRST_LAUNCH_KEY,
      APP_VERSION_KEY,
      SHOW_PATCH_LOGS_KEY,
    ]);
    return true;
  } catch (e) {
    console.error('Failed to reset app state:', e);
    return false;
  }
}; 