import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, BackHandler, Alert } from 'react-native';
import { Button, Surface, useTheme, ProgressBar, Switch, Card, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SHOW_PATCH_LOGS_KEY, APP_VERSION_KEY, APP_VERSION, FIRST_LAUNCH_KEY } from '../utils/version';

const { width, height } = Dimensions.get('window');

export default function InstallScreen() {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPatchLogs, setShowPatchLogs] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installSteps, setInstallSteps] = useState([
    { id: 1, text: 'Preparing database...', complete: false },
    { id: 2, text: 'Loading substance information...', complete: false },
    { id: 3, text: 'Setting up interaction data...', complete: false },
    { id: 4, text: 'Finalizing installation...', complete: false },
  ]);

  // Prevent going back during installation
  useEffect(() => {
    console.log("🟢 INSTALL SCREEN MOUNTED - ADDING BACK HANDLER");
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log("🟢 BACK BUTTON PRESSED - PREVENTING NAVIGATION");
      return true;
    });
    return () => {
      console.log("🟢 INSTALL SCREEN UNMOUNTING - REMOVING BACK HANDLER");
      backHandler.remove();
    }
  }, []);

  useEffect(() => {
    console.log('🟢 INSTALL SCREEN LOADED - BEGINNING SETUP');
    
    // Mark as not first launch immediately
    AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false')
      .then(() => {
        console.log('🟢 FIRST_LAUNCH_KEY SET TO FALSE');
      })
      .catch(err => {
        console.error('🟢 ERROR SETTING FIRST_LAUNCH_KEY:', err);
        setError('Failed to initialize app state.');
      });
    
    // Add a small delay before starting the installation
    const timer = setTimeout(() => {
      console.log('🟢 STARTING INSTALLATION PROCESS');
      setIsLoading(false);
      startInstallation();
    }, 1000);
    
    return () => {
      console.log('🟢 CLEANING UP INSTALL SCREEN TIMERS');
      clearTimeout(timer);
    }
  }, []);

  const startInstallation = () => {
    console.log('🟢 INSTALLATION STARTED - SIMULATING PROGRESS');
    
    // Simulate installation process with steps
    let currentProgress = 0;
    const stepSize = 1 / installSteps.length;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentProgress += 0.01;
      setProgress(currentProgress);
      
      // Update steps as installation progresses
      const stepThreshold = (currentStep + 1) * stepSize;
      if (currentProgress >= stepThreshold && currentStep < installSteps.length) {
        setInstallSteps(prev => 
          prev.map(step => 
            step.id === currentStep + 1 ? { ...step, complete: true } : step
          )
        );
        currentStep++;
      }
      
      if (currentProgress >= 1) {
        clearInterval(interval);
        console.log('🟢 INSTALLATION COMPLETE');
        setIsComplete(true);
      }
    }, 30);
  };

  const togglePatchLogs = async (value: boolean) => {
    console.log(`🟢 SETTING SHOW_PATCH_LOGS TO: ${value}`);
    setShowPatchLogs(value);
    
    try {
      await AsyncStorage.setItem(SHOW_PATCH_LOGS_KEY, value ? 'true' : 'false');
      console.log('🟢 PATCH LOGS PREFERENCE SAVED');
    } catch (err) {
      console.error('🟢 ERROR SAVING PATCH LOGS PREFERENCE:', err);
      Alert.alert('Settings Error', 'Failed to save patch logs preference.');
    }
  };

  const finishSetup = async () => {
    console.log('🟢 FINISHING SETUP - NAVIGATING TO HOME');
    try {
      setIsProcessing(true);
      
      // Save app version
      await AsyncStorage.setItem(APP_VERSION_KEY, APP_VERSION);
      console.log('🟢 APP VERSION SAVED:', APP_VERSION);
      
      // Navigate to main app with replace to prevent going back
      console.log('🟢 NAVIGATING TO HOME SCREEN');
      router.replace('/');
    } catch (error) {
      console.error('🟢 ERROR FINISHING SETUP:', error);
      setIsProcessing(false);
      Alert.alert('Setup Error', 'Failed to complete setup. Please try again.');
    }
  };

  if (error) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={60}
            color={theme.colors.error}
          />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/')}
            style={styles.button}
          >
            Go to Home
          </Button>
        </View>
      </Surface>
    );
  }

  if (isLoading) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
            Preparing installation...
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.installCard}>
          <Card.Title
            title={isComplete ? "Installation Complete" : "Installing TripSit"}
            titleStyle={styles.cardTitle}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name={isComplete ? "check-circle" : "download-circle"}
                size={30}
                color={theme.colors.primary}
              />
            )}
          />
          <Card.Content>
            {!isComplete ? (
              <View>
                <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
                  Setting up drug information database...
                </Text>
                <ProgressBar
                  progress={progress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text style={[styles.progressText, { color: theme.colors.onSurface }]}>
                  {Math.round(progress * 100)}%
                </Text>
                
                <View style={styles.stepsContainer}>
                  {installSteps.map((step) => (
                    <Animatable.View
                      key={step.id}
                      animation={step.complete ? "fadeIn" : undefined}
                      style={styles.stepRow}
                    >
                      <MaterialCommunityIcons
                        name={step.complete ? "check-circle" : "circle-outline"}
                        size={20}
                        color={step.complete ? theme.colors.primary : theme.colors.outline}
                      />
                      <Text 
                        style={[
                          styles.stepText, 
                          { 
                            color: step.complete ? theme.colors.onSurface : theme.colors.outline,
                            fontWeight: step.complete ? 'bold' : 'normal'
                          }
                        ]}
                      >
                        {step.text}
                      </Text>
                    </Animatable.View>
                  ))}
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.completedContainer}>
                  <Animatable.View
                    animation="bounceIn"
                    duration={1000}
                    style={styles.completeAnimation}
                  >
                    <LottieView
                      source={require('../assets/animations/complete.json')}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                      resizeMode="contain"
                      renderMode="HARDWARE"
                    />
                  </Animatable.View>
                  
                  <Animatable.Text
                    animation="fadeIn"
                    delay={500}
                    style={[styles.completedText, { color: theme.colors.onSurface }]}
                  >
                    Your app is ready to use!
                  </Animatable.Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <Animatable.View 
                  animation="fadeIn"
                  delay={800}
                  style={styles.settingsContainer}
                >
                  <Text style={[styles.settingsLabel, { color: theme.colors.onSurface }]}>
                    Would you like to see patch notes when updates are available?
                  </Text>
                  <View style={styles.settingsRow}>
                    <Text style={{ color: theme.colors.onSurface }}>
                      Show patch notes
                    </Text>
                    <Switch
                      value={showPatchLogs}
                      onValueChange={togglePatchLogs}
                      color={theme.colors.primary}
                    />
                  </View>
                </Animatable.View>
              </View>
            )}
          </Card.Content>
          
          {isComplete && (
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="contained"
                onPress={finishSetup}
                style={styles.continueButton}
                loading={isProcessing}
                disabled={isProcessing}
              >
                Get Started
              </Button>
            </Card.Actions>
          )}
        </Card>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  installCard: {
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  progressText: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    fontSize: 14,
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    marginLeft: 10,
    fontSize: 14,
  },
  completedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  completeAnimation: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '80%',
    height: '80%',
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  divider: {
    marginVertical: 16,
  },
  settingsContainer: {
    marginTop: 8,
  },
  settingsLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  continueButton: {
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  button: {
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
}); 