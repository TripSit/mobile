import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { lightTheme, darkTheme } from './themes';
import HomeScreen from './pages/HomeScreen';

export default function Index() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        {/* @ts-expect-error Theme prop has incomplete type definitions in HomeScreen component */}
        <HomeScreen theme={theme} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
