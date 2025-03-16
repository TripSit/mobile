import React, { useState, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions, Animated, Alert } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SlideType = {
  title: string;
  description: string;
  animation: any;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const slides: SlideType[] = [
  {
    title: 'Welcome to TripSit',
    description: 'Your trusted companion for harm reduction and safety information.',
    animation: require('./assets/animations/welcome.json'),
    icon: 'heart-pulse',
  },
  {
    title: 'Reliable Information',
    description: 'Access verified drug information and interaction data, even offline.',
    animation: require('./assets/animations/info.json'),
    icon: 'book-open-variant',
  },
  {
    title: 'Stay Safe',
    description: 'Get dosage guidelines, duration information, and safety tips.',
    animation: require('./assets/animations/safety.json'),
    icon: 'shield-check',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (forward: boolean) => {
    // Fade out
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: forward ? -50 : 50,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      animateTransition(true);
      setTimeout(() => setCurrentSlide(currentSlide + 1), 200);
    }
  };

  const goToInstall = () => {
    if (navigating) return;
    
    console.log("🔴 ATTEMPTING TO NAVIGATE TO INSTALL SCREEN");
    
    try {
      setNavigating(true);
      
      // Use setTimeout to ensure the state update is processed
      setTimeout(() => {
        console.log("🔴 NAVIGATION TIMEOUT COMPLETE, PUSHING TO INSTALL SCREEN");
        
        // Force direct navigation to install screen
        router.replace('/onboarding/install');
        
        // If we somehow get here without an error, we'll show a fallback alert
        setTimeout(() => {
          if (navigating) {
            console.log("🔴 NAVIGATION APPEARS TO HAVE FAILED, SHOWING ALERT");
            Alert.alert(
              "Navigation Issue",
              "There was a problem navigating to the installation screen. Please restart the app.",
              [{ text: "OK", onPress: () => setNavigating(false) }]
            );
          }
        }, 2000);
      }, 100);
      
    } catch (error) {
      console.error('🔴 NAVIGATION ERROR:', error);
      setNavigating(false);
      
      Alert.alert(
        "Navigation Error",
        "An error occurred while trying to navigate to the installation screen. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      animateTransition(false);
      setTimeout(() => setCurrentSlide(currentSlide - 1), 200);
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <View style={styles.mainContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name={slides[currentSlide].icon}
              size={48}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.animationContainer}>
            <LottieView
              source={slides[currentSlide].animation}
              autoPlay
              loop
              style={styles.animation}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Animatable.View 
          style={styles.textContainer}
          animation="fadeIn"
          duration={500}
        >
          <Text 
            variant="headlineMedium" 
            style={[styles.title, { color: theme.colors.primary }]}
          >
            {slides[currentSlide].title}
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.description, { color: theme.colors.onSurface }]}
          >
            {slides[currentSlide].description}
          </Text>
        </Animatable.View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <Animatable.View
                key={index}
                animation={currentSlide === index ? "rubberBand" : undefined}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: theme.colors.primary,
                    width: currentSlide === index ? 20 : 10,
                    opacity: currentSlide === index ? 1 : 0.5,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentSlide > 0 && (
              <Button
                mode="outlined"
                onPress={goToPreviousSlide}
                style={[styles.button, styles.backButton]}
                contentStyle={styles.buttonContent}
                disabled={navigating}
              >
                Back
              </Button>
            )}
            {currentSlide < slides.length - 1 ? (
              <Button
                mode="contained"
                onPress={goToNextSlide}
                style={[styles.button, currentSlide === 0 ? styles.singleButton : styles.nextButton]}
                contentStyle={styles.buttonContent}
                disabled={navigating}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={goToInstall}
                style={[styles.button, styles.nextButton]}
                contentStyle={styles.buttonContent}
                loading={navigating}
                disabled={navigating}
              >
                Get Started
              </Button>
            )}
          </View>
        </View>
      </Animated.View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  iconContainer: {
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  animationContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 10,
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  singleButton: {
    width: '80%',
  },
}); 