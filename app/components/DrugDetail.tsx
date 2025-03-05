import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Dimensions,
  Linking,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  Chip,
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
  SegmentedButtons,
  IconButton,
  Badge,
  ProgressBar,
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
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, formatDistanceToNow } from 'date-fns';
import { useAnalytics } from '../hooks/useAnalytics'

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

const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({ drug, onClose }) => {
  const theme = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const windowWidth = Dimensions.get('window').width;
  
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const slideIn = useSharedValue(-100);
  const scrollY = useSharedValue(0);

  const drugDetails = drug.details;

  const { logScreen, logAction } = useAnalytics()

  // Log screen view
  useEffect(() => {
    logScreen('DrugDetail', { drugName: drug?.name })
  }, [drug])

  useEffect(() => {
    const getLastUpdated = async () => {
      try {
        const timestamp = await AsyncStorage.getItem('drugDataLastUpdated');
        if (timestamp) {
          setLastUpdated(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
        }
      } catch (error) {
        console.error('Error getting last updated timestamp:', error);
      }
    };

    getLastUpdated();
  }, []);

  const headerAnimationStyle = useAnimatedStyle(() => {
    const elevation = interpolate(
      scrollY.value,
      [0, 50],
      [0, 4],
      Extrapolate.CLAMP
    );

    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: slideIn.value }],
      elevation,
      shadowOpacity: elevation / 4,
    };
  });

  const contentAnimationStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  useEffect(() => {
    const animateIn = () => {
      headerOpacity.value = withTiming(1, { duration: 600 });
      slideIn.value = withSpring(0, { damping: 12 });
      
      setTimeout(() => {
        contentOpacity.value = withTiming(1, { duration: 800 });
      }, 300);
    };

    animateIn();
  }, [headerOpacity, slideIn, contentOpacity]);

  useEffect(() => {
    const onBackPress = () => {
      const animateOut = async () => {
        headerOpacity.value = withTiming(0, { duration: 300 });
        contentOpacity.value = withTiming(0, { duration: 300 });
        slideIn.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onClose)();
        });
      };

      animateOut();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [onClose, headerOpacity, contentOpacity, slideIn]);

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

    return totalMinutes / ranges.length;
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
          color: (opacity = 1) => 
            theme.colors.primary + (opacity !== 1 ? Math.round(opacity * 255).toString(16) : ''),
          strokeWidth: 2,
        },
      ],
    };
  };

  const generateTimelineData = () => {
    if (!drugDetails) return null;

    const onset = drugDetails.formatted_onset?.value;
    const duration = drugDetails.formatted_duration?.value;
    const aftereffects = drugDetails.formatted_aftereffects?.value;

    const onsetMinutes = parseDuration(onset);
    const durationMinutes = parseDuration(duration);
    const aftereffectsMinutes = parseDuration(aftereffects);

    return [
      {
        phase: 'Onset',
        duration: onsetMinutes,
        color: theme.colors.primary,
        intensity: 30,
      },
      {
        phase: 'Peak',
        duration: durationMinutes,
        color: theme.colors.secondary,
        intensity: 100,
      },
      {
        phase: 'After Effects',
        duration: aftereffectsMinutes,
        color: theme.colors.tertiary,
        intensity: 50,
      },
    ];
  };

  const renderTimeline = () => {
    const timelineData = generateTimelineData();
    if (!timelineData) return null;

    const totalDuration = timelineData.reduce((sum, phase) => sum + phase.duration, 0);

    return (
      <Card style={styles(theme).timelineCard} mode="elevated">
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
            <Title style={styles(theme).sectionTitle}>Duration Profile</Title>
          </View>
          <View style={styles(theme).timeline}>
            {timelineData.map((phase, index) => (
              <View
                key={phase.phase}
                style={[
                  styles(theme).timelinePhase,
                  { flex: phase.duration / totalDuration },
                ]}
              >
                <View style={styles(theme).timelineBar}>
                  <ProgressBar
                    progress={phase.intensity / 100}
                    color={phase.color}
                    style={styles(theme).progressBar}
                  />
                </View>
                <Text style={styles(theme).timelineLabel}>
                  {phase.phase}
                  {'\n'}
                  {formatDuration(phase.duration)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles(theme).timelineInfo}>
            <View style={styles(theme).infoItem}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles(theme).infoText}>
                Onset: {drugDetails.formatted_onset?.value}
              </Text>
            </View>
            <View style={styles(theme).infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles(theme).infoText}>
                Duration: {drugDetails.formatted_duration?.value}
              </Text>
            </View>
            <View style={styles(theme).infoItem}>
              <MaterialCommunityIcons name="clock-check-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles(theme).infoText}>
                After Effects: {drugDetails.formatted_aftereffects?.value}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEffectsChart = () => {
    const chartData = generateChartData();
    if (!chartData) return null;

    return (
      <Card style={styles(theme).chartCard}>
        <Card.Content>
          <Title style={styles(theme).chartTitle}>Intensity Over Time</Title>
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary + Math.round(opacity * 255).toString(16),
              labelColor: () => theme.colors.onSurface,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles(theme).chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderEffects = () => {
    if (!drugDetails.formatted_effects) return null;

    return (
      <Card style={styles(theme).effectsCard} mode="elevated">
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons name="star-outline" size={24} color={theme.colors.primary} />
            <Title style={styles(theme).sectionTitle}>Common Effects</Title>
          </View>
          <View style={styles(theme).effectsGrid}>
            {drugDetails.formatted_effects.map((effect, index) => (
              <View key={index} style={styles(theme).effectItem}>
                <MaterialCommunityIcons 
                  name="circle-medium" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles(theme).effectText}>{effect}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDoseTable = () => {
    if (!drugDetails.formatted_dose) return null;

    return (
      <Card style={styles(theme).doseCard} mode="elevated">
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons name="scale" size={24} color={theme.colors.primary} />
            <Title style={styles(theme).sectionTitle}>Dosage Information</Title>
          </View>
          {Object.entries(drugDetails.formatted_dose).map(([route, doses]) => (
            <View key={route} style={styles(theme).doseSection}>
              <Text style={styles(theme).doseRoute}>{route}</Text>
              <View style={styles(theme).doseGrid}>
                {Object.entries(doses).map(([classification, amount]) => (
                  <View key={classification} style={styles(theme).doseItem}>
                    <Text style={styles(theme).doseClassification}>{classification}</Text>
                    <Text style={styles(theme).doseAmount}>{amount}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          {drugDetails.dose_note && (
            <View style={styles(theme).doseNote}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.colors.error} />
              <Text style={styles(theme).doseNoteText}>{drugDetails.dose_note}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderCombos = () => {
    if (!drugDetails.combos) return null;

    return (
      <Card style={styles(theme).combosCard} mode="elevated">
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons name="molecule" size={24} color={theme.colors.primary} />
            <Title style={styles(theme).sectionTitle}>Drug Interactions</Title>
          </View>
          <View style={styles(theme).combosGrid}>
            {Object.entries(drugDetails.combos).map(([drug, combo]) => (
              <Surface
                key={drug}
                style={[
                  styles(theme).comboItem,
                  { backgroundColor: getComboColor(combo.status) },
                ]}
                elevation={2}
              >
                <View style={styles(theme).comboHeader}>
                  <MaterialCommunityIcons
                    name={getComboIcon(combo.status)}
                    size={24}
                    color={theme.colors.surface}
                  />
                  <Text style={styles(theme).comboDrug}>{drug}</Text>
                  <Badge style={styles(theme).comboStatus}>{combo.status}</Badge>
                </View>
                {combo.note && (
                  <Text style={styles(theme).comboNote}>{combo.note}</Text>
                )}
              </Surface>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {renderTimeline()}
            {renderEffectsChart()}
            {renderEffects()}
          </>
        );
      case 'dosage':
        return renderDoseTable();
      case 'interactions':
        return renderCombos();
      default:
        return null;
    }
  };

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
        return theme.colors.tertiary;
      case 'unsafe':
      case 'dangerous':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleInteraction = (interactionType: string) => {
    logAction('Drug Interaction', 'Drug Detail', {
      drugName: drug?.name,
      interactionType,
    })
  }

  if (!drugDetails) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(theme).loadingText}>Loading substance details...</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Animated.View style={[styles(theme).header, headerAnimationStyle]}>
        <Appbar.Header 
          style={[styles(theme).appBar]} 
          mode="center-aligned"
          theme={{
            colors: {
              surface: theme.colors.elevation.level2,
            },
          }}
        >
          <Appbar.BackAction 
            onPress={onClose}
            iconColor={theme.colors.onSurface}
          />
          <Appbar.Content
            title={drugDetails.pretty_name || drug.name}
            titleStyle={{ color: theme.colors.onSurface }}
            subtitle={lastUpdated ? `Last updated ${lastUpdated}` : undefined}
            subtitleStyle={{ 
              color: `${theme.colors.onSurface}80`
            }}
          />
          <Appbar.Action 
            icon="share" 
            onPress={() => {}}
            iconColor={theme.colors.onSurface}
          />
        </Appbar.Header>
      </Animated.View>

      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: 'overview',
            label: 'Overview',
            icon: 'information',
            style: styles(theme).segmentButton
          },
          {
            value: 'dosage',
            label: 'Dosage',
            icon: 'scale',
            style: styles(theme).segmentButton
          },
          {
            value: 'interactions',
            label: 'Interactions',
            icon: 'molecule',
            style: styles(theme).segmentButton
          },
        ]}
        style={[
          styles(theme).segmentedButtons,
          { backgroundColor: theme.colors.elevation.level2 }
        ]}
      />

      <AnimatedScrollView
        style={[styles(theme).content, contentAnimationStyle]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles(theme).summaryCard} mode="elevated">
          <Card.Content>
            <View style={styles(theme).categoryContainer}>
              {drug.categories.map((category, index) => (
                <Chip
                  key={index}
                  style={[
                    styles(theme).categoryChip,
                    { backgroundColor: getCategoryColor(category) },
                  ]}
                  textStyle={styles(theme).categoryChipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
            <Paragraph style={styles(theme).summary}>
              {drugDetails.properties?.summary}
            </Paragraph>
            {drug.aliases.length > 0 && (
              <View style={styles(theme).aliasesContainer}>
                <Text style={styles(theme).aliasesLabel}>Also known as:</Text>
                <Text style={styles(theme).aliases}>
                  {drug.aliases.join(', ')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {renderContent()}

        {drugDetails.links && Object.keys(drugDetails.links).length > 0 && (
          <Card style={styles(theme).linksCard} mode="elevated">
            <Card.Content>
              <View style={styles(theme).sectionHeader}>
                <MaterialCommunityIcons name="link" size={24} color={theme.colors.primary} />
                <Title style={styles(theme).sectionTitle}>Additional Resources</Title>
              </View>
              {Object.entries(drugDetails.links).map(([key, url]) => (
                <TouchableOpacity
                  key={key}
                  style={styles(theme).linkItem}
                  onPress={() => Linking.openURL(url)}
                >
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles(theme).linkText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}
      </AnimatedScrollView>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      zIndex: 1,
      backgroundColor: theme.colors.elevation.level2,
    },
    appBar: {
      elevation: 0,
      backgroundColor: theme.colors.elevation.level2,
    },
    segmentedButtons: {
      margin: 16,
      borderRadius: 28,
    },
    segmentButton: {
      borderRadius: 28,
    },
    content: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontSize: 20,
      fontWeight: '600',
    },
    summaryCard: {
      margin: 16,
      marginTop: 0,
      borderRadius: 16,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    categoryChip: {
      borderRadius: 16,
    },
    categoryChipText: {
      color: '#FFFFFF',
    },
    summary: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
    aliasesContainer: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    aliasesLabel: {
      fontWeight: 'bold',
      marginRight: 8,
      color: theme.colors.onSurface,
    },
    aliases: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
    },
    timelineCard: {
      margin: 16,
      borderRadius: 16,
    },
    timeline: {
      flexDirection: 'row',
      height: 100,
      gap: 8,
    },
    timelinePhase: {
      alignItems: 'center',
    },
    timelineBar: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    timelineLabel: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 8,
      color: theme.colors.onSurfaceVariant,
    },
    timelineInfo: {
      marginTop: 16,
      gap: 8,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    effectsCard: {
      margin: 16,
      borderRadius: 16,
    },
    effectsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    effectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      width: '45%',
    },
    effectText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      flex: 1,
    },
    doseCard: {
      margin: 16,
      borderRadius: 16,
    },
    doseSection: {
      marginBottom: 24,
    },
    doseRoute: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    doseGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    doseItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 12,
    },
    doseClassification: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
      marginBottom: 4,
    },
    doseAmount: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    doseNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 12,
    },
    doseNoteText: {
      color: theme.colors.onErrorContainer,
      fontSize: 14,
      flex: 1,
    },
    combosCard: {
      margin: 16,
      borderRadius: 16,
    },
    combosGrid: {
      gap: 12,
    },
    comboItem: {
      padding: 16,
      borderRadius: 12,
    },
    comboHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    comboDrug: {
      flex: 1,
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    comboStatus: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    comboNote: {
      marginTop: 8,
      color: theme.colors.surface,
      fontSize: 14,
    },
    linksCard: {
      margin: 16,
      borderRadius: 16,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.onSurface,
    },
    chartCard: {
      margin: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
    },
    chartTitle: {
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    chart: {
      borderRadius: 8,
      marginVertical: 8,
    },
  });

export default DrugDetailScreen;
