import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import React from 'react';
import { View, Text } from 'react-native';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: '#FFFBFE',
    onBackground: '#1C1B1F',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    inverseOnSurface: '#F4EFF4',
    inverseSurface: '#313033',
    inversePrimary: '#D0BCFF',
    shadow: '#000000',
    surfaceTint: '#6750A4',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6200EE',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: '#1C1B1F',
    onBackground: '#E6E1E5',
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
    inverseOnSurface: '#1C1B1F',
    inverseSurface: '#E6E1E5',
    inversePrimary: '#6750A4',
    shadow: '#000000',
    surfaceTint: '#D0BCFF',
  },
};

export default function Themes() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Theme Configuration</Text>
    </View>
  );
}