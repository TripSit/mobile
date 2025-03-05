import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import { lightTheme, darkTheme } from './themes';
import HomeScreen from './pages/HomeScreen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import DrugDetailScreen from './components/DrugDetail';

const Stack = createSharedElementStackNavigator();

export default function Index() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <HomeScreen />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
