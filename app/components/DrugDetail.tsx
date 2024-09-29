import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  useColorScheme,
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity, 
} from 'react-native';
import {
  Chip,
  IconButton,
  Divider,
  Paragraph,
  DataTable,
  Surface,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

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
  const isDarkMode = useColorScheme() === 'dark';

  // Handle Back Button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onClose();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [onClose])
  );

  useEffect(() => {
    fetch(`https://tripsit.me/api/tripsit/getDrug/${drug.name}`)
      .then(async response => {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (result && result.data && result.data.length > 0 && !result.data[0].err) {
            setDrugDetails(result.data[0]);
          } else {
            setError('This substance does not have more information in our database.');
          }
        } else {
          const text = await response.text();
          console.error('Expected JSON, but received:', text);
          setError('Failed to load substance details. The server returned an unexpected response.');
        }
      })
      .catch(error => {
        console.error('Error fetching substance details:', error);
        setError('Failed to load substance details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [drug.name]);

  // Parse duration strings into minutes
  const parseDuration = (duration: string | undefined): number => {
    if (!duration) return 0;

    const ranges = duration.split('-').map(s => s.trim());
    const totalMinutes = ranges
      .map(range => {
        const units = range.match(/[a-zA-Z]+/g);
        const values = range.match(/[\d.]+/g);

        if (!units || !values) return 0;

        let minutes = 0;

        for (let i = 0; i < units.length; i++) {
          const value = parseFloat(values[i]);
          const unit = units[i].toLowerCase();

          if (unit.includes('hour')) {
            minutes += value * 60;
          } else if (unit.includes('minute')) {
            minutes += value;
          }
        }

        return minutes;
      })
      .reduce((a, b) => a + b, 0);

    const avgMinutes = totalMinutes / ranges.length;

    return avgMinutes;
  };

  const generateChartData = () => {
    if (!drugDetails) return null;

    const onset = drugDetails.formatted_onset?.value;
    const duration = drugDetails.formatted_duration?.value;
    const aftereffects = drugDetails.formatted_aftereffects?.value;

    const onsetMinutes = parseDuration(onset);
    const durationMinutes = parseDuration(duration);
    const aftereffectsMinutes = parseDuration(aftereffects);

    const totalDuration = onsetMinutes + durationMinutes + aftereffectsMinutes;

    // Check for invalid durations
    if (totalDuration === 0) return null;

    const dataPoints = [
      { time: 0, intensity: 0 },
      { time: onsetMinutes, intensity: 0 },
      { time: onsetMinutes + 0.1, intensity: 50 },
      { time: onsetMinutes + durationMinutes / 2, intensity: 100 },
      { time: onsetMinutes + durationMinutes, intensity: 50 },
      { time: totalDuration, intensity: 0 },
    ];

    const intensities = dataPoints.map(d => d.intensity);

    const labelInterval = totalDuration / 4;
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const time = i * labelInterval;
      const hours = Math.floor(time / 60);
      const minutes = Math.round(time % 60);
      labels.push(hours > 0 ? `${hours}h` : `${minutes}m`);
    }

    return {
      labels,
      datasets: [
        {
          data: intensities,
          color: (opacity = 1) => `rgba(67, 160, 71, ${opacity})`, // Green 600
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = generateChartData();

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      psychedelic: '#6200EE',
      stimulant: '#D32F2F',
      depressant: '#303F9F',
      opioid: '#7B1FA2',
      cannabinoid: '#388E3C',
      dissociative: '#1976D2',
      deliriant: '#5D4037',
      'nootropic': '#0288D1',
      'research chemical': '#455A64',
      'antidepressant': '#FBC02D',
      'antipsychotic': '#616161',
      'benzodiazepine': '#00796B',
      'ssri': '#C2185B',
      'maoi': '#AFB42B',
      'vitamin': '#F57C00',
      'entactogen': '#E64A19',
      'alcohol': '#F4511E',
      'gabaergic': '#512DA8',
      'steroid': '#0097A7',
      'unclassified': '#9E9E9E',
      'habit-forming': '#E53935',
      default: '#9E9E9E',
    };

    return categoryColors[category.toLowerCase()] || categoryColors['default'];
  };

  const getComboIcon = (status: string | undefined) => {
    if (!status) return 'help-circle-outline';

    switch (status.toLowerCase()) {
      case 'low risk & synergy':
      case 'low risk & decrease':
        return 'check-circle-outline';
      case 'caution':
        return 'alert-circle-outline';
      case 'unsafe':
      case 'dangerous':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getComboColor = (status: string | undefined) => {
    if (!status) return '#9E9E9E';
    switch (status.toLowerCase()) {
      case 'low risk & synergy':
      case 'low risk & decrease':
        return '#43A047'; // Green 600
      case 'caution':
        return '#FB8C00'; // Orange 600
      case 'unsafe':
      case 'dangerous':
        return '#E53935'; // Red 600
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const renderDosageRow = (label: string, amount: string) => (
    <DataTable.Row key={label}>
      <DataTable.Cell>{label}</DataTable.Cell>
      <DataTable.Cell numeric>{amount}</DataTable.Cell>
    </DataTable.Row>
  );

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#121212' : '#FFFFFF',
    backgroundGradientTo: isDarkMode ? '#121212' : '#FFFFFF',
    color: (opacity = 1) => `rgba(67, 160, 71, ${opacity})`, 
    labelColor: (opacity = 1) =>
      `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#43A047',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: isDarkMode ? '#333333' : '#EEEEEE',
    },
    decimalPlaces: 0,
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode).loadingContainer}>
        <ActivityIndicator size="large" color="#43A047" />
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 10 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles(isDarkMode).container}>
        <Text
          style={{
            color: isDarkMode ? '#FFFFFF' : '#000000',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity style={styles(isDarkMode).closeButton} onPress={onClose}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={48}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
          <Text style={styles(isDarkMode).closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!drugDetails) {
    return (
      <View style={styles(isDarkMode).container}>
        <Text
          style={{
            color: isDarkMode ? '#FFFFFF' : '#000000',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          Substance details not available.
        </Text>
        <TouchableOpacity style={styles(isDarkMode).closeButton} onPress={onClose}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={48}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
          <Text style={styles(isDarkMode).closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles(isDarkMode).container}>
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
        <Text style={styles(isDarkMode).title}>{drugDetails.pretty_name}</Text>

        {/* Categories and Aliases */}
        <View style={styles(isDarkMode).section}>
          {/* Categories */}
          {drugDetails.categories && drugDetails.categories.length > 0 && (
            <>
              <Text style={styles(isDarkMode).sectionTitle}>Categories</Text>
              <View style={styles(isDarkMode).chipContainer}>
                {drugDetails.categories.map((category, index) => (
                  <Chip
                    key={index}
                    style={[
                      styles(isDarkMode).chip,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                    textStyle={styles(isDarkMode).chipText}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {/* Aliases */}
          {drugDetails.aliases && drugDetails.aliases.length > 0 && (
            <>
              <Text style={styles(isDarkMode).sectionTitle}>Aliases</Text>
              <View style={styles(isDarkMode).chipContainer}>
                {drugDetails.aliases.map((alias, index) => (
                  <Chip
                    key={index}
                    style={[styles(isDarkMode).chip]}
                    textStyle={styles(isDarkMode).chipText}
                  >
                    {alias}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </View>

        <Divider style={styles(isDarkMode).divider} />

        {/* Summary */}
        {drugDetails.properties?.summary && (
          <View style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Summary</Text>
            <Paragraph style={styles(isDarkMode).paragraph}>
              {drugDetails.properties.summary}
            </Paragraph>
          </View>
        )}

        {/* Effects */}
        {drugDetails.formatted_effects && drugDetails.formatted_effects.length > 0 && (
          <View style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Common Effects</Text>
            <View style={styles(isDarkMode).chipContainer}>
              {drugDetails.formatted_effects.map((effect, index) => (
                <Chip
                  key={index}
                  style={[styles(isDarkMode).chip]}
                  textStyle={styles(isDarkMode).chipText}
                >
                  {effect}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Effect Intensity Chart */}
        {chartData && (
          <View style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Effect Intensity Over Time</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles(isDarkMode).chartStyle}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix="%"
              yAxisInterval={25}
            />
            <View style={styles(isDarkMode).durationInfo}>
              <Text style={styles(isDarkMode).durationText}>
                Onset: {drugDetails.formatted_onset?.value ?? 'Unknown'}{' '}
                {drugDetails.formatted_onset?._unit ?? ''}
              </Text>
              <Text style={styles(isDarkMode).durationText}>
                Duration: {drugDetails.formatted_duration?.value ?? 'Unknown'}{' '}
                {drugDetails.formatted_duration?._unit ?? ''}
              </Text>
              <Text style={styles(isDarkMode).durationText}>
                After effects: {drugDetails.formatted_aftereffects?.value ?? 'Unknown'}{' '}
                {drugDetails.formatted_aftereffects?._unit ?? ''}
              </Text>
            </View>
          </View>
        )}

        {/* Doses */}
        {drugDetails.formatted_dose && Object.keys(drugDetails.formatted_dose).length > 0 && (
          <View style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Dosage</Text>
            {Object.entries(drugDetails.formatted_dose).map(([roa, doses]) => (
              <View key={roa} style={styles(isDarkMode).doseSection}>
                <Text style={styles(isDarkMode).subSectionTitle}>{roa}</Text>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Strength</DataTable.Title>
                    <DataTable.Title numeric>Amount</DataTable.Title>
                  </DataTable.Header>
                  {Object.entries(doses).map(([strength, amount]) =>
                    renderDosageRow(strength, amount)
                  )}
                </DataTable>
              </View>
            ))}
            {drugDetails.dose_note && (
              <Paragraph style={styles(isDarkMode).paragraph}>
                {drugDetails.dose_note}
              </Paragraph>
            )}
          </View>
        )}

        {/* Combos */}
        {drugDetails.combos && Object.keys(drugDetails.combos).length > 0 && (
          <View style={styles(isDarkMode).section}>
            <Text style={styles(isDarkMode).sectionTitle}>Combinations</Text>
            {Object.entries(drugDetails.combos).map(([comboDrug, details], index) => (
              <Surface
                key={index}
                style={[
                  styles(isDarkMode).comboCard,
                  { borderLeftColor: getComboColor(details.status) },
                ]}
              >
                <View style={styles(isDarkMode).comboHeader}>
                  <MaterialCommunityIcons
                    name={getComboIcon(details.status)}
                    size={20}
                    color={getComboColor(details.status)}
                    style={styles(isDarkMode).comboIcon}
                  />
                  <Text style={styles(isDarkMode).comboDrugName}>
                    {comboDrug.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles(isDarkMode).comboStatus}>
                  Status: <Text style={{ fontWeight: 'bold' }}>{details.status}</Text>
                </Text>
                {details.note && (
                  <Text style={styles(isDarkMode).comboNote}>Note: {details.note}</Text>
                )}
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
              </Surface>
            ))}
          </View>
        )}

        {/* External Links */}
        {drugDetails.links && (
          <View style={styles(isDarkMode).section}>
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
          </View>
        )}

        {/* General Sources */}
        {drugDetails.sources && drugDetails.sources._general && (
          <View style={styles(isDarkMode).section}>
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
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 30,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
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
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      marginBottom: 8,
    },
    subSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      marginTop: 8,
      marginBottom: 4,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 8,
    },
    chip: {
      marginRight: 6,
      marginBottom: 6,
      backgroundColor: isDarkMode ? '#424242' : '#EEEEEE',
      height: 'auto', 
      justifyContent: 'center', 
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    chipText: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 12, 
      textAlign: 'center', 
      flexWrap: 'wrap', 
    },
    
    divider: {
      backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
      marginVertical: 16,
    },
    paragraph: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 14,
      lineHeight: 20,
    },
    chartStyle: {
      marginVertical: 8,
    },
    durationInfo: {
      marginTop: 8,
    },
    durationText: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 12,
    },
    doseSection: {
      marginTop: 8,
    },
    comboCard: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
      marginBottom: 12,
      padding: 12,
      borderLeftWidth: 4,
      elevation: 2,
    },
    comboHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    comboIcon: {
      marginRight: 4,
    },
    comboDrugName: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    comboStatus: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 14,
      marginBottom: 4,
    },
    comboNote: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 12,
      fontStyle: 'italic',
    },
    sourcesSection: {
      marginTop: 8,
    },
    sourcesTitle: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 14,
      marginBottom: 4,
    },
    sourceLink: {
      color: '#1E88E5',
      fontSize: 12,
      marginLeft: 8,
      marginBottom: 2,
    },
    linkText: {
      color: '#1E88E5',
      fontSize: 14,
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
