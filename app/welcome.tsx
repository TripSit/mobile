import React from 'react';
import { StyleSheet, View, Text, Dimensions, Image } from 'react-native';
import { Button, Surface, useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  animation: string;
}

const slides: Slide[] = [
  {
    title: 'Welcome to TripSit',
    description: 'Your trusted companion for harm reduction and substance information.',
    icon: 'hand-wave',
    animation: 'https://assets5.lottiefiles.com/packages/lf20_aittffeu.json',
  },
  {
    title: 'Harm Reduction First',
    description: 'Access reliable, factual information about substances and their interactions.',
    icon: 'shield-check',
    animation: 'https://assets9.lottiefiles.com/packages/lf20_g7ycpndc.json',
  },
  {
    title: 'Community Support',
    description: 'Join our supportive community on Discord and IRC for real-time assistance.',
    icon: 'account-group',
    animation: 'https://assets3.lottiefiles.com/packages/lf20_touohxv0.json',
  },
  {
    title: 'Always Available',
    description: 'Access critical information anytime, even offline.',
    icon: 'clock-check',
    animation: 'https://assets3.lottiefiles.com/private_files/lf30_fup8qnr3.json',
  },
];

export default function Welcome() {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/(welcome)/install' as any);
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* TripSit Logo */}
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        style={styles.logoContainer}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animatable.View>

      {/* Main Content */}
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        style={styles.contentContainer}
      >
        {/* Icon */}
        <Animatable.View 
          animation="zoomIn" 
          duration={800} 
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons
            name={slides[currentSlide].icon}
            size={60}
            color={theme.colors.primary}
          />
        </Animatable.View>

        {/* Animation */}
        <Animatable.View 
          animation="fadeIn" 
          duration={1000} 
          style={styles.animationContainer}
        >
          <LottieView
            source={{ uri: slides[currentSlide].animation }}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animatable.View>

        {/* Text Content */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {slides[currentSlide].title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurface }]}>
            {slides[currentSlide].description}
          </Text>
        </Animatable.View>
      </Animatable.View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentSlide 
                  ? theme.colors.primary 
                  : theme.colors.surfaceVariant,
                width: index === currentSlide ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={800} 
        style={styles.buttonContainer}
      >
        <Button 
          mode="contained" 
          onPress={goToNextSlide}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </Animatable.View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    marginTop: 20,
  },
  button: {
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 