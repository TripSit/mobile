import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, Linking, TouchableOpacity, BackHandler } from 'react-native';
import { useState, useEffect } from 'react';
import { Card, Title, Paragraph, Chip, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Define types for the detailed drug data
type Combo = {
  status: string;
  note?: string;
  sources?: {
    author: string;
    title: string;
    url: string;
  }[];
};

type DrugDetail = {
  name: string;
  pretty_name: string;
  aliases?: string[];
  categories?: string[];
  combos?: { [key: string]: Combo };
  dose_note?: string;
  formatted_aftereffects?: { _unit: string; value: string };
  formatted_dose?: { [key: string]: { [key: string]: string } };
  formatted_duration?: { _unit: string; value: string };
  formatted_effects?: string[];
  formatted_onset?: { _unit: string; value: string };
  links?: { experiences?: string; tihkal?: string };
  properties?: {
    summary?: string;
    after_effects?: string;
    avoid?: string;
    half_life?: string;
    marquis?: string;
  };
  pweffects?: { [key: string]: string };
  sources?: { _general?: string[] };
};

type DrugDetailScreenProps = {
  drug: { name: string };
  onClose: () => void;
};

const screenWidth = Dimensions.get('window').width;

const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({ drug, onClose }) => {
  const [drugDetails, setDrugDetails] = useState<DrugDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetch(`https://tripsit.me/api/tripsit/getDrug/${drug.name}`)
      .then(response => response.json())
      .then(result => {
        if (result && result.data && result.data.length > 0 && !result.data[0].err) {
          setDrugDetails(result.data[0]);
        } else {
          setError('This drug doesn’t have more information in our database.');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching drug details:', error);
        setError('Failed to load drug details.');
        setLoading(false);
      });
  }, [drug.name]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          onClose();
        }
        return true; // Prevent default behavior (closing the app)
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation, onClose])
  );

  // Function to process duration strings into total minutes
  const parseDuration = (duration: string): number => {
    const [min, max] = duration.split('-').map(str => str.trim());
    const convert = (str: string): number => {
      if (str.includes('hour')) {
        return parseFloat(str) * 60;
      } else if (str.includes('minute')) {
        return parseFloat(str);
      } else {
        return parseFloat(str);
      }
    };
    return (convert(min) + convert(max)) / 2;
  };

  // Generate data for the effect intensity chart
  const generateChartData = () => {
    if (!drugDetails) return null;

    const onset = drugDetails.formatted_onset?.value || '0';
    const duration = drugDetails.formatted_duration?.value || '0';
    const aftereffects = drugDetails.formatted_aftereffects?.value || '0';

    const onsetMinutes = parseDuration(onset);
    const durationMinutes = parseDuration(duration);
    const aftereffectsMinutes = parseDuration(aftereffects);

    const totalDuration = onsetMinutes + durationMinutes + aftereffectsMinutes;

    // Simplified effect intensity over time
    const data = [
      { time: 0, intensity: 0 },
      { time: onsetMinutes, intensity: 50 },
      { time: onsetMinutes + durationMinutes / 2, intensity: 100 },
      { time: onsetMinutes + durationMinutes, intensity: 50 },
      { time: totalDuration, intensity: 0 },
    ];

    const labels = data.map(d => `${Math.round(d.time / 60)}h`);
    const intensities = data.map(d => d.intensity);

    return {
      labels,
      datasets: [
        {
          data: intensities,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ color: '#FFFFFF', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 20 }}>{error}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={48} color="#FFFFFF" />
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!drugDetails) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 20 }}>
          Drug details not available.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={48} color="#FFFFFF" />
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = generateChartData();

  // Icons for combos based on status
  const getComboIcon = (status: string | undefined) => {
    if (!status) return 'help-circle';
    switch (status.toLowerCase()) {
      case 'low risk & synergy':
        return 'checkmark-circle';
      case 'caution':
        return 'warning';
      case 'dangerous':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  // Helper function to render dosage rows
  const renderDosageRow = (label: string, amount: string) => (
    <View style={styles.dosageRow} key={label}>
      <Text style={[styles.dosageLabel, { color: getDosageColor(label) }]}>{label}</Text>
      <Text style={styles.dosageAmount}>{amount}</Text>
    </View>
  );

  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Close Button */}
        <IconButton
          icon="close"
          size={28}
          onPress={onClose}
          style={styles.closeIcon}
          color="#FFFFFF"
          animated
        />

        {/* Title */}
        <Title style={styles.title}>{drugDetails.pretty_name}</Title>

        {/* Aliases */}
        {drugDetails.aliases && drugDetails.aliases.length > 0 && (
          <Animatable.View animation="fadeIn" delay={200} style={styles.section}>
            <Text style={styles.sectionTitle}>Aliases</Text>
            <View style={styles.chipContainer}>
              {drugDetails.aliases.map((alias, index) => (
                <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                  {alias}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Categories */}
        {drugDetails.categories && drugDetails.categories.length > 0 && (
          <Animatable.View animation="fadeIn" delay={400} style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.chipContainer}>
              {drugDetails.categories.map((category, index) => (
                <Chip
                  key={index}
                  style={[styles.chip, { backgroundColor: getCategoryColor(category) }]}
                  textStyle={styles.chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        <Divider style={styles.divider} />

        {/* Summary */}
        {drugDetails.properties?.summary && (
          <Animatable.View animation="fadeIn" delay={600} style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Paragraph style={styles.paragraph}>{drugDetails.properties.summary}</Paragraph>
          </Animatable.View>
        )}

        {/* Effects */}
        {drugDetails.formatted_effects && drugDetails.formatted_effects.length > 0 && (
          <Animatable.View animation="fadeIn" delay={800} style={styles.section}>
            <Text style={styles.sectionTitle}>Common Effects</Text>
            <View style={styles.chipContainer}>
              {drugDetails.formatted_effects.map((effect, index) => (
                <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                  {effect}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Effect Intensity Chart */}
        {chartData && (
          <Animatable.View animation="fadeIn" delay={1000} style={styles.section}>
            <Text style={styles.sectionTitle}>Effect Intensity Over Time</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
            <View style={styles.durationInfo}>
              <Text style={styles.durationText}>
                Onset: {drugDetails.formatted_onset?.value} {drugDetails.formatted_onset?._unit}
              </Text>
              <Text style={styles.durationText}>
                Duration: {drugDetails.formatted_duration?.value} {drugDetails.formatted_duration?._unit}
              </Text>
              <Text style={styles.durationText}>
                Aftereffects: {drugDetails.formatted_aftereffects?.value}{' '}
                {drugDetails.formatted_aftereffects?._unit}
              </Text>
            </View>
          </Animatable.View>
        )}

        {/* Doses */}
        {drugDetails.formatted_dose && Object.keys(drugDetails.formatted_dose).length > 0 && (
          <Animatable.View animation="fadeIn" delay={1200} style={styles.section}>
            <Text style={styles.sectionTitle}>Dosage</Text>
            {Object.entries(drugDetails.formatted_dose).map(([roa, doses]) => (
              <View key={roa} style={styles.doseSection}>
                <Text style={styles.subSectionTitle}>{roa}</Text>
                {Object.entries(doses).map(([strength, amount]) =>
                  renderDosageRow(strength, amount)
                )}
              </View>
            ))}
            {drugDetails.dose_note && (
              <Paragraph style={styles.paragraph}>{drugDetails.dose_note}</Paragraph>
            )}
          </Animatable.View>
        )}

        {/* Combos */}
        {drugDetails.combos && Object.keys(drugDetails.combos).length > 0 && (
          <Animatable.View animation="fadeIn" delay={1400} style={styles.section}>
            <Text style={styles.sectionTitle}>Combinations</Text>
            {Object.entries(drugDetails.combos).map(([comboDrug, details], index) => (
              <Card key={index} style={styles.comboCard}>
                <Card.Content>
                  <View style={styles.comboHeader}>
                    <Ionicons
                      name={getComboIcon(details.status)}
                      size={20}
                      color={getComboColor(details.status)}
                      style={styles.comboIcon}
                    />
                    <Text style={styles.comboDrugName}>{comboDrug.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.comboStatus}>
                    Status: <Text style={{ fontWeight: 'bold' }}>{details.status}</Text>
                  </Text>
                  {details.note && <Text style={styles.comboNote}>Note: {details.note}</Text>}
                  {details.sources && details.sources.length > 0 && (
                    <View style={styles.sourcesSection}>
                      <Text style={styles.sourcesTitle}>Sources:</Text>
                      {details.sources.map((source, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => Linking.openURL(source.url)}
                        >
                          <Text style={styles.sourceLink}>
                            - {source.author}: {source.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </Animatable.View>
        )}

        {/* Links */}
        {drugDetails.links && (
          <Animatable.View animation="fadeIn" delay={1600} style={styles.section}>
            <Text style={styles.sectionTitle}>External Links</Text>
            {drugDetails.links.experiences && (
              <TouchableOpacity
                onPress={() => Linking.openURL(drugDetails.links!.experiences!)}
              >
                <Text style={styles.linkText}>Erowid Experiences</Text>
              </TouchableOpacity>
            )}
            {drugDetails.links.tihkal && (
              <TouchableOpacity onPress={() => Linking.openURL(drugDetails.links!.tihkal!)}>
                <Text style={styles.linkText}>TIHKAL</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        )}

        {/* Sources */}
        {drugDetails.sources && drugDetails.sources._general && (
          <Animatable.View animation="fadeIn" delay={1800} style={styles.section}>
            <Text style={styles.sectionTitle}>General Sources</Text>
            {drugDetails.sources._general.map((source, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  const urlMatch = source.match(/\bhttps?:\/\/\S+/gi);
                  if (urlMatch && urlMatch[0]) {
                    Linking.openURL(urlMatch[0]);
                  }
                }}
              >
                <Text style={styles.sourceLink}>- {source}</Text>
              </TouchableOpacity>
            ))}
          </Animatable.View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </Animatable.View>
  );
};

// Helper function to determine category color
const getCategoryColor = (category: string | undefined) => {
  if (!category) return '#9E9E9E'; // Return a default color if category is undefined
  switch (category.toLowerCase()) {
    case 'psychedelic':
      return '#6A1B9A';
    case 'common':
      return '#43A047';
    default:
      return '#9E9E9E';
  }
};

// Helper function to determine combo status color
const getComboColor = (status: string | undefined) => {
  if (!status) return '#9E9E9E'; // Return a default color if status is undefined
  switch (status.toLowerCase()) {
    case 'low risk & synergy':
      return '#4CAF50'; // Green
    case 'caution':
      return '#FFC107'; // Amber
    case 'dangerous':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Gray
  }
};

// Helper function to determine dosage color
const getDosageColor = (label: string | undefined) => {
  if (!label) return '#9E9E9E'; // Return a default color if label is undefined
  switch (label.toLowerCase()) {
    case 'threshold':
      return '#9575CD';
    case 'light':
      return '#4FC3F7';
    case 'common':
      return '#4CAF50';
    case 'strong':
      return '#FFEB3B';
    case 'heavy':
      return '#F44336';
    default:
      return '#9E9E9E'; // Gray for unknown labels
  }
};

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: '#1E1E1E',
  backgroundGradientTo: '#1E1E1E',
  color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#FFD700',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    marginTop: 24,  
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#3E3E3E',
  },
  chipText: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  durationInfo: {
    marginTop: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  doseSection: {
    marginTop: 8,
  },
  dosageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dosageLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dosageAmount: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  comboCard: {
    backgroundColor: '#2E2E2E',
    marginBottom: 12,
    borderRadius: 10,
    elevation: 4,
  },
  comboHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comboIcon: {
    marginRight: 8,
  },
  comboDrugName: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  comboStatus: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  comboNote: {
    color: '#FFFFFF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  sourcesSection: {
    marginTop: 8,
  },
  sourcesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  sourceLink: {
    color: '#1E90FF',
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 16,
    marginBottom: 4,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 4,
  },
});

export default DrugDetailScreen;
