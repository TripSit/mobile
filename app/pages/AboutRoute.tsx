import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { Avatar, Card, Title, Paragraph, Divider, useTheme, Button, List, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'; 

const AboutRoute = () => {
  const theme = useTheme();
  const isDarkMode = theme.dark;

  const [lastUpdatedDrugs, setLastUpdatedDrugs] = useState<string | null>(null);
  const [lastUpdatedCombos, setLastUpdatedCombos] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastUpdated = async () => {
      const [drugsUpdated, combosUpdated] = await Promise.all([
        AsyncStorage.getItem('lastUpdatedDrugs'),
        AsyncStorage.getItem('lastUpdatedCombos'),
      ]);

      setLastUpdatedDrugs(drugsUpdated);
      setLastUpdatedCombos(combosUpdated);
    };

    fetchLastUpdated();
  }, []);

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
    headerIcon: {
      marginBottom: 16,
      marginTop: 20,
    },
    title: {
      color: theme.colors.onBackground,
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
    },
    sectionHeader: {
      color: theme.colors.onBackground,
      fontSize: 22,
      fontWeight: '600',
      marginTop: 24,
      marginBottom: 12,
    },
    paragraph: {
      color: theme.colors.onSurface,
      marginBottom: 12,
      lineHeight: 22,
      fontSize: 16,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    iconTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      marginRight: 8,
    },
    card: {
      marginVertical: 8,
      borderRadius: 12,
      elevation: 4,
      backgroundColor: theme.colors.surface,
      padding: 16,
    },
    footerText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginTop: 24,
      fontSize: 14,
    },
    socialIconsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    socialIconButton: {
      marginHorizontal: 8,
    },
  });

  // Function to handle link presses
  const handleLinkPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn(`Don't know how to open URI: ${url}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return moment(dateString).format('MMMM Do YYYY, h:mm:ss a');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <Animatable.View animation="fadeInDown" duration={1000} style={styles.headerContainer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={60}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <Title style={styles.title}>About TripSit</Title>
      </Animatable.View>

      {/* About TripSit */}
      <Animatable.View animation="fadeInUp" delay={200} duration={1000}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Last Updated Information */}
            <Title style={styles.sectionHeader}>Data Last Updated</Title>
            <Paragraph style={styles.paragraph}>
              Substances Data: {formatDate(lastUpdatedDrugs)}
            </Paragraph>
            <Paragraph style={styles.paragraph}>
              Combinations Data: {formatDate(lastUpdatedCombos)}
            </Paragraph>
            <Divider style={{ marginVertical: 12 }} />

            <Paragraph style={styles.paragraph}>
              TripSit is a harm reduction organization dedicated to providing factual and unbiased information about various substances. Our mission is to promote safe and informed choices through education, support, and community engagement.
            </Paragraph>
            <Divider style={{ marginVertical: 12 }} />
            
            {/* Our Services */}
            <Title style={styles.sectionHeader}>Our Services</Title>
            <List.Item
              title="Live Chat Support"
              description="Get real-time advice and support from our knowledgeable volunteers."
              left={() => <MaterialCommunityIcons name="chat-processing-outline" size={24} color={theme.colors.primary} />}
              onPress={() => handleLinkPress('https://tripsit.me/chat')}
            />
            <List.Item
              title="Drug Combination Charts"
              description="Understand the interactions between different substances."
              left={() => <MaterialCommunityIcons name="chart-line-stacked" size={24} color={theme.colors.primary} />}
              onPress={() => handleLinkPress('https://tripsit.me/charts')}
            />
            <List.Item
              title="Substance Information"
              description="Detailed information on a wide range of substances."
              left={() => <MaterialCommunityIcons name="book-open-page-variant" size={24} color={theme.colors.primary} />}
              onPress={() => handleLinkPress('https://tripsit.me/substances')}
            />
            <List.Item
              title="Community Forums"
              description="Connect with others and share your experiences."
              left={() => <MaterialCommunityIcons name="account-group-outline" size={24} color={theme.colors.primary} />}
              onPress={() => handleLinkPress('https://tripsit.me/forums')}
            />
            <Divider style={{ marginVertical: 12 }} />

            {/* Our Mission */}
            <Title style={styles.sectionHeader}>Our Mission</Title>
            <Paragraph style={styles.paragraph}>
              Our mission is to reduce the harm associated with substance use by providing accurate information, support, and resources. We believe that through education and community, individuals can make safer and more informed decisions.
            </Paragraph>
            <Divider style={{ marginVertical: 12 }} />

            {/* Contact Us */}
            <Title style={styles.sectionHeader}>Contact Us</Title>
            <View>
              <View style={styles.iconTextContainer}>
                <MaterialCommunityIcons name="email-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                <TouchableOpacity onPress={() => handleLinkPress('mailto:support@tripsit.me')}>
                  <Text style={styles.link}>support@tripsit.me</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconTextContainer}>
                <MaterialCommunityIcons name="twitter" size={24} color={theme.colors.primary} style={styles.icon} />
                <TouchableOpacity onPress={() => handleLinkPress('https://twitter.com/TripSit')}>
                  <Text style={styles.link}>@TripSit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconTextContainer}>
                <MaterialCommunityIcons name="facebook" size={24} color={theme.colors.primary} style={styles.icon} />
                <TouchableOpacity onPress={() => handleLinkPress('https://facebook.com/TripSit')}>
                  <Text style={styles.link}>facebook.com/TripSit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconTextContainer}>
                <MaterialCommunityIcons name="web" size={24} color={theme.colors.primary} style={styles.icon} />
                <TouchableOpacity onPress={() => handleLinkPress('https://tripsit.me')}>
                  <Text style={styles.link}>https://tripsit.me</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>

      {/* Social Media Icons */}
      <Animatable.View animation="fadeInUp" delay={400} duration={1000}>
        <View style={styles.socialIconsContainer}>
          <IconButton
            icon={() => <MaterialCommunityIcons name="twitter" size={28} color={theme.colors.primary} />}
            size={36}
            onPress={() => handleLinkPress('https://twitter.com/TripSit')}
            style={styles.socialIconButton}
          />
          <IconButton
            icon={() => <MaterialCommunityIcons name="facebook" size={28} color={theme.colors.primary} />}
            size={36}
            onPress={() => handleLinkPress('https://facebook.com/TripSit')}
            style={styles.socialIconButton}
          />
          <IconButton
            icon={() => <MaterialCommunityIcons name="email" size={28} color={theme.colors.primary} />}
            size={36}
            onPress={() => handleLinkPress('mailto:support@tripsit.me')}
            style={styles.socialIconButton}
          />
          <IconButton
            icon={() => <MaterialCommunityIcons name="web" size={28} color={theme.colors.primary} />}
            size={36}
            onPress={() => handleLinkPress('https://tripsit.me')}
            style={styles.socialIconButton}
          />
        </View>
      </Animatable.View>

      {/* Footer */}
      <Animatable.View animation="fadeInUp" delay={600} duration={1000}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} TripSit. All rights reserved.</Text>
        <Text style={styles.footerText}>Developed by Sympact06</Text>
      </Animatable.View>
    </ScrollView>
  );
};

export default AboutRoute;
