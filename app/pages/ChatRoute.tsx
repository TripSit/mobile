import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, useTheme } from 'react-native-paper';

const ChatRoute = () => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        <MaterialCommunityIcons name="chat" size={100} color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.onSurface }]}>Coming Soon</Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  surface: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 24,
    marginTop: 20,
  },
});

export default ChatRoute;