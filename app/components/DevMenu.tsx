import React from 'react';
import { Portal, Modal, List, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRST_LAUNCH_KEY, APP_VERSION_KEY } from '../utils/version';

export interface DevMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onResetFirstLaunch?: () => void;
}

export default function DevMenu({ visible, onDismiss, onResetFirstLaunch }: DevMenuProps) {
  const theme = useTheme();

  const handleResetFirstLaunch = async () => {
    try {
      await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
      await AsyncStorage.removeItem(APP_VERSION_KEY);
      if (onResetFirstLaunch) {
        onResetFirstLaunch();
      } else {
        onDismiss();
      }
    } catch (error) {
      console.error('Error resetting first launch:', error);
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          padding: 20,
          margin: 20,
          borderRadius: 8,
        }}
      >
        <List.Section>
          <List.Subheader>Development Options</List.Subheader>
          <List.Item
            title="Reset to First Launch"
            left={props => <List.Icon {...props} icon="refresh" />}
            onPress={handleResetFirstLaunch}
          />
          <List.Item
            title="Close Menu"
            left={props => <List.Icon {...props} icon="close" />}
            onPress={onDismiss}
          />
        </List.Section>
      </Modal>
    </Portal>
  );
} 