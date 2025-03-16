import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Button, Surface, useTheme, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { Stack, router } from 'expo-router';

// Storage keys
const FIRST_LAUNCH_KEY = 'tripsit_first_launch';
const SHOW_PATCH_LOGS_KEY = 'tripsit_show_patch_logs';
const APP_VERSION_KEY = 'tripsit_app_version';

// Current app version
const APP_VERSION = '1.0.0'; // Make sure this matches your package.json version

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  animation: string;
}

export default function WelcomeScreen() {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [installProgress, setInstallProgress] = useState(0);
  const [showPatchLogs, setShowPatchLogs] = useState(true);
  const animation = useRef<LottieView>(null);

  const fadeIn = {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
  };

  const startInstallation = () => {
    setCurrentStep(1);
    // Simulate installation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      setInstallProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        // Wait a moment after completion
        setTimeout(() => {
          completeOnboarding();
        }, 500);
      }
    }, 50);
  };

  const completeOnboarding = async () => {
    try {
      // Save first launch completed
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      // Save version
      await AsyncStorage.setItem(APP_VERSION_KEY, APP_VERSION);
      // Save patch logs preference
      await AsyncStorage.setItem(SHOW_PATCH_LOGS_KEY, showPatchLogs ? 'true' : 'false');
      
      // Navigate to the main app
      router.replace('/');
    } catch (e) {
      console.error('Failed to save onboarding state', e);
    }
  };

  const slides: Slide[] = [
    {
      title: 'Welcome to TripSit',
      description: 'Your trusted companion for safer substance use information.',
      animation: 'https://assets5.lottiefiles.com/packages/lf20_aittffeu.json',
    },
    {
      title: 'Harm Reduction',
      description: 'Access reliable information about substances and their interactions.',
      animation: 'https://assets9.lottiefiles.com/packages/lf20_g7ycpndc.json',
    },
    {
      title: 'Always Available',
      description: 'We\'re here to help when you need reliable information, anytime.',
      animation: 'https://assets3.lottiefiles.com/private_files/lf30_fup8qnr3.json',
    },
  ];

  const renderOnboardingSlides = () => {
    return (
      <View style={styles.slidesContainer}>
        <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
        
        <Animatable.View 
          animation="fadeIn" 
          duration={1000} 
          style={styles.animationContainer}
        >
          <LottieView
            ref={animation}
            source={{ uri: slides[currentStep].animation }}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animatable.View>
        
        <Animatable.View 
          animation={fadeIn} 
          duration={800} 
          delay={300}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {slides[currentStep].title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurface }]}>
            {slides[currentStep].description}
          </Text>
        </Animatable.View>
        
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { 
                  backgroundColor: index === currentStep 
                    ? theme.colors.primary 
                    : theme.colors.surfaceVariant 
                }
              ]}
            />
          ))}
        </View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          style={styles.buttonContainer}
        >
          {currentStep < slides.length - 1 ? (
            <Button 
              mode="contained" 
              onPress={() => setCurrentStep(currentStep + 1)}
              style={styles.button}
            >
              Next
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={startInstallation}
              style={styles.button}
            >
              Continue
            </Button>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderInstallation = () => {
    return (
      <Surface style={styles.installContainer} elevation={0}>
        <Stack.Screen options={{ title: 'Installing', headerShown: false }} />
        
        <Animatable.View animation="fadeIn" duration={1000}>
          <LottieView
            source={{ uri: 'https://assets3.lottiefiles.com/packages/lf20_lx3q0bnq.json' }}
            autoPlay
            loop
            style={styles.installAnimation}
          />
        </Animatable.View>
        
        <Animatable.View 
          animation={fadeIn} 
          duration={800} 
          style={styles.installTextContainer}
        >
          <Text style={[styles.installTitle, { color: theme.colors.primary }]}>
            Installing Drug & Combination Definitions
          </Text>
          <Text style={[styles.installDescription, { color: theme.colors.onSurface }]}>
            Downloading the latest information for offline use...
          </Text>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={installProgress} 
              color={theme.colors.primary} 
              style={styles.progressBar} 
            />
            <Text style={[styles.progressText, { color: theme.colors.onSurface }]}>
              {Math.round(installProgress * 100)}%
            </Text>
          </View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          style={styles.patchLogContainer}
        >
          <Text style={[styles.patchLogTitle, { color: theme.colors.onSurface }]}>
            Show patch notes after updates?
          </Text>
          <Button
            mode={showPatchLogs ? "contained" : "outlined"}
            onPress={() => setShowPatchLogs(true)}
            style={styles.patchButton}
          >
            Yes
          </Button>
          <Button
            mode={!showPatchLogs ? "contained" : "outlined"}
            onPress={() => setShowPatchLogs(false)}
            style={styles.patchButton}
          >
            No
          </Button>
        </Animatable.View>
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {currentStep < slides.length ? renderOnboardingSlides() : renderInstallation()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animationContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    borderRadius: 25,
    paddingVertical: 6,
  },
  installContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  installAnimation: {
    width: width * 0.6,
    height: width * 0.6,
  },
  installTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  installTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  installDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  },
  patchLogContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  patchLogTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  patchButton: {
    marginVertical: 5,
    width: 200,
    borderRadius: 25,
  },
}); 