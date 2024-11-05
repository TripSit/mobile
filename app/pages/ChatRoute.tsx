import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { WebView } from 'react-native-webview';

const ChatRoute = () => {
  const injectedJavaScript = `
    (function() {
      // Remove header and footer elements
      var header = document.getElementById('header');
      var footer = document.getElementById('footer');
      if (header) header.parentNode.removeChild(header);
      if (footer) footer.parentNode.removeChild(footer);

      // Remove any padding or margin from the body
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';

      // Set HTML and body height to 100%
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';

      // Adjust the main content area to fill the viewport
      var root = document.getElementById('__next');
      if (root) {
        root.style.height = '100%';
      }

      // Adjust the chat container to fill the viewport
      var chatContainer = document.getElementById('webchat');
      if (chatContainer) {
        chatContainer.style.position = 'fixed';
        chatContainer.style.top = '0';
        chatContainer.style.left = '0';
        chatContainer.style.width = '100%';
        chatContainer.style.height = '100%';
        chatContainer.style.zIndex = '9999';
        chatContainer.style.backgroundColor = 'transparent'; // Ensure no background color
      }

      // Remove any background color from the main element to prevent black space
      var main = document.querySelector('main');
      if (main) {
        main.style.backgroundColor = 'transparent';
        main.style.margin = '0';
        main.style.padding = '0';
      }

      // Inject CSS to ensure no top margin or padding
      var style = document.createElement('style');
      style.innerHTML = \`
        html, body, #__next, #webchat {
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        main {
          background-color: transparent !important;
        }
      \`;
      document.head.appendChild(style);

      true; // Required for the injectedJavaScript to execute properly
    })();
  `;

  return (
    <Surface style={styles.container}>
      <WebView
        source={{ uri: 'https://tripsit.me/webchat' }}
        style={styles.webview}
        javaScriptEnabled={true}
        injectedJavaScript={injectedJavaScript}
        startInLoadingState={true}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
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
    backgroundColor: '#FFFFFF', 
  },
  webview: {
    flex: 1,
  },
});

export default ChatRoute;
