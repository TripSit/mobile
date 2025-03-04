import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  useColorScheme,
  Dimensions,
  Linking,
  ScrollView,
  TouchableOpacity, 
} from 'react-native';
import {
  Chip,
  IconButton,
  Divider,
  Text,
  Paragraph,
  DataTable,
  Surface,
  useTheme,
  Card,
  Title,
  MD3Colors,
  ActivityIndicator,
  Appbar,
  Tooltip,
  Avatar,
  AnimatedFAB,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

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
  pretty_name?: string;
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

type Drug = {
  id: string;
  name: string;
  summary: string;
  categories: string[];
  aliases: string[];
  details: DrugDetail;
};

type DrugDetailScreenProps = {
  drug: Drug;
  onClose: () => void;
};

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedSurface = Animated.createAnimatedComponent(Surface);

const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({ drug, onClose }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = useTheme();
  const paperTheme = theme;
  
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const slideIn = useSharedValue(-100);

  const drugDetails = drug.details;

  const headerAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: slideIn.value }]
    };
  });

  const contentAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    slideIn.value = withSpring(0, { damping: 12 });
    
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 800 });
    }, 300);
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      headerOpacity.value = withTiming(0, { duration: 300 });
      contentOpacity.value = withTiming(0, { duration: 300 });
      slideIn.value = withTiming(-100, { duration: 300 }, () => {
        runOnJS(onClose)();
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [onClose]);

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
          color: (opacity = 1) => theme.colors.primary + (opacity !== 1 ? opacity * 255 : ''), 
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = generateChartData();

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      psychedelic: theme.colors.tertiary,
      stimulant: theme.colors.error,
      depressant: theme.colors.primary,
      opioid: theme.colors.secondary,
      cannabinoid: theme.colors.primaryContainer,
      dissociative: theme.colors.secondaryContainer,
      deliriant: theme.colors.tertiaryContainer,
      'nootropic': theme.colors.surfaceVariant,
      'research chemical': theme.colors.outline,
      'antidepressant': theme.colors.onSurfaceVariant,
      'antipsychotic': theme.colors.inverseSurface,
      'benzodiazepine': theme.colors.onSecondary,
      'ssri': theme.colors.onTertiary,
      'maoi': theme.colors.onPrimaryContainer,
      'vitamin': theme.colors.onSecondaryContainer,
      'entactogen': theme.colors.onTertiaryContainer,
      'alcohol': theme.colors.onError,
      'gabaergic': theme.colors.onErrorContainer,
      'steroid': theme.colors.inversePrimary,
      'unclassified': theme.colors.outline,
      'habit-forming': theme.colors.error,
      default: theme.colors.surfaceVariant,
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
    if (!status) return theme.colors.outline;
    
    switch (status.toLowerCase()) {
      case 'low risk & synergy':
      case 'low risk & decrease':
        return theme.colors.primary;
      case 'caution':
        return MD3Colors.orange700;
      case 'unsafe':
      case 'dangerous':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const renderDosageRow = (label: string, amount: string) => (
    <DataTable.Row key={label}>
      <DataTable.Cell>{label}</DataTable.Cell>
      <DataTable.Cell numeric>{amount}</DataTable.Cell>
    </DataTable.Row>
  );

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => theme.colors.primary + (opacity !== 1 ? opacity * 255 : ''),
    labelColor: (opacity = 1) => theme.colors.onSurface,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.dark ? theme.colors.surfaceDisabled : theme.colors.surfaceVariant,
    },
    decimalPlaces: 0,
  };

  if (!drugDetails) {
    return (
      <Animated.View 
        style={[
          styles(theme).container, 
          { justifyContent: 'center', alignItems: 'center' }
        ]}
        entering={FadeIn.duration(500)}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Substance details not available.
        </Text>
        <AnimatedFAB
          icon="close"
          label="Close"
          onPress={onClose}
          style={styles(theme).fab}
          extended={true}
          variant="surface"
          color={theme.colors.onSurface}
          rippleColor={theme.colors.primaryContainer}
          animateFrom='right'
          iconMode='dynamic'
        />
      </Animated.View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Appbar.Header style={styles(theme).appBar} elevated>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content 
          title={drugDetails.pretty_name || drug.name} 
          titleStyle={styles(theme).appBarTitle}
        />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles(theme).scrollContainer}>
        {/* Header Section with Categories and Aliases */}
        <Animated.View style={[styles(theme).headerSection, headerAnimationStyle]}>
          {/* Categories */}
          {drugDetails.categories && drugDetails.categories.length > 0 && (
            <View style={styles(theme).section}>
              <Text variant="labelLarge" style={styles(theme).sectionLabel}>Categories</Text>
              <View style={styles(theme).chipContainer}>
                {drugDetails.categories.map((category: string, index: number) => (
                  <Chip
                    key={index}
                    style={[
                      styles(theme).chip,
                      { backgroundColor: getCategoryColor(category) }
                    ]}
                    textStyle={styles(theme).chipText}
                    mode="flat"
                    elevation={1}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Aliases */}
          {drugDetails.aliases && drugDetails.aliases.length > 0 && (
            <View style={styles(theme).section}>
              <Text variant="labelLarge" style={styles(theme).sectionLabel}>Aliases</Text>
              <View style={styles(theme).chipContainer}>
                {drugDetails.aliases.map((alias: string, index: number) => (
                  <Chip
                    key={index}
                    style={styles(theme).chip}
                    textStyle={styles(theme).chipText}
                    mode="outlined"
                  >
                    {alias}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        <Divider style={styles(theme).divider} />

        {/* Main Content */}
        <Animated.View style={[contentAnimationStyle]}>
          {/* Summary */}
          {drugDetails.properties?.summary && (
            <Animatable.View animation="fadeIn" duration={800} delay={300}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>Summary</Title>
                  <Paragraph style={styles(theme).paragraph}>
                    {drugDetails.properties.summary}
                  </Paragraph>
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* Effects */}
          {drugDetails.formatted_effects && drugDetails.formatted_effects.length > 0 && (
            <Animatable.View animation="fadeIn" duration={800} delay={400}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>Common Effects</Title>
                  <View style={styles(theme).chipContainer}>
                    {drugDetails.formatted_effects.map((effect: string, index: number) => (
                      <Chip
                        key={index}
                        style={styles(theme).effectChip}
                        textStyle={styles(theme).chipText}
                        mode="outlined"
                        icon="star-outline"
                      >
                        {effect}
                      </Chip>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* Effect Intensity Chart */}
          {chartData && (
            <Animatable.View animation="fadeIn" duration={800} delay={500}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>Effect Timeline</Title>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 48}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles(theme).chartStyle}
                    withInnerLines={false}
                    yAxisLabel=""
                    yAxisSuffix="%"
                    yAxisInterval={25}
                  />
                  <View style={styles(theme).durationInfo}>
                    <View style={styles(theme).durationItem}>
                      <Avatar.Icon size={24} icon="timer-outline" style={styles(theme).durationIcon} />
                      <Text variant="bodyMedium">
                        <Text style={{fontWeight: 'bold'}}>Onset:</Text> {drugDetails.formatted_onset?.value ?? 'Unknown'}{' '}
                        {drugDetails.formatted_onset?._unit ?? ''}
                      </Text>
                    </View>
                    <View style={styles(theme).durationItem}>
                      <Avatar.Icon size={24} icon="clock-outline" style={styles(theme).durationIcon} />
                      <Text variant="bodyMedium">
                        <Text style={{fontWeight: 'bold'}}>Duration:</Text> {drugDetails.formatted_duration?.value ?? 'Unknown'}{' '}
                        {drugDetails.formatted_duration?._unit ?? ''}
                      </Text>
                    </View>
                    <View style={styles(theme).durationItem}>
                      <Avatar.Icon size={24} icon="clock-time-four-outline" style={styles(theme).durationIcon} />
                      <Text variant="bodyMedium">
                        <Text style={{fontWeight: 'bold'}}>After effects:</Text> {drugDetails.formatted_aftereffects?.value ?? 'Unknown'}{' '}
                        {drugDetails.formatted_aftereffects?._unit ?? ''}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* Doses */}
          {drugDetails.formatted_dose && Object.keys(drugDetails.formatted_dose).length > 0 && (
            <Animatable.View animation="fadeIn" duration={800} delay={600}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>Dosage</Title>
                  {Object.entries(drugDetails.formatted_dose).map(([roa, doses], index) => (
                    <View key={roa} style={styles(theme).doseSection}>
                      <Text variant="titleMedium" style={styles(theme).subSectionTitle}>{roa}</Text>
                      <DataTable>
                        <DataTable.Header>
                          <DataTable.Title>Strength</DataTable.Title>
                          <DataTable.Title numeric>Amount</DataTable.Title>
                        </DataTable.Header>
                        {Object.entries(doses as { [key: string]: string }).map(([strength, amount]) =>
                          renderDosageRow(strength, amount)
                        )}
                      </DataTable>
                    </View>
                  ))}
                  {drugDetails.dose_note && (
                    <Paragraph style={styles(theme).paragraph}>
                      {drugDetails.dose_note}
                    </Paragraph>
                  )}
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* Combos */}
          {drugDetails.combos && Object.keys(drugDetails.combos).length > 0 && (
            <Animatable.View animation="fadeIn" duration={800} delay={700}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>Combinations</Title>
                  {Object.entries(drugDetails.combos).map(([comboDrug, details], index) => (
                    <AnimatedSurface
                      key={index}
                      style={[
                        styles(theme).comboCard,
                        { borderLeftColor: getComboColor(details.status) }
                      ]}
                      elevation={1}
                      entering={SlideInRight.delay(100 * index).springify()}
                    >
                      <View style={styles(theme).comboHeader}>
                        <Avatar.Icon 
                          size={32} 
                          icon={getComboIcon(details.status)}
                          color={getComboColor(details.status)}
                          style={styles(theme).comboIcon} 
                        />
                        <Text variant="titleMedium" style={styles(theme).comboDrugName}>
                          {comboDrug.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles(theme).comboStatus}>
                        Status: <Text style={{ fontWeight: 'bold' }}>{details.status}</Text>
                      </Text>
                      {details.note && (
                        <Text style={styles(theme).comboNote}>Note: {details.note}</Text>
                      )}
                      {details.sources && details.sources.length > 0 && (
                        <View style={styles(theme).sourcesSection}>
                          <Text style={styles(theme).sourcesTitle}>Sources:</Text>
                          {details.sources.map((source: any, idx: number) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => Linking.openURL(source.url)}
                            >
                              <Text style={styles(theme).sourceLink}>
                                - {source.author}: {source.title}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </AnimatedSurface>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* External Links */}
          {drugDetails.links && (
            <Animatable.View animation="fadeIn" duration={800} delay={800}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>External Links</Title>
                  {drugDetails.links.experiences && (
                    <Tooltip title="View Erowid Experience Vault">
                      <TouchableOpacity
                        style={styles(theme).linkButton}
                        onPress={() => Linking.openURL(drugDetails.links!.experiences!)}
                      >
                        <MaterialCommunityIcons name="earth" size={24} color={theme.colors.primary} />
                        <Text style={styles(theme).linkText}>Erowid Experiences</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  )}
                  {drugDetails.links.tihkal && (
                    <Tooltip title="View TIHKAL Entry">
                      <TouchableOpacity 
                        style={styles(theme).linkButton}
                        onPress={() => Linking.openURL(drugDetails.links!.tihkal!)}
                      >
                        <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} />
                        <Text style={styles(theme).linkText}>TIHKAL</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  )}
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          {/* General Sources */}
          {drugDetails.sources && drugDetails.sources._general && (
            <Animatable.View animation="fadeIn" duration={800} delay={900}>
              <Card style={styles(theme).card} mode="elevated">
                <Card.Content>
                  <Title style={styles(theme).cardTitle}>General Sources</Title>
                  {drugDetails.sources._general.map((source: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        const urlMatch = source.match(/\bhttps?:\/\/\S+/gi);
                        if (urlMatch && urlMatch[0]) {
                          Linking.openURL(urlMatch[0]);
                        }
                      }}
                    >
                      <Text style={styles(theme).sourceLink}>- {source}</Text>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>
          )}

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appBar: {
      backgroundColor: theme.colors.surface,
    },
    appBarTitle: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 30,
    },
    headerSection: {
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    section: {
      marginBottom: 16,
    },
    sectionLabel: {
      color: theme.colors.secondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    cardTitle: {
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    subSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginTop: 8,
      marginBottom: 4,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginBottom: 8,
    },
    chip: {
      marginRight: 6,
      marginBottom: 6,
      backgroundColor: theme.colors.surfaceVariant,
      height: 'auto', 
      justifyContent: 'center', 
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    effectChip: {
      marginRight: 6,
      marginBottom: 6,
      height: 'auto',
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    chipText: {
      color: theme.colors.onSurface,
      fontSize: 12, 
      textAlign: 'center', 
      flexWrap: 'wrap', 
    },
    divider: {
      backgroundColor: theme.colors.outline,
      marginVertical: 16,
      height: 0.5,
    },
    card: {
      marginVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    paragraph: {
      color: theme.colors.onSurface,
      fontSize: 14,
      lineHeight: 20,
    },
    chartStyle: {
      marginVertical: 8,
      borderRadius: 8,
    },
    durationInfo: {
      marginTop: 12,
    },
    durationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    durationIcon: {
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 8,
    },
    durationText: {
      color: theme.colors.onSurface,
      fontSize: 12,
    },
    doseSection: {
      marginTop: 8,
    },
    comboCard: {
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: 12,
      padding: 12,
      borderLeftWidth: 4,
      borderRadius: 8,
    },
    comboHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    comboIcon: {
      backgroundColor: 'transparent',
      marginRight: 8,
    },
    comboDrugName: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    comboStatus: {
      color: theme.colors.onSurface,
      fontSize: 14,
      marginBottom: 4,
    },
    comboNote: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
      fontStyle: 'italic',
    },
    sourcesSection: {
      marginTop: 8,
    },
    sourcesTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      marginBottom: 4,
    },
    sourceLink: {
      color: theme.colors.primary,
      fontSize: 13,
      marginLeft: 8,
      marginBottom: 2,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 14,
      marginLeft: 8,
    },
    closeButton: {
      alignItems: 'center',
      marginTop: 20,
    },
    closeButtonText: {
      color: theme.colors.onSurface,
      fontSize: 16,
      marginTop: 4,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });

export default DrugDetailScreen;
