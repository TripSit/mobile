// ChatRoute.tsx

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { WebView } from 'react-native-webview';

const ChatRoute = () => {
  const theme = useTheme();
  const screenHeight = Dimensions.get('window').height;

  // JavaScript to remove all elements except the "root" div
  const injectedJavaScript = `
    (function() {
      var root = document.getElementById('root');
      if (root) {
        document.body.innerHTML = '';
        document.body.appendChild(root);
      }
      true; // Note: This is required for the injectedJavaScript to execute properly
    })();
  `;

  return (
    <Surface style={styles.container}>
      <WebView
        source={{ uri: 'https://tripsit.me/webchat' }}
        style={styles.webview}
        javaScriptEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={injectedJavaScript}
        // Optionally, handle navigation state changes
        // onNavigationStateChange={(navState) => { /* Handle navigation changes */ }}
        // Optionally, handle errors
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Adjust based on theme if necessary
  },
  webview: {
    flex: 1,
  },
});

export default ChatRoute;
