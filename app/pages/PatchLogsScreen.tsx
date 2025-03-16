import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { Button, Card, useTheme, Surface, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { Stack, router } from 'expo-router';
import LottieView from 'lottie-react-native';

// Storage keys
const APP_VERSION_KEY = 'tripsit_app_version';
const SHOW_PATCH_LOGS_KEY = 'tripsit_show_patch_logs';

// Current app version - make sure this matches your package.json
const APP_VERSION = '1.0.0';

interface PatchNote {
  title: string;
  date: string;
  notes: string[];
}

interface PatchNotes {
  [version: string]: PatchNote;
}

// This should be populated with actual patch notes
const PATCH_NOTES: PatchNotes = {
  '1.0.0': {
    title: 'Version 1.0.0',
    date: 'April 2023',
    notes: [
      'Initial release of the TripSit mobile app',
      'Access to drug information database',
      'Drug combination safety checker',
      'Easy-to-use interface with Material Design 3',
      'Welcome screen for first time users',
    ],
  },
  '0.9.0': {
    title: 'Version 0.9.0 (Beta)',
    date: 'March 2023',
    notes: [
      'Beta testing release',
      'Implemented core drug information database',
      'Added initial combination matrix',
      'Fixed various UI bugs and performance issues',
    ],
  },
};

export default function PatchLogsScreen() {
  const theme = useTheme();
  const [shouldShowPatchLogs, setShouldShowPatchLogs] = useState(true);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      const showPatchLogs = await AsyncStorage.getItem(SHOW_PATCH_LOGS_KEY);
      setShouldShowPatchLogs(showPatchLogs !== 'false');
    } catch (e) {
      console.error('Failed to load patch logs settings', e);
    }
  };

  const markVersionSeen = async () => {
    try {
      await AsyncStorage.setItem(APP_VERSION_KEY, APP_VERSION);
      // Navigate to the main app
      router.replace('/');
    } catch (e) {
      console.error('Failed to save version information', e);
      router.replace('/');
    }
  };

  const togglePatchLogs = async (value: boolean) => {
    try {
      setShouldShowPatchLogs(value);
      await AsyncStorage.setItem(SHOW_PATCH_LOGS_KEY, value ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save patch logs settings', e);
    }
  };

  const renderPatchNotes = () => {
    return Object.keys(PATCH_NOTES).map((version) => {
      const versionData = PATCH_NOTES[version];
      const isCurrentVersion = version === APP_VERSION;
      
      return (
        <Animatable.View 
          key={version}
          animation="fadeInUp" 
          duration={800} 
          delay={isCurrentVersion ? 300 : 600}
          style={styles.cardContainer}
        >
          <Card 
            style={[
              styles.card, 
              isCurrentVersion && { 
                borderWidth: 2, 
                borderColor: theme.colors.primary 
              }
            ]}
          >
            <Card.Title 
              title={versionData.title} 
              subtitle={versionData.date}
              titleStyle={[styles.cardTitle, { color: theme.colors.primary }]}
              subtitleStyle={{ color: theme.colors.secondary }}
              right={() => isCurrentVersion && (
                <LottieView
                  source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_touohxv0.json' }}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              )}
            />
            <Card.Content>
              {versionData.notes.map((note: string, index: number) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={[styles.bulletPoint, { color: theme.colors.primary }]}>•</Text>
                  <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
                    {note}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Animatable.View>
      );
    });
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'What\'s New', headerShown: false }} />
      
      <Animatable.View 
        animation="fadeIn" 
        duration={800} 
        style={styles.headerContainer}
      >
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          What's New
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Check out the latest updates to the TripSit app
        </Text>
      </Animatable.View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderPatchNotes()}
      </ScrollView>
      
      <Animatable.View 
        animation="fadeInUp" 
        duration={800} 
        style={styles.footer}
      >
        <View style={styles.showPatchContainer}>
          <Text style={[styles.showPatchText, { color: theme.colors.onSurface }]}>
            Show patch notes after updates?
          </Text>
          <View style={styles.buttonGroup}>
            <Button
              mode={shouldShowPatchLogs ? "contained" : "outlined"}
              onPress={() => togglePatchLogs(true)}
              style={styles.toggleButton}
            >
              Yes
            </Button>
            <Button
              mode={!shouldShowPatchLogs ? "contained" : "outlined"}
              onPress={() => togglePatchLogs(false)}
              style={styles.toggleButton}
            >
              No
            </Button>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <Button 
          mode="contained" 
          onPress={markVersionSeen}
          style={styles.continueButton}
        >
          Continue to App
        </Button>
      </Animatable.View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    marginVertical: 10,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  noteItem: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 18,
    marginRight: 8,
    lineHeight: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
  },
  showPatchContainer: {
    marginBottom: 20,
  },
  showPatchText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    marginHorizontal: 5,
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  divider: {
    marginVertical: 15,
  },
  continueButton: {
    borderRadius: 25,
    paddingVertical: 6,
  },
}); 