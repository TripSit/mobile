import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from './themes';
import HomeScreen from './pages/HomeScreen';

export default function Index() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <HomeScreen theme={theme} />
    </PaperProvider>
  );
}