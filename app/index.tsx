import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import { lightTheme, darkTheme } from './themes';
import HomeScreen from './pages/HomeScreen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import DrugDetailScreen from './components/DrugDetail';
import { initializeAnalytics } from './utils/analytics';

const Stack = createSharedElementStackNavigator();

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Initialize analytics when the app starts
  React.useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <HomeScreen />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
