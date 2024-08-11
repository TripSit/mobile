import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, Linking, TouchableOpacity, BackHandler, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { Card, Title, Paragraph, Chip, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

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

const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({ drug, onClose }) => {
  const [drugDetails, setDrugDetails] = useState<DrugDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const colorScheme = useColorScheme(); 
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    fetch(`https://tripsit.me/api/tripsit/getDrug/${drug.name}`)
      .then(async response => {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (result && result.data && result.data.length > 0 && !result.data[0].err) {
            setDrugDetails(result.data[0]);
          } else {
            setError('This drug doesn’t have more information in our database.');
          }
        } else {
          const text = await response.text();
          console.error('Expected JSON, but received:', text);
          setError('Failed to load drug details. The server returned an unexpected response.');
        }
      })
      .catch(error => {
        console.error('Error fetching drug details:', error);
        setError('Failed to load drug details.');
      })
      .finally(() => {
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
        return true; 
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation, onClose])
  );

  const parseDuration = (duration: string | undefined): number => {
    if (!duration) return 0; // Handle undefined duration
  
    const [min, max] = duration.split('-').map(str => str.trim());
    const convert = (str: string): number => {
      if (typeof str !== 'string') return 0; // ensure str is a string before using includes
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

  const generateChartData = () => {
    if (!drugDetails) return null;
  
    const onset = drugDetails.formatted_onset?.value || '0';
    const duration = drugDetails.formatted_duration?.value || '0';
    const aftereffects = drugDetails.formatted_aftereffects?.value || '0';
  
    const onsetMinutes = parseDuration(onset);
    const durationMinutes = parseDuration(duration);
    const aftereffectsMinutes = parseDuration(aftereffects);
  
    const totalDuration = onsetMinutes + durationMinutes + aftereffectsMinutes;
  
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
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode).loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? "#6200ee" : "#000"} />
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles(isDarkMode).container}>
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', textAlign: 'center', marginTop: 20 }}>{error}</Text>
        <TouchableOpacity style={styles(isDarkMode).closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={48} color={isDarkMode ? "#FFFFFF" : "#000000"} />
          <Text style={styles(isDarkMode).closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!drugDetails) {
    return (
      <View style={styles(isDarkMode).container}>
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', textAlign: 'center', marginTop: 20 }}>
          Drug details not available.
        </Text>
        <TouchableOpacity style={styles(isDarkMode).closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={48} color={isDarkMode ? "#FFFFFF" : "#000000"} />
          <Text style={styles(isDarkMode).closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = generateChartData();

  const getComboIcon = (status: string | undefined) => {
    if (typeof status !== 'string') return 'help-circle'; 
  
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
    <View style={styles(isDarkMode).dosageRow} key={label}>
      <Text style={[styles(isDarkMode).dosageLabel, { color: getDosageColor(label) }]}>{label}</Text>
      <Text style={styles(isDarkMode).dosageAmount}>{amount}</Text>
    </View>
  );

  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles(isDarkMode).container}>
      <ScrollView contentContainerStyle={styles(isDarkMode).scrollContainer}>
        {/* Close Button */}
        <IconButton
          icon="close"
          size={28}
          onPress={onClose}
          style={styles(isDarkMode).closeIcon}
          animated
        />

        {/* Title */}
        <Title style={styles(isDarkMode).title}>{drugDetails.pretty_name}</Title>

        {/* Aliases */}
        {drugDetails.aliases && drugDetails.aliases.length > 0 && (
          <Animatable.View animation="fadeIn" delay={200} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Aliases</Text>
            <View style={styles(isDarkMode).chipContainer}>
              {drugDetails.aliases.map((alias, index) => (
                <Chip key={index} style={styles(isDarkMode).chip} textStyle={styles(isDarkMode).chipText}>
                  {alias}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Categories */}
        {drugDetails.categories && drugDetails.categories.length > 0 && (
          <Animatable.View animation="fadeIn" delay={400} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Categories</Text>
            <View style={styles(isDarkMode).chipContainer}>
              {drugDetails.categories.map((category, index) => (
                <Chip
                  key={index}
                  style={[styles(isDarkMode).chip, { backgroundColor: getCategoryColor(category) }]}
                  textStyle={styles(isDarkMode).chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        <Divider style={styles(isDarkMode).divider} />

        {/* Summary */}
        {drugDetails.properties?.summary && (
          <Animatable.View animation="fadeIn" delay={600} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Summary</Text>
            <Paragraph style={styles(isDarkMode).paragraph}>{drugDetails.properties.summary}</Paragraph>
          </Animatable.View>
        )}

        {/* Effects */}
        {drugDetails.formatted_effects && drugDetails.formatted_effects.length > 0 && (
          <Animatable.View animation="fadeIn" delay={800} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Common Effects</Text>
            <View style={styles(isDarkMode).chipContainer}>
              {drugDetails.formatted_effects.map((effect, index) => (
                <Chip key={index} style={styles(isDarkMode).chip} textStyle={styles(isDarkMode).chipText}>
                  {effect}
                </Chip>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Effect Intensity Chart */}
        {chartData && (
          <Animatable.View animation="fadeIn" delay={1000} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Effect Intensity Over Time</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig(isDarkMode)}
              bezier
              style={styles(isDarkMode).chartStyle}
            />
            <View style={styles(isDarkMode).durationInfo}>
              <Text style={styles(isDarkMode).durationText}>
                Onset: {drugDetails.formatted_onset?.value ?? 'Unknown'} {drugDetails.formatted_onset?._unit ?? ''}
              </Text>
              <Text style={styles(isDarkMode).durationText}>
                Duration: {drugDetails.formatted_duration?.value ?? 'Unknown'} {drugDetails.formatted_duration?._unit ?? ''}
              </Text>
              <Text style={styles(isDarkMode).durationText}>
                Aftereffects: {drugDetails.formatted_aftereffects?.value ?? 'Unknown'} {drugDetails.formatted_aftereffects?._unit ?? ''}
              </Text>
            </View>
          </Animatable.View>
        )}

        {/* Doses */}
        {drugDetails.formatted_dose && Object.keys(drugDetails.formatted_dose).length > 0 && (
          <Animatable.View animation="fadeIn" delay={1200} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Dosage</Text>
            {Object.entries(drugDetails.formatted_dose).map(([roa, doses]) => (
              <View key={roa} style={styles(isDarkMode).doseSection}>
                <Text style={styles(isDarkMode).subSectionTitle}>{roa}</Text>
                {Object.entries(doses).map(([strength, amount]) =>
                  renderDosageRow(strength, amount)
                )}
              </View>
            ))}
            {drugDetails.dose_note && (
              <Paragraph style={styles(isDarkMode).paragraph}>{drugDetails.dose_note}</Paragraph>
            )}
          </Animatable.View>
        )}

        {/* Combos */}
        {drugDetails.combos && Object.keys(drugDetails.combos).length > 0 && (
          <Animatable.View animation="fadeIn" delay={1400} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Combinations</Text>
            {Object.entries(drugDetails.combos).map(([comboDrug, details], index) => (
              <Card key={index} style={styles(isDarkMode).comboCard}>
                <Card.Content>
                  <View style={styles(isDarkMode).comboHeader}>
                    <Ionicons
                      name={getComboIcon(details.status)}
                      size={20}
                      color={getComboColor(details.status)}
                      style={styles(isDarkMode).comboIcon}
                    />
                    <Text style={styles(isDarkMode).comboDrugName}>{comboDrug.toUpperCase()}</Text>
                  </View>
                  <Text style={styles(isDarkMode).comboStatus}>
                    Status: <Text style={{ fontWeight: 'bold' }}>{details.status}</Text>
                  </Text>
                  {details.note && <Text style={styles(isDarkMode).comboNote}>Note: {details.note}</Text>}
                  {details.sources && details.sources.length > 0 && (
                    <View style={styles(isDarkMode).sourcesSection}>
                      <Text style={styles(isDarkMode).sourcesTitle}>Sources:</Text>
                      {details.sources.map((source, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => Linking.openURL(source.url)}
                        >
                          <Text style={styles(isDarkMode).sourceLink}>
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
          <Animatable.View animation="fadeIn" delay={1600} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>External Links</Text>
            {drugDetails.links.experiences && (
              <TouchableOpacity
                onPress={() => Linking.openURL(drugDetails.links!.experiences!)}
              >
                <Text style={styles(isDarkMode).linkText}>Erowid Experiences</Text>
              </TouchableOpacity>
            )}
            {drugDetails.links.tihkal && (
              <TouchableOpacity onPress={() => Linking.openURL(drugDetails.links!.tihkal!)}>
                <Text style={styles(isDarkMode).linkText}>TIHKAL</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        )}

        {/* Sources */}
        {drugDetails.sources && drugDetails.sources._general && (
          <Animatable.View animation="fadeIn" delay={1800} style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>General Sources</Text>
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
                <Text style={styles(isDarkMode).sourceLink}>- {source}</Text>
              </TouchableOpacity>
            ))}
          </Animatable.View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </Animatable.View>
  );
};

const getCategoryColor = (category: string | undefined) => {
  if (!category) return '#9E9E9E';
  switch (category?.toLowerCase()) {
    case 'psychedelic':
      return '#6A1B9A';
    case 'common':
      return '#43A047';
    default:
      return '#9E9E9E';
  }
};

const getComboColor = (status: string | undefined) => {
  if (!status) return '#9E9E9E'; 
  switch (status?.toLowerCase()) {
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

const getDosageColor = (label: string | undefined) => {
  if (!label) return '#9E9E9E'; 
  switch (label?.toLowerCase()) {
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
      return '#9E9E9E'; 
  }
};

const chartConfig = (isDarkMode: boolean) => ({
  backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#FFD700',
  },
});

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
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
    backgroundColor: isDarkMode ? '#3E3E3E' : '#E0E0E0',
  },
  chipText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  divider: {
    backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
    marginVertical: 16,
  },
  paragraph: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  comboCard: {
    backgroundColor: isDarkMode ? '#2E2E2E' : '#F5F5F5',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 16,
    marginBottom: 4,
  },
  comboNote: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 14,
    fontStyle: 'italic',
  },
  sourcesSection: {
    marginTop: 8,
  },
  sourcesTitle: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 16,
    marginTop: 4,
  },
});

export default DrugDetailScreen;
