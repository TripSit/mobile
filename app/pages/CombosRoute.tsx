/* eslint-disable sonarjs/no-all-duplicated-branches */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  Searchbar,
  Card,
  Appbar,
  Avatar,
  Text,
  Portal,
  Modal,
  Snackbar,
  Button,
  Surface,
  useTheme,
  IconButton,
  Divider,
  Chip,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  withSpring,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DrugDetailScreen from '../components/DrugDetail';

// Import local JSON files
import localCombosData from '../data/combos.json';
import localComboDefinitions from '../data/combo_definitions.json';

type Source = {
  author: string;
  title: string;
  url: string;
};

type Interaction = {
  status: string;
  note?: string;
  sources?: Source[];
};

type CombosData = {
  [key: string]: {
    [key: string]: Interaction;
  };
};

// Update ComboDefinitions type to match the structure of combo_definitions.json
type ComboDefinition = {
  status: string;
  emoji: string;
  color: string;
  definition: string;
  thumbnail: string;
};

type ComboDefinitions = ComboDefinition[];

// Define DrugDetail type (adjust properties as needed)
type DrugDetail = {
  name: string;
  pretty_name?: string;
  aliases?: string[];
  categories?: string[];
  properties?: {
    summary?: string;
  };
  // Add other properties if needed
};

type Drug = {
  id: string;
  name: string;
  pretty_name: string;
  summary: string;
  aliases: string[];
  categories: string[];
  details: DrugDetail;
};

// Constants
const COMBOS_URL = 'https://raw.githubusercontent.com/TripSit/drugs/main/combos.json';
const COMBO_DEFINITIONS_URL = 'https://raw.githubusercontent.com/TripSit/drugs/main/combo_definitions.json';
const DEFAULT_COLOR = '#9E9E9E';
const DEFAULT_DARK_BG = '#1F1F1F';
const DEFAULT_SUMMARY = '';
const ICON_CHECK_OUTLINE = 'check-circle-outline';
const ICON_CHECK = 'check-circle';
const ICON_ALERT = 'alert-circle-outline';
const ICON_CLOSE = 'close-circle-outline';
const ICON_DANGER = 'alert-octagon';
const ICON_HELP = 'help-circle-outline';

const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  clearButton: ViewStyle;
  searchContainer: ViewStyle;
  searchBar: ViewStyle;
  searchInput: TextStyle;
  listContainer: ViewStyle;
  drugCardContainer: ViewStyle;
  drugCard: ViewStyle;
  selectedCard: ViewStyle;
  drugCardContent: ViewStyle;
  drugTextContainer: ViewStyle;
  drugTitle: TextStyle;
  selectedIconContainer: ViewStyle;
  interactionCard: ViewStyle;
  interactionCardContent: ViewStyle;
  interactionHeader: ViewStyle;
  drugPillsContainer: ViewStyle;
  drugPill: ViewStyle;
  statusContainer: ViewStyle;
  interactionStatus: TextStyle;
  snackbar: ViewStyle;
  modalContainer: ViewStyle;
  modalHeader: ViewStyle;
  modalContent: ViewStyle;
  modalCard: ViewStyle;
  modalStatusSection: ViewStyle;
  modalDivider: ViewStyle;
  modalDetailsSection: ViewStyle;
  modalSectionTitle: TextStyle;
  modalStatusText: TextStyle;
  modalNoteText: TextStyle;
  modalDefinitionText: TextStyle;
  modalActionsSection: ViewStyle;
  modalButton: ViewStyle;
  drugDetailModal: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
}

const CombosRoute: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [combosData, setCombosData] = useState<CombosData>({});
  const [comboDefinitions, setComboDefinitions] = useState<ComboDefinitions>([]);
  const [drugsList, setDrugsList] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [interactionResult, setInteractionResult] = useState<Interaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDrugDetail, setSelectedDrugDetail] = useState<Drug | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const isDarkMode = useColorScheme() === 'dark';
  const theme = useTheme();

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Animation values
  const searchBarHeight = useSharedValue(56);
  const headerScale = useSharedValue(1);
  const listScale = useSharedValue(1);
  const interactionCardHeight = useSharedValue(0);

  const searchBarStyle = useAnimatedStyle(() => ({
    height: searchBarHeight.value,
    opacity: interpolate(searchBarHeight.value, [0, 56], [0, 1], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(searchBarHeight.value, [0, 56], [-20, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ scale: listScale.value }],
  }));

  const interactionCardStyle = useAnimatedStyle(() => ({
    height: interactionCardHeight.value,
    opacity: interpolate(interactionCardHeight.value, [0, 150], [0, 1], Extrapolate.CLAMP),
  })) as any;

  useEffect(() => {
    if (selectedDrugs.length === 2) {
      interactionCardHeight.value = withSpring(110); // Increased height for larger card
    } else {
      interactionCardHeight.value = withSpring(0);
    }
  }, [selectedDrugs]);

  // Function to capitalize the first letter
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Try to load data from AsyncStorage
        const [cachedCombos, cachedDefinitions, cachedLastUpdated] = await Promise.all([
          AsyncStorage.getItem('combos'),
          AsyncStorage.getItem('combo_definitions'),
          AsyncStorage.getItem('lastUpdatedCombos'),
        ]);

        if (cachedCombos && cachedDefinitions) {
          setCombosData(JSON.parse(cachedCombos));
          setComboDefinitions(JSON.parse(cachedDefinitions));
          setLastUpdated(cachedLastUpdated);
        } else {
          // Load data from local JSON files
          setCombosData(localCombosData);
          setComboDefinitions(localComboDefinitions);
          setLastUpdated(null);
        }

        // Generate drugs list
        const drugs = Object.keys(localCombosData).map((drugName, index) => ({
          id: `${index}`,
          name: drugName,
          pretty_name: capitalizeFirstLetter(drugName),
          summary: DEFAULT_SUMMARY, // Provide a default summary or fetch it if available
          aliases: [],
          categories: [], // Populate if available
          details: {
            name: drugName,
            pretty_name: capitalizeFirstLetter(drugName),
            aliases: [],
            categories: [],
            properties: {
              summary: DEFAULT_SUMMARY, // Provide actual summary if available
            },
          },
        }));

        setDrugsList(drugs);
        setFilteredDrugs(drugs);

        // Check internet connectivity
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            // Fetch data from URLs
            const [combosResponse, definitionsResponse] = await Promise.all([
              fetch(COMBOS_URL),
              fetch(COMBO_DEFINITIONS_URL),
            ]);

            const combosJson = await combosResponse.json();
            const definitionsJson: ComboDefinitions = await definitionsResponse.json();

            setCombosData(combosJson);
            setComboDefinitions(definitionsJson);

            await AsyncStorage.setItem('combos', JSON.stringify(combosJson));
            await AsyncStorage.setItem('combo_definitions', JSON.stringify(definitionsJson));

            // Update last updated time
            const currentTime = new Date().toISOString();
            await AsyncStorage.setItem('lastUpdatedCombos', currentTime);
            setLastUpdated(currentTime);

            // Generate updated drugs list
            const updatedDrugs = Object.keys(combosJson).map((drugName, index) => ({
              id: `${index}`,
              name: drugName,
              pretty_name: capitalizeFirstLetter(drugName),
              summary: DEFAULT_SUMMARY, // Provide actual summary if available
              aliases: [],
              categories: [], // Populate if available
              details: {
                name: drugName,
                pretty_name: capitalizeFirstLetter(drugName),
                aliases: [],
                categories: [],
                properties: {
                  summary: DEFAULT_SUMMARY, // Provide actual summary if available
                },
              },
            }));

            setDrugsList(updatedDrugs);
            setFilteredDrugs(updatedDrugs);
          } else {
            console.log('No internet connection');
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = drugsList.filter(drug =>
      drug.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDrugs(filtered);
  };

  const toggleDrugSelection = (drug: Drug) => {
    if (selectedDrugs.find(d => d.name === drug.name)) {
      setSelectedDrugs(prevSelected => prevSelected.filter(d => d.name !== drug.name));
    } else if (selectedDrugs.length < 2) {
      setSelectedDrugs(prevSelected => [...prevSelected, drug]);
    } else {
      setSnackbarVisible(true);
    }
  };

  const fetchInteractionResult = () => {
    if (selectedDrugs.length === 2) {
      const [drug1, drug2] = selectedDrugs;
      const interaction =
        combosData[drug1.name]?.[drug2.name] || combosData[drug2.name]?.[drug1.name];

      setInteractionResult(interaction || null);
    } else {
      setInteractionResult(null);
    }
  };

  useEffect(() => {
    fetchInteractionResult();
  }, [selectedDrugs, combosData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'low risk & no synergy':
      case 'low risk & synergy':
        return '#4CAF50'; // Green
      case 'caution':
        return '#FF9800'; // Orange
      case 'unsafe':
      case 'dangerous':
        return '#F44336'; // Red
      default:
        return DEFAULT_COLOR; // Grey
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return ICON_HELP;
    switch (status.toLowerCase()) {
      case 'low risk & no synergy':
        return ICON_CHECK_OUTLINE;
      case 'low risk & synergy':
        return ICON_CHECK;
      case 'caution':
        return ICON_ALERT;
      case 'unsafe':
        return ICON_CLOSE;
      case 'dangerous':
        return ICON_DANGER;
      default:
        return ICON_HELP;
    }
  };

  const getIconForCategory = (category: string): IconName => {
    const iconMap: { [key: string]: IconName } = {
      depressant: 'sleep',
      psychedelic: 'brain',
      stimulant: 'flash',
      opioid: 'needle',
      cannabinoid: 'leaf',
      dissociative: 'cloud',
      deliriant: 'ghost',
      nootropic: 'school',
      'research chemical': 'flask',
      antidepressant: 'emoticon-happy',
      antipsychotic: 'emoticon-neutral',
      benzodiazepine: 'sleep',
      ssri: 'emoticon-neutral',
      maoi: 'food-apple',
      vitamin: 'pill',
      entactogen: 'heart',
      alcohol: 'glass-wine',
      gabaergic: 'sleep',
      steroid: 'dumbbell',
      unclassified: 'help-circle',
      'habit-forming': 'alert',
      default: 'pill',
    } as const;
    return iconMap[category.toLowerCase()] || iconMap.default;
  };

  const renderDrug = ({ item, index }: { item: Drug; index: number }) => {
    const isSelected = selectedDrugs.some(drug => drug.name === item.name);

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).springify()}
        exiting={FadeOut}
      >
        <TouchableOpacity
          onPress={() => toggleDrugSelection(item)}
          onLongPress={() => setSelectedDrugDetail(item)}
          style={styles(isDarkMode, theme).drugCardContainer}
        >
          <AnimatedCard
            style={[
              styles(isDarkMode, theme).drugCard,
              isSelected && styles(isDarkMode, theme).selectedCard,
            ]}
            mode="elevated"
          >
            <View style={styles(isDarkMode, theme).drugCardContent}>
              <View style={styles(isDarkMode, theme).drugTextContainer}>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles(isDarkMode, theme).drugTitle,
                    isSelected && { color: theme.colors.primary }
                  ]}
                >
                  {item.pretty_name}
                </Text>
              </View>
              {isSelected && (
                <View style={styles(isDarkMode, theme).selectedIconContainer}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>
          </AnimatedCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderInteractionResult = () => {
    if (selectedDrugs.length !== 2) return null;

    const [drug1, drug2] = selectedDrugs;
    const statusText = interactionResult?.status || 'No interaction data available';
    const statusColor = interactionResult ? getStatusColor(interactionResult.status) : DEFAULT_COLOR;
    const statusIcon = interactionResult ? getStatusIcon(interactionResult.status) : ICON_HELP;

    return (
      <AnimatedSurface
        style={[
          styles(isDarkMode, theme).interactionCard as any,
          interactionCardStyle,
        ]}
        elevation={8}
      >
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          style={styles(isDarkMode, theme).interactionCardContent}
        >
          <View style={styles(isDarkMode, theme).interactionHeader}>
            <View style={styles(isDarkMode, theme).drugPillsContainer}>
              <Chip 
                mode="flat" 
                style={styles(isDarkMode, theme).drugPill}
                compact
                textStyle={{ fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }}
              >
                {drug1.pretty_name}
              </Chip>
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ width: 20, height: 20, alignSelf: 'center' }}
              />
              <Chip 
                mode="flat" 
                style={styles(isDarkMode, theme).drugPill}
                compact
                textStyle={{ fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }}
              >
                {drug2.pretty_name}
              </Chip>
            </View>
            <View style={styles(isDarkMode, theme).statusContainer}>
              <MaterialCommunityIcons 
                name={statusIcon} 
                size={28} 
                color={statusColor}
                style={{ width: 28, height: 28, alignSelf: 'center' }}
              />
              <Text 
                variant="titleLarge" 
                style={[
                  styles(isDarkMode, theme).interactionStatus, 
                  { color: statusColor }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusText}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
                style={{ width: 24, height: 24, alignSelf: 'center' }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedSurface>
    );
  };

  const renderInteractionModal = () => {
    if (!selectedDrugs || selectedDrugs.length !== 2) {
      return null;
    }

    const [drug1, drug2] = selectedDrugs;
    const modalContentStyle = [
      styles(isDarkMode, theme).modalContainer,
      { backgroundColor: isDarkMode ? DEFAULT_DARK_BG : '#FFFFFF' }
    ];

    return (
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        contentContainerStyle={modalContentStyle}
      >
        <Appbar.Header style={styles(isDarkMode, theme).modalHeader}>
          <Appbar.BackAction onPress={() => setIsModalVisible(false)} />
          <Appbar.Content title="Drug Interaction" subtitle={`${drug1.pretty_name} + ${drug2.pretty_name}`} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles(isDarkMode, theme).modalContent}>
          <Surface style={styles(isDarkMode, theme).modalCard} elevation={0}>
            <View style={styles(isDarkMode, theme).modalStatusSection}>
              <MaterialCommunityIcons 
                name={getStatusIcon(interactionResult?.status || '')} 
                size={48} 
                color={getStatusColor(interactionResult?.status || '')} 
              />
              <Text variant="headlineSmall" style={[
                styles(isDarkMode, theme).modalStatusText,
                { color: getStatusColor(interactionResult?.status || '') }
              ]}>
                {interactionResult?.status || 'No data available'}
              </Text>
            </View>

            <Divider style={styles(isDarkMode, theme).modalDivider} />

            <View style={styles(isDarkMode, theme).modalDetailsSection}>
              {interactionResult?.note ? (
                <>
                  <Text variant="titleMedium" style={styles(isDarkMode, theme).modalSectionTitle}>
                    Important Information
                  </Text>
                  <Text style={styles(isDarkMode, theme).modalNoteText}>
                    {interactionResult.note}
                  </Text>
                </>
              ) : (
                <Text style={styles(isDarkMode, theme).modalNoteText}>
                  No specific interaction information available. Please exercise caution and consult additional resources.
                </Text>
              )}

              {interactionResult?.status && (
                <>
                  <Text variant="titleMedium" style={[
                    styles(isDarkMode, theme).modalSectionTitle,
                    { marginTop: 24 }
                  ]}>
                    What This Means
                  </Text>
                  <Text style={styles(isDarkMode, theme).modalDefinitionText}>
                    {comboDefinitions.find(
                      def => def.status.toLowerCase() === interactionResult.status.toLowerCase()
                    )?.definition || 'No definition available for this status.'}
                  </Text>
                </>
              )}
            </View>

            <View style={styles(isDarkMode, theme).modalActionsSection}>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedDrugs([]);
                  setIsModalVisible(false);
                }}
                style={styles(isDarkMode, theme).modalButton}
              >
                Clear Selection
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode, theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(isDarkMode, theme).loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles(isDarkMode, theme).container}>
      <Animated.View style={headerStyle}>
        <Surface style={styles(isDarkMode, theme).header} elevation={0}>
          <View style={styles(isDarkMode, theme).headerContent}>
            <Text variant="headlineMedium" style={styles(isDarkMode, theme).headerTitle}>
              Drug Interactions
            </Text>
            {selectedDrugs.length > 0 && (
              <IconButton
                icon="close"
                mode="contained-tonal"
                onPress={() => setSelectedDrugs([])}
                style={styles(isDarkMode, theme).clearButton}
              />
            )}
          </View>
          <Text variant="bodyMedium" style={styles(isDarkMode, theme).headerSubtitle}>
            Select two substances to check their interaction
          </Text>
        </Surface>
      </Animated.View>

      <Animated.View style={[styles(isDarkMode, theme).searchContainer, searchBarStyle]}>
        <Searchbar
          placeholder="Search substances..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles(isDarkMode, theme).searchBar}
          inputStyle={styles(isDarkMode, theme).searchInput}
          elevation={0}
          mode="bar"
        />
      </Animated.View>

      <Animated.View style={[{ flex: 1 }, listStyle]}>
        <FlatList
          data={filteredDrugs}
          renderItem={renderDrug}
          keyExtractor={item => item.id}
          contentContainerStyle={styles(isDarkMode, theme).listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </Animated.View>

      {renderInteractionResult()}

      <Portal>
        {renderInteractionModal()}
        <Modal
          visible={!!selectedDrugDetail}
          onDismiss={() => setSelectedDrugDetail(null)}
          contentContainerStyle={[
            styles(isDarkMode, theme).drugDetailModal,
            { backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface },
          ]}
        >
          {selectedDrugDetail && (
            <View style={{ flex: 1 }}>
              <DrugDetailScreen drug={selectedDrugDetail} onClose={() => setSelectedDrugDetail(null)} />
            </View>
          )}
        </Modal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles(isDarkMode, theme).snackbar}
        >
          You can only select two substances at a time
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.background : theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: 'transparent',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
      fontWeight: '700',
    },
    headerSubtitle: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    clearButton: {
      margin: 0,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    searchBar: {
      borderRadius: 28,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.elevation.level1,
    },
    searchInput: {
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 200,
    },
    drugCardContainer: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    drugCard: {
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
      elevation: 0,
    },
    selectedCard: {
      backgroundColor: isDarkMode 
        ? theme.colors.primaryContainer 
        : theme.colors.primaryContainer,
    },
    drugCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      justifyContent: 'space-between',
    },
    drugTextContainer: {
      flex: 1,
    },
    drugTitle: {
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
      fontWeight: '500',
    },
    selectedIconContainer: {
      marginLeft: 16,
    },
    interactionCard: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      borderRadius: 16,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      elevation: 8,
    },
    interactionCardContent: {
      padding: 16,
    },
    interactionHeader: {
      gap: 12,
      alignItems: 'center',
    },
    drugPillsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    drugPill: {
      backgroundColor: isDarkMode ? theme.colors.surfaceVariant : theme.colors.surfaceVariant,
      height: 32,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'nowrap',
      minWidth: 0,
      paddingHorizontal: 12,
    },
    interactionStatus: {
      fontWeight: '600',
      flex: 1,
      flexShrink: 1,
      fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
      textAlign: 'center',
      marginHorizontal: 8,
      lineHeight: 28,
    },
    snackbar: {
      marginBottom: 16,
    },
    modalContainer: {
      flex: 1,
      margin: 0,
    },
    modalHeader: {
      elevation: 0,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
    },
    modalContent: {
      flexGrow: 1,
      padding: 16,
    },
    modalCard: {
      borderRadius: 16,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
      overflow: 'hidden',
    },
    modalStatusSection: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: isDarkMode ? theme.colors.elevation.level1 : theme.colors.surfaceVariant,
    },
    modalDivider: {
      backgroundColor: isDarkMode ? theme.colors.surfaceVariant : theme.colors.outlineVariant,
    },
    modalDetailsSection: {
      padding: 24,
    },
    modalSectionTitle: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      fontWeight: '600',
    },
    modalStatusText: {
      marginTop: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    modalNoteText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
    modalDefinitionText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
    modalActionsSection: {
      padding: 24,
      paddingTop: 0,
    },
    modalButton: {
      borderRadius: 28,
    },
    drugDetailModal: {
      flex: 1,
      margin: 0,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    },
    loadingText: {
      marginTop: 10,
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
  });

export default CombosRoute;
