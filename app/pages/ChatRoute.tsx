import * as React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const ChatRoute = () => {
  return (
    <WebView
      source={{ uri: 'https://chat.tripsit.me/?react=true' }}
      style={styles.webview}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default ChatRoute;
