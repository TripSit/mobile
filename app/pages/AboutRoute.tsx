import React, { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  IconButton,
  Surface,
  Divider,
  Button,
  ActivityIndicator,
  Portal,
  Snackbar,
  Modal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import ConfettiCannon from 'react-native-confetti-cannon';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRST_LAUNCH_KEY, APP_VERSION_KEY, APP_VERSION, SHOW_PATCH_LOGS_KEY } from '../utils/version';

const { height } = Dimensions.get('window');

export default function AboutRoute() {
  const theme = useTheme();
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [eyeClickCount, setEyeClickCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Dev menu state
  const [devNameClickCount, setDevNameClickCount] = useState(0);
  const [showDevMenu, setShowDevMenu] = useState(false);
  
  // Patch notes state
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [patchNotesText, setPatchNotesText] = useState('');
  
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate initial last sync time
    setLastSync(new Date().toLocaleString());
    
    // Load patch notes
    loadPatchNotes();
  }, []);

  const loadPatchNotes = async () => {
    // Updated patch notes to version 2.1 with all the recent changes
    setPatchNotesText(
      "Version 2.1.0:\n\n" +
      "• Completely redesigned installation screen with step indicators\n" +
      "• Removed top navigation bar for a cleaner interface\n" +
      "• Added developer options accessible via hidden menu\n" +
      "• Integrated patch notes directly into the About section\n" +
      "• Fixed animation sizing issues in various screens\n" +
      "• Improved onboarding flow and welcome screens\n" +
      "• Enhanced overall UI with Material Design 3 principles\n\n" +
      
      "Version 1.1.0:\n\n" +
      "• Improved UI/UX with Material Design 3\n" +
      "• Added welcome screen and onboarding flow\n" +
      "• Fixed bugs in drug information display\n" +
      "• Enhanced search functionality\n\n" +
      
      "Version 1.0.0:\n\n" +
      "• Initial release of TripSit mobile app\n" +
      "• Added drug information database\n" +
      "• Implemented combo checker for drug interactions\n" +
      "• Created offline mode for critical information"
    );
  };

  const handleEasterEgg = () => {
    setEasterEggCount(prev => prev + 1);
    if (easterEggCount >= 5) {
      setShowSecret(true);
      setSnackbarMessage('🎉 You found the secret trophy!');
      setShowSnackbar(true);
    }
  };

  const handleEyeClick = () => {
    setEyeClickCount(prev => prev + 1);
    if (eyeClickCount >= 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setEyeClickCount(0);
    }
  };

  const handleDevNameClick = () => {
    setDevNameClickCount(prev => prev + 1);
    
    if (devNameClickCount >= 4) {
      // Reset and show dev menu
      setDevNameClickCount(0);
      setShowDevMenu(true);
      setSnackbarMessage('🛠️ Developer menu activated');
      setShowSnackbar(true);
    } else if (devNameClickCount >= 2) {
      // Give feedback after a few clicks
      setSnackbarMessage(`${5 - devNameClickCount} more clicks to unlock developer options...`);
      setShowSnackbar(true);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setSnackbarMessage('Refreshing offline data...');
    setShowSnackbar(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLastSync(new Date().toLocaleString());
    setIsRefreshing(false);
    setSnackbarMessage('Offline data updated successfully!');
    setShowSnackbar(true);
  };
  
  const resetAppData = async () => {
    try {
      setSnackbarMessage('Clearing all app data...');
      setShowSnackbar(true);
      
      // Clear all app data
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      await AsyncStorage.removeItem(APP_VERSION_KEY);
      console.log('🔧 DEV: App data cleared - First launch set to true');
      
      // Close dev menu
      setShowDevMenu(false);
      
      // Delay before redirect to let the user see the snackbar
      setTimeout(() => {
        console.log('🔧 DEV: Redirecting to onboarding after clearing data');
        router.replace('/onboarding');
      }, 1500);
    } catch (error) {
      console.error('Error resetting app data:', error);
      setSnackbarMessage('Failed to clear app data');
      setShowSnackbar(true);
    }
  };
  
  const forceInstallScreen = () => {
    setShowDevMenu(false);
    router.replace('/onboarding/install');
  };
  
  const forceOnboarding = () => {
    setShowDevMenu(false);
    router.replace('/onboarding');
  };

  // Add function to show patch logs from dev menu
  const showPatchLogsFromDevMenu = () => {
    setShowDevMenu(false);
    setTimeout(() => setShowPatchNotes(true), 300);
  };

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineMedium" style={[styles.headerText, { color: theme.colors.primary }]}>
            About TripSit
          </Text>
          <IconButton
            icon="eye"
            size={24}
            onPress={handleEyeClick}
            style={styles.eyeIcon}
            iconColor={theme.colors.onSurface}
          />
        </Surface>

        <Card style={styles.card} mode="contained">
          <Card.Title
            title="Our Origins"
            titleStyle={styles.cardTitle}
            left={(props) => <MaterialCommunityIcons {...props} name="history" size={24} color={theme.colors.primary} />}
            right={(props) => (
              <Animated.View style={{ transform: [{ translateY }] }}>
                <IconButton {...props} icon="trophy" onPress={handleEasterEgg} />
              </Animated.View>
            )}
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium">
              TripSit began in 2011 as an IRC channel providing drug safety and harm reduction services, 
              allowing people to chat anonymously about drugs in a safe environment.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="contained">
          <Card.Title
            title="Our Mission"
            titleStyle={styles.cardTitle}
            left={(props) => <MaterialCommunityIcons {...props} name="target" size={24} color={theme.colors.primary} />}
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium">
              Supporting responsible drug use through education and harm reduction strategies.
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card} mode="contained">
          <Card.Title
            title="What's New"
            titleStyle={styles.cardTitle}
            left={(props) => <MaterialCommunityIcons {...props} name="new-box" size={24} color={theme.colors.primary} />}
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium">
              Check out the latest updates and improvements to the app.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowPatchNotes(true)}
              style={styles.button}
            >
              View Update History
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="contained">
          <Card.Title
            title="Need Help?"
            titleStyle={styles.cardTitle}
            left={(props) => <MaterialCommunityIcons {...props} name="help-circle" size={24} color={theme.colors.primary} />}
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium">
              Visit{' '}
              <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
                chat.tripsit.me
              </Text>
              {' '}for immediate assistance from our trained team.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="contained">
          <Card.Title
            title="Offline Data"
            titleStyle={styles.cardTitle}
            left={(props) => <MaterialCommunityIcons {...props} name="database" size={24} color={theme.colors.primary} />}
            right={(props) => (
              <IconButton
                {...props}
                icon="refresh"
                onPress={handleRefreshData}
                disabled={isRefreshing}
              />
            )}
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium">
              Last synchronized: {lastSync || 'Never'}
            </Text>
            {isRefreshing && (
              <ActivityIndicator style={styles.loader} />
            )}
          </Card.Content>
        </Card>

        {showSecret && (
          <Card style={[styles.card, styles.secretCard, { backgroundColor: theme.colors.primary }]} mode="contained">
            <Card.Content>
              <Text variant="bodyMedium" style={styles.secretText}>
                🎉 You Found a Secret! Here's a virtual hug 🤗
              </Text>
            </Card.Content>
          </Card>
        )}

        <Surface style={[styles.footer, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <TouchableOpacity onPress={handleDevNameClick}>
            <Text variant="labelSmall" style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
              Made with ❤️ by Sympact06 for TripSit
            </Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>

      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}
      
      {/* Developer Menu Modal */}
      <Portal>
        <Modal
          visible={showDevMenu}
          onDismiss={() => setShowDevMenu(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.devMenuContainer}>
            <Text variant="headlineSmall" style={styles.devMenuTitle}>
              Developer Options
            </Text>
            <Divider style={{ marginVertical: 10 }} />
            
            <Button
              mode="contained"
              icon="refresh"
              onPress={resetAppData}
              style={styles.devButton}
            >
              Clear All Data (Reset App)
            </Button>
            
            <Button
              mode="contained"
              icon="rocket-launch"
              onPress={forceOnboarding}
              style={styles.devButton}
            >
              Show Welcome Screens
            </Button>
            
            <Button
              mode="contained"
              icon="download"
              onPress={forceInstallScreen}
              style={styles.devButton}
            >
              Show Installation Screen
            </Button>
            
            <Button
              mode="contained"
              icon="notebook"
              onPress={showPatchLogsFromDevMenu}
              style={styles.devButton}
            >
              Show Patch Notes
            </Button>
            
            <Button
              mode="outlined"
              icon="close"
              onPress={() => setShowDevMenu(false)}
              style={styles.devButton}
            >
              Close
            </Button>
          </Surface>
        </Modal>
      </Portal>
      
      {/* Patch Notes Modal */}
      <Portal>
        <Modal
          visible={showPatchNotes}
          onDismiss={() => setShowPatchNotes(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.patchNotesContainer}>
            <View style={styles.patchNotesHeader}>
              <Text variant="headlineSmall" style={styles.patchNotesTitle}>
                Update History
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPatchNotes(false)}
              />
            </View>
            <Divider />
            
            <ScrollView style={styles.patchNotesScroll}>
              <Text variant="bodyMedium" style={styles.patchNotesText}>
                {patchNotesText}
              </Text>
            </ScrollView>
            
            <Divider />
            <View style={styles.patchNotesFooter}>
              <Button
                mode="contained"
                onPress={() => setShowPatchNotes(false)}
              >
                Close
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontWeight: 'bold',
  },
  eyeIcon: {
    position: 'absolute',
    right: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    paddingVertical: 16,
  },
  secretCard: {
    // Remove hardcoded background color
  },
  secretText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 16,
  },
  footerText: {
    // Remove hardcoded color
  },
  loader: {
    marginTop: 8,
  },
  snackbar: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
  modalContainer: {
    padding: 20,
    marginHorizontal: 20,
  },
  devMenuContainer: {
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  devMenuTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  devButton: {
    marginVertical: 8,
  },
  patchNotesContainer: {
    borderRadius: 12,
    elevation: 5,
    maxHeight: height * 0.7,
  },
  patchNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  patchNotesTitle: {
    fontWeight: 'bold',
  },
  patchNotesScroll: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  patchNotesText: {
    lineHeight: 24,
  },
  patchNotesFooter: {
    padding: 16,
    alignItems: 'center',
  },
});
