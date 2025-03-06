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
  ViewStyle,
  TextStyle,
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

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  content: ViewStyle;
  card: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  summary: TextStyle;
  divider: ViewStyle;
  chipContainer: ViewStyle;
  chip: ViewStyle;
  chipText: TextStyle;
  timelineCard: ViewStyle;
  timeline: ViewStyle;
  timelinePhase: ViewStyle;
  timelineBar: ViewStyle;
  progressBar: ViewStyle;
  progressBarFill: ViewStyle;
  timelineLabel: TextStyle;
  timelineInfo: ViewStyle;
  infoItem: ViewStyle;
  infoText: TextStyle;
  effectsCard: ViewStyle;
  effectsGrid: ViewStyle;
  effectItem: ViewStyle;
  effectText: TextStyle;
  doseCard: ViewStyle;
  doseSection: ViewStyle;
  doseRoute: TextStyle;
  doseGrid: ViewStyle;
  doseItem: ViewStyle;
  doseClassification: TextStyle;
  doseAmount: TextStyle;
  doseNote: ViewStyle;
  doseNoteText: TextStyle;
  combosCard: ViewStyle;
  combosGrid: ViewStyle;
  comboItem: ViewStyle;
  comboHeader: ViewStyle;
  comboDrug: TextStyle;
  comboStatus: TextStyle;
  comboNote: TextStyle;
  linksCard: ViewStyle;
  linkItem: ViewStyle;
  linkText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  chartCard: ViewStyle;
  chartTitle: TextStyle;
  chart: ViewStyle;
  sectionHeader: ViewStyle;
  tabBar: ViewStyle;
  tabButton: ViewStyle;
  tabButtonSelected: ViewStyle;
  tabButtonText: TextStyle;
  tabButtonIcon: ViewStyle;
  timelineProgress: ViewStyle;
  timelineRow: ViewStyle;
  timelineTime: TextStyle;
  timelinePhaseLabel: TextStyle;
  timelineMetrics: ViewStyle;
  timelineMetric: ViewStyle;
  timelineMetricIcon: ViewStyle;
  timelineMetricText: TextStyle;
  timelineMetricValue: TextStyle;
  phaseMarkers: ViewStyle;
  phaseMarker: ViewStyle;
  phaseMarkerLine: ViewStyle;
  phaseMarkerLabel: TextStyle;
  timeMarkers: ViewStyle;
  nowMarker: TextStyle;
  nowIndicator: ViewStyle;
  nowLabel: TextStyle;
}

const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({ drug, onClose }) => {
  const theme = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [currentTime] = useState(new Date());
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

  const parseDuration = (durationStr: string | undefined): { min: number; max: number; avg: number; unit: string } => {
    if (!durationStr) return { min: 0, max: 0, avg: 0, unit: 'minutes' };
    
    // Extract numbers from strings like "45-90 minutes" or "8-12 hours"
    const numbers = durationStr.match(/\d+/g);
    if (!numbers) return { min: 0, max: 0, avg: 0, unit: 'minutes' };
    
    let min = parseInt(numbers[0]);
    let max = numbers.length > 1 ? parseInt(numbers[1]) : min;
    
    // Determine the unit (minutes or hours)
    const unit = durationStr.toLowerCase().includes('hour') ? 'hours' : 'minutes';
    
    const avg = (min + max) / 2;
    return { min, max, avg, unit };
  };
  
  // Helper function to check the original unit from source data
  const getOriginalUnit = (value: string | undefined): string => {
    if (!value) return 'minutes';
    return value.toLowerCase().includes('hour') ? 'hours' : 'minutes';
  };

  const generateTimelineData = () => {
    if (!drugDetails) return null;

    // Check if we have all required duration data
    if (!drugDetails.formatted_onset?.value || !drugDetails.formatted_duration?.value || !drugDetails.formatted_aftereffects?.value) {
      return null;
    }

    // Get the duration data with proper units directly from the source
    const onset = {
      min: parseInt(drugDetails.formatted_onset.value.match(/\d+/g)?.[0] || "0"),
      max: parseInt(drugDetails.formatted_onset.value.match(/\d+/g)?.[1] || drugDetails.formatted_onset.value.match(/\d+/g)?.[0] || "0"),
      unit: drugDetails.formatted_onset._unit || "minutes"
    };

    const duration = {
      min: parseInt(drugDetails.formatted_duration.value.match(/\d+/g)?.[0] || "0"),
      max: parseInt(drugDetails.formatted_duration.value.match(/\d+/g)?.[1] || drugDetails.formatted_duration.value.match(/\d+/g)?.[0] || "0"),
      unit: drugDetails.formatted_duration._unit || "hours"
    };

    const aftereffects = {
      min: parseInt(drugDetails.formatted_aftereffects.value.match(/\d+/g)?.[0] || "0"),
      max: parseInt(drugDetails.formatted_aftereffects.value.match(/\d+/g)?.[1] || drugDetails.formatted_aftereffects.value.match(/\d+/g)?.[0] || "0"),
      unit: drugDetails.formatted_aftereffects._unit || "hours"
    };

    // Convert all durations to minutes for internal calculations
    const onsetMinutes = onset.unit === 'hours' ? onset.min * 60 : onset.min;
    const durationMinutes = duration.unit === 'hours' ? duration.min * 60 : duration.min;
    const aftereffectsMinutes = aftereffects.unit === 'hours' ? aftereffects.min * 60 : aftereffects.min;

    // Calculate real end times for each phase
    const onsetEnd = onsetMinutes;
    const peakEnd = onsetEnd + durationMinutes;
    const afterEffectsEnd = peakEnd + aftereffectsMinutes;

    // Create timeline data
    return {
      phases: [
        {
          name: 'Onset',
          duration: `${onset.min}${onset.max > onset.min ? `-${onset.max}` : ''} ${onset.unit}`,
          color: theme.colors.primary,
          endTime: formatDuration(onsetEnd),
          unit: onset.unit
        },
        {
          name: 'Peak',
          duration: `${duration.min}${duration.max > duration.min ? `-${duration.max}` : ''} ${duration.unit}`,
          color: theme.colors.primary,
          endTime: formatDuration(peakEnd),
          unit: duration.unit
        },
        {
          name: 'After Effects',
          duration: `${aftereffects.min}${aftereffects.max > aftereffects.min ? `-${aftereffects.max}` : ''} ${aftereffects.unit}`,
          color: theme.colors.primary,
          endTime: formatDuration(afterEffectsEnd),
          unit: aftereffects.unit
        }
      ],
      metrics: {
        onset: {
          value: `${onset.min}${onset.max > onset.min ? `-${onset.max}` : ''} ${onset.unit}`,
          icon: 'timer-outline'
        },
        duration: {
          value: `${duration.min}${duration.max > duration.min ? `-${duration.max}` : ''} ${duration.unit}`,
          icon: 'clock-outline'
        },
        aftereffects: {
          value: `${aftereffects.min}${aftereffects.max > aftereffects.min ? `-${aftereffects.max}` : ''} ${aftereffects.unit}`,
          icon: 'clock-time-eight-outline'
        }
      }
    };
  };

  const generateChartData = () => {
    if (!drugDetails) return null;

    // Check if we have all required duration data
    // Return null if any required data is missing
    if (!drugDetails.formatted_onset?.value || !drugDetails.formatted_duration?.value) {
      return null;
    }

    try {
      // Parse the onset value
      const onsetMatch = drugDetails.formatted_onset.value.match(/\d+/g);
      if (!onsetMatch || onsetMatch.length === 0) return null;

      // Parse the duration value
      const durationMatch = drugDetails.formatted_duration.value.match(/\d+/g);
      if (!durationMatch || durationMatch.length === 0) return null;

      // Get the duration data with proper units directly from the source
      const onset = {
        min: parseInt(onsetMatch[0] || "0"),
        max: parseInt(onsetMatch[1] || onsetMatch[0] || "0"),
        unit: drugDetails.formatted_onset._unit || "minutes",
        avg: (parseInt(onsetMatch[0] || "0") + 
              parseInt(onsetMatch[1] || onsetMatch[0] || "0")) / 2
      };

      const duration = {
        min: parseInt(durationMatch[0] || "0"),
        max: parseInt(durationMatch[1] || durationMatch[0] || "0"),
        unit: drugDetails.formatted_duration._unit || "hours",
        avg: (parseInt(durationMatch[0] || "0") + 
              parseInt(durationMatch[1] || durationMatch[0] || "0")) / 2
      };

      // If either onset or duration is zero, don't show the chart
      if (onset.avg === 0 || duration.avg === 0) return null;

      // Convert all durations to minutes for the chart
      const onsetMinutes = onset.unit === 'hours' ? onset.avg * 60 : onset.avg;
      const durationMinutes = duration.unit === 'hours' ? duration.avg * 60 : duration.avg;

      // Calculate total duration in hours (only onset + peak)
      const totalDuration = onsetMinutes + durationMinutes;
      const totalHours = Math.ceil(totalDuration / 60);

      if (totalHours === 0) return null;

      // Create data points for a smooth curve showing intensity over time
      const dataPoints = [];
      const now = currentTime;
      
      // Create a smooth curve with appropriate resolution
      const timeSteps = 24; // Fixed number of steps for smooth curve
      const minutesPerStep = totalDuration / timeSteps;
      
      for (let step = 0; step <= timeSteps; step++) {
        const minutesFromStart = step * minutesPerStep;
        let intensity = 0;
        
        // Calculate intensity based on which phase we're in
        if (minutesFromStart <= onsetMinutes) {
          // During onset: rapid rise to 100% (exponential)
          intensity = 100 * Math.pow(minutesFromStart / onsetMinutes, 1.5);
          intensity = Math.min(intensity, 100); // Cap at 100%
        } else if (minutesFromStart <= (onsetMinutes + durationMinutes)) {
          // During peak: gradual decline
          const timeIntoPeak = minutesFromStart - onsetMinutes;
          const decayRate = -2 * (timeIntoPeak / durationMinutes);
          intensity = 100 * Math.exp(decayRate);
        }
        
        // Add time and intensity to data points
        const pointTime = new Date(now.getTime() + minutesFromStart * 60000);
        dataPoints.push({
          time: format(pointTime, 'HH:mm'),
          intensity: Math.round(intensity)
        });
      }

      // Calculate hour labels with appropriate spacing
      // Limit to 6 labels maximum to prevent overlapping
      const maxLabels = 6;
      const labelInterval = Math.max(1, Math.ceil(totalHours / (maxLabels - 1)));
      
      const hourLabels = [];
      for (let h = 0; h <= totalHours; h += labelInterval) {
        if (hourLabels.length < maxLabels) {
          const pointTime = new Date(now.getTime() + h * 60 * 60000);
          hourLabels.push(format(pointTime, 'HH:mm'));
        }
      }

      // Ensure we return a valid LineChartData object
      return {
        labels: hourLabels,
        datasets: [
          {
            data: dataPoints.map(p => p.intensity),
            color: (opacity = 1) => theme.colors.primary + (opacity !== 1 ? Math.round(opacity * 255).toString(16) : ''),
            strokeWidth: 3,
          },
        ]
      };
    } catch (error) {
      console.log('Error generating chart data:', error);
      return null;
    }
  };

  const renderTabButton = (value: string, label: string, iconName: string) => {
    const isSelected = selectedTab === value;
    return (
      <TouchableOpacity 
        onPress={() => setSelectedTab(value)}
        style={[
          styles(theme).tabButton,
          isSelected && styles(theme).tabButtonSelected
        ]}
      >
        <View style={styles(theme).tabButtonIcon}>
          <MaterialCommunityIcons 
            name={iconName as any} 
            size={24} 
            color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant} 
          />
        </View>
        <Text style={[
          styles(theme).tabButtonText,
          { color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeline = () => {
    const timelineData = generateTimelineData();
    if (!timelineData) return null;

    return (
      <Card style={styles(theme).timelineCard} mode="elevated">
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={24} 
              color={theme.colors.primary}
              style={{ opacity: 0.8 }}
            />
            <Title style={styles(theme).sectionTitle}>Duration Profile</Title>
          </View>

          <View style={styles(theme).timelineMetrics}>
            <View style={styles(theme).timelineMetric}>
              <View style={styles(theme).timelineMetricIcon}>
                <MaterialCommunityIcons 
                  name="timer-outline" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </View>
              <View>
                <Text style={styles(theme).timelineMetricText}>Onset</Text>
                <Text style={styles(theme).timelineMetricValue}>
                  {timelineData.phases[0].duration}
                </Text>
              </View>
            </View>

            <View style={styles(theme).timelineMetric}>
              <View style={styles(theme).timelineMetricIcon}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </View>
              <View>
                <Text style={styles(theme).timelineMetricText}>Duration</Text>
                <Text style={styles(theme).timelineMetricValue}>
                  {timelineData.phases[1].duration}
                </Text>
              </View>
            </View>

            <View style={styles(theme).timelineMetric}>
              <View style={styles(theme).timelineMetricIcon}>
                <MaterialCommunityIcons 
                  name="clock-check-outline" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </View>
              <View>
                <Text style={styles(theme).timelineMetricText}>After Effects</Text>
                <Text style={styles(theme).timelineMetricValue}>
                  {timelineData.phases[2].duration}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderIntensityChart = () => {
    const chartData = generateChartData();
    
    if (!chartData) return null;
    
    return (
      <Card style={styles(theme).chartCard}>
        <Card.Content>
          <View style={styles(theme).sectionHeader}>
            <MaterialCommunityIcons 
              name="chart-bell-curve" 
              size={24} 
              color={theme.colors.primary}
              style={{ opacity: 0.8 }}
            />
            <Title style={styles(theme).sectionTitle}>Intensity Over Time</Title>
          </View>
          <View style={styles(theme).chart}>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary + (opacity !== 1 ? Math.round(opacity * 255).toString(16) : ''),
                labelColor: () => theme.colors.onBackground,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '0',
                  strokeWidth: '0',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: theme.colors.outline,
                  strokeWidth: 0.5,
                },
                fillShadowGradient: theme.colors.primary,
                fillShadowGradientOpacity: 0.3,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={true}
              withDots={false}
              yAxisLabel=""
              yAxisSuffix=""
            />
            <View style={{ position: 'absolute', bottom: 10, left: 10 }}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Now</Text>
            </View>
          </View>
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
            {renderIntensityChart()}
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
      <Appbar.Header style={styles(theme).header} elevated>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={drugDetails.pretty_name || drug.name} subtitle={lastUpdated ? `Last updated ${lastUpdated}` : undefined} />
      </Appbar.Header>

      <View style={styles(theme).tabBar}>
        {renderTabButton('overview', 'Overview', 'information')}
        {renderTabButton('dosage', 'Dosage', 'scale')}
        {renderTabButton('interactions', 'Interactions', 'molecule')}
      </View>

      <AnimatedScrollView
        style={[styles(theme).content, contentAnimationStyle]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles(theme).card} elevation={0}>
          {drugDetails.properties?.summary && (
            <View style={styles(theme).section}>
              <Text variant="titleMedium" style={styles(theme).sectionTitle}>
                Summary
              </Text>
              <Text variant="bodyLarge" style={styles(theme).summary}>
                {drugDetails.properties.summary}
              </Text>
            </View>
          )}

          {drug.aliases && drug.aliases.length > 0 && (
            <>
              <Divider style={styles(theme).divider} />
              <View style={styles(theme).section}>
                <Text variant="titleMedium" style={styles(theme).sectionTitle}>
                  Also Known As
                </Text>
                <View style={styles(theme).chipContainer}>
                  {drug.aliases.map((alias, index) => (
                    <Chip
                      key={index}
                      style={styles(theme).chip}
                      textStyle={styles(theme).chipText}
                      mode="flat"
                    >
                      {alias}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {drug.categories && drug.categories.length > 0 && (
            <>
              <Divider style={styles(theme).divider} />
              <View style={styles(theme).section}>
                <Text variant="titleMedium" style={styles(theme).sectionTitle}>
                  Categories
                </Text>
                <View style={styles(theme).chipContainer}>
                  {drug.categories.map((category, index) => (
                    <Chip
                      key={index}
                      style={styles(theme).chip}
                      textStyle={styles(theme).chipText}
                      mode="flat"
                      icon={() => (
                        <MaterialCommunityIcons
                          name="pill"
                          size={16}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                    >
                      {category}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}
        </Surface>

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

const styles = (theme: any): Styles =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      elevation: 0,
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceVariant,
      gap: 8,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
    tabButtonSelected: {
      backgroundColor: theme.colors.primaryContainer,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: 4,
    },
    tabButtonIcon: {
      position: 'relative',
    },
    content: {
      padding: 16,
      flexGrow: 1,
    },
    card: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    section: {
      padding: 24,
    },
    sectionTitle: {
      marginBottom: 16,
      fontWeight: '600',
    },
    summary: {
      lineHeight: 24,
    },
    divider: {
      height: 1,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: {
      fontSize: 14,
    },
    timelineCard: {
      margin: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    timeline: {
      flexDirection: 'row',
      height: 100,
      gap: 8,
      marginTop: 8,
    },
    timelinePhase: {
      alignItems: 'center',
      flex: 1,
    },
    timelineBar: {
      flex: 1,
      height: '100%',
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    progressBarFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    timelineLabel: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 8,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 16,
    },
    timelineInfo: {
      marginTop: 16,
      gap: 8,
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 12,
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
      color: theme.colors.surface,
      fontSize: 12,
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
    },
    chartTitle: {
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    timelineProgress: {
      flexDirection: 'row',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 24,
      marginBottom: 8,
    },
    timelineRow: {
      flexDirection: 'row',
      marginBottom: 24,
    },
    timelineTime: {
      color: theme.colors.onSurface,
      fontSize: 17,
      fontWeight: '600',
    },
    timelinePhaseLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    timelineMetrics: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      padding: 16,
      gap: 16,
      marginTop: 16,
    },
    timelineMetric: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    timelineMetricIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineMetricText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    timelineMetricValue: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    timeMarkers: {
      position: 'relative',
      width: '100%',
      marginTop: 4,
    },
    nowMarker: {
      position: 'absolute',
      left: 0,
      top: 0,
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '500',
    },
    phaseMarkers: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      pointerEvents: 'none',
    },
    phaseMarker: {
      position: 'absolute',
      top: -150,
      alignItems: 'center',
    },
    phaseMarkerLine: {
      width: 1,
      height: 150,
      backgroundColor: theme.colors.primary,
      opacity: 0.3,
    },
    phaseMarkerLabel: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
      opacity: 0.7,
    },
    nowIndicator: {
      position: 'absolute',
      left: 12,
      bottom: 4,
    },
    nowLabel: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '500',
    },
  });

export default DrugDetailScreen;
