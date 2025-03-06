import React, { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Animated, Dimensions } from 'react-native';
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
  Snackbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import ConfettiCannon from 'react-native-confetti-cannon';

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
  }, []);

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

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.header} elevation={2}>
          <Text variant="headlineMedium" style={styles.headerText}>
            About TripSit
          </Text>
          <IconButton
            icon="eye"
            size={24}
            onPress={handleEyeClick}
            style={styles.eyeIcon}
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
          <Card style={[styles.card, styles.secretCard]} mode="contained">
            <Card.Content>
              <Text variant="bodyMedium" style={styles.secretText}>
                🎉 You Found a Secret! Here's a virtual hug 🤗
              </Text>
            </Card.Content>
          </Card>
        )}

        <Surface style={styles.footer} elevation={1}>
          <Text variant="labelSmall" style={styles.footerText}>
            Made with ❤️ by Sympact06 for TripSit
          </Text>
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

      <Portal>
        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: 'white',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#1a73e8',
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
    backgroundColor: '#1a73e8',
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
    backgroundColor: 'white',
  },
  footerText: {
    color: '#666',
  },
  loader: {
    marginTop: 8,
  },
  snackbar: {
    marginBottom: 16,
  },
});
