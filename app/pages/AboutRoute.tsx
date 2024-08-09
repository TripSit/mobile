import * as React from 'react';
import { ScrollView, View, StyleSheet, Text, useColorScheme } from 'react-native';
import { Avatar, Card, Title, Paragraph, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AboutRoute = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    card: {
      margin: 8,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12, // Rounded corners for a modern look
      elevation: 2, // Elevation for shadow effect in light mode
    },
    link: {
      color: theme.colors.primary,
    },
    title: {
      color: theme.colors.onBackground,
      fontSize: 24, // Larger font size for titles
      fontWeight: '600',
    },
    paragraph: {
      color: theme.colors.onSurface,
      marginBottom: 12, // Spacing between paragraphs
      lineHeight: 22,
    },
    icon: {
      alignSelf: 'center',
      marginBottom: 16,
      marginTop: 40,
    },
    footerText: {
      textAlign: 'center',
      color: theme.colors.onSurface,
      marginTop: 20,
      fontSize: 14,
    },
    sectionHeader: {
      color: theme.colors.onBackground,
      fontSize: 20,
      fontWeight: '500',
      marginTop: 16,
      marginBottom: 8,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
      marginRight: 8,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={40} 
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Title style={styles.title}>About TripSit</Title>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.paragraph}>
            TripSit is a harm reduction organization that provides factual information about drugs and their effects. Our mission is to promote safe and informed drug use through education and support.
          </Paragraph>
          <Divider />
          <Paragraph style={styles.sectionHeader}>Our Services</Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="chat" size={20} color={theme.colors.primary} /> Live Chat Support: Get real-time advice and support from our knowledgeable volunteers.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="chemical-weapon" size={20} color={theme.colors.primary} /> Drug Combination Charts: Understand the interactions between different substances.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="book-open-page-variant" size={20} color={theme.colors.primary} /> Substance Information: Detailed information on a wide range of substances.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.primary} /> Community Forums: Connect with others and share your experiences.
          </Paragraph>
          <Divider />
          <Paragraph style={styles.sectionHeader}>Our Mission</Paragraph>
          <Paragraph style={styles.paragraph}>
            Our mission is to reduce the harm associated with drug use by providing accurate information and support. We believe that through education and community, we can help individuals make safer choices.
          </Paragraph>
          <Divider />
          <Paragraph style={styles.sectionHeader}>Contact Us</Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} /> Email: support@tripsit.me
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="twitter" size={20} color={theme.colors.primary} /> Twitter: @TripSit
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <MaterialCommunityIcons name="facebook" size={20} color={theme.colors.primary} /> Facebook: facebook.com/TripSit
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            For more information, visit our website at <Text style={styles.link}>https://tripsit.me</Text>.
          </Paragraph>
        </Card.Content>
      </Card>
      
      <Text style={styles.footerText}>Developed by Sympact06</Text>
    </ScrollView>
  );
};

export default AboutRoute;