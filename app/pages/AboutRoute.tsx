import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Title,
  Surface
} from 'react-native-paper';
import { ThemedView } from '../../components/ThemedView';

export default function AboutRoute() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>About TripSit</Title>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                TripSit began in 2011 as an IRC channel providing drug safety and harm reduction services, allowing people to chat 
                anonymously about drugs in a safe environment.
              </Text>
            </Surface>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                TripSit, one of the oldest harm reduction communities, helps by providing factual drug information and a 
                supportive community.
              </Text>
            </Surface>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                Our mission is supporting responsible drug use through education and harm reduction strategies. We aim to reduce 
                adverse consequences without judgment.
              </Text>
            </Surface>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                TripSit remains independent and community-funded, with passionate volunteers providing 24/7 support through our chat 
                networks, website, apps, and other tools.
              </Text>
            </Surface>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                If you encounter a substance-related crisis situation, please visit chat.tripsit.me for immediate help from
                our trained volunteer team.
              </Text>
            </Surface>
            <Surface style={styles.surface}>
              <Text style={styles.text}>
                TripSit aims to provide objective drug information and support, combined with a warm, welcoming community that helps 
                promote safer drug use.
              </Text>
            </Surface>
          </Card.Content>
        </Card>
      </ScrollView>
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
  card: {
    marginBottom: 16,
  },
  surface: {
    padding: 8,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    lineHeight: 20,
  },
});
