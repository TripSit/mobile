/* eslint-disable sonarjs/no-all-duplicated-branches */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Animated,
  ScrollView,
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
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@react-navigation/native';
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

  const categoryIcons: { [key: string]: string } = {
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
  };

  const renderDrug = ({ item }: { item: Drug }) => {
    const isSelected = selectedDrugs.some(drug => drug.name === item.name);
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const iconName = categoryIcons[item.categories[0]?.toLowerCase()] ?? categoryIcons.default;

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          onPress={() => toggleDrugSelection(item)}
          onLongPress={() => setSelectedDrugDetail(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Card
            style={[
              styles(isDarkMode).card,
              isSelected && { borderColor: theme.colors.primary },
            ]}
          >
            <Card.Title
              title={item.pretty_name}
              titleStyle={styles(isDarkMode).title}
              left={props => (
                <Avatar.Icon
                  {...props}
                  icon={iconName}
                  color="#FFFFFF"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
            />
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderInteractionResult = () => {
    if (selectedDrugs.length === 2) {
      const [drug1, drug2] = selectedDrugs;
      const statusText = interactionResult ? interactionResult.status : 'No interaction data available';
      const statusColor = interactionResult ? getStatusColor(interactionResult.status) : DEFAULT_COLOR;

      return (
        <Surface style={styles(isDarkMode).interactionSurface}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <View style={styles(isDarkMode).interactionContainer}>
              {/* eslint-disable-next-line sonarjs/no-all-duplicated-branches */}
              <MaterialCommunityIcons 
                name={interactionResult ? getStatusIcon(interactionResult.status) : ICON_HELP}
                size={32} 
                color={statusColor} 
              />
              <View style={styles(isDarkMode).interactionTextContainer}>
                <Text style={styles(isDarkMode).interactionTitle}>
                  {drug1.pretty_name} + {drug2.pretty_name}
                </Text>
                {/* eslint-disable-next-line sonarjs/no-all-duplicated-branches */}
                <Text style={[styles(isDarkMode).interactionStatus, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={32} color={theme.colors.onSurface} />
            </View>
          </TouchableOpacity>
        </Surface>
      );
    }
    return null;
  };

  const renderInteractionModal = () => {
    if (!selectedDrugs || selectedDrugs.length !== 2) {
      return null;
    }

    const [drug1, drug2] = selectedDrugs;
    const modalContentStyle = [
      styles(isDarkMode).modalContainer,
      { backgroundColor: isDarkMode ? DEFAULT_DARK_BG : '#FFFFFF' }
    ];

    return (
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        contentContainerStyle={modalContentStyle}
      >
        <Appbar.Header style={styles(isDarkMode).modalHeader}>
          <Appbar.BackAction onPress={() => setIsModalVisible(false)} />
          <Appbar.Content title={`${drug1.pretty_name} + ${drug2.pretty_name}`} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles(isDarkMode).modalContent}>
          <View style={styles(isDarkMode).statusContainer}>
            {interactionResult ? (
              <>
                <MaterialCommunityIcons 
                  name={getStatusIcon(interactionResult.status)} 
                  size={48} 
                  color={getStatusColor(interactionResult.status)} 
                />
                <Text style={[styles(isDarkMode).modalStatusText, { color: getStatusColor(interactionResult.status) }]}>
                  {interactionResult.status}
                </Text>
                {interactionResult.note && (
                  <Text style={styles(isDarkMode).modalNoteText}>{interactionResult.note}</Text>
                )}
                <Text style={styles(isDarkMode).modalDefinitionText}>
                  {comboDefinitions.find(
                    def => def.status.toLowerCase() === interactionResult.status.toLowerCase()
                  )?.definition || 'No definition available for this status.'}
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="help-circle-outline" size={48} color={DEFAULT_COLOR} />
                <Text style={[styles(isDarkMode).modalStatusText, { color: DEFAULT_COLOR }]}>
                  No interaction data available
                </Text>
                <Text style={styles(isDarkMode).modalNoteText}>
                  Please exercise caution and consult additional resources.
                </Text>
              </>
            )}
            <Button
              mode="contained"
              onPress={() => {
                setSelectedDrugs([]);
                setIsModalVisible(false);
              }}
              style={styles(isDarkMode).clearButton}
            >
              Clear Selection
            </Button>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(isDarkMode).loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles(isDarkMode).container}>
      <Appbar.Header style={styles(isDarkMode).appBar}>
        <Appbar.Content title="Drug Combinations" />
      </Appbar.Header>
      <Searchbar
        placeholder="Search substances"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles(isDarkMode).searchBar}
        inputStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
        placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
        iconColor={isDarkMode ? '#FFFFFF' : '#000000'}
      />
      <FlatList
        data={filteredDrugs}
        keyExtractor={item => item.id}
        renderItem={renderDrug}
        contentContainerStyle={styles(isDarkMode).listContainer}
      />
      {renderInteractionResult()}
      <Portal>
        {renderInteractionModal()}
        <Modal
          visible={!!selectedDrugDetail}
          onDismiss={() => setSelectedDrugDetail(null)}
          contentContainerStyle={[
            styles(isDarkMode).drugDetailModal,
            { backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF' },
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
        >
          You can only select two substances at a time.
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
    },
    appBar: {
      backgroundColor: isDarkMode ? '#1F1F1F' : '#6200EE',
    },
    searchBar: {
      marginHorizontal: 10,
      marginVertical: 10,
      borderRadius: 8,
      elevation: 2,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
    },
    listContainer: {
      paddingHorizontal: 10,
      paddingBottom: 100,
    },
    card: {
      marginVertical: 8,
      borderRadius: 8,
      elevation: 2,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    title: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    interactionSurface: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 8,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    interactionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    interactionTextContainer: {
      flex: 1,
      marginLeft: 16,
    },
    interactionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    interactionStatus: {
      fontSize: 16,
      marginTop: 4,
    },
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      backgroundColor: isDarkMode ? '#1F1F1F' : '#6200EE',
    },
    modalContent: {
      padding: 16,
    },
    statusContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    modalStatusText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 8,
    },
    modalNoteText: {
      fontSize: 16,
      marginBottom: 16,
      color: isDarkMode ? '#DDDDDD' : '#424242',
    },
    modalDefinitionText: {
      fontSize: 16,
      color: isDarkMode ? '#DDDDDD' : '#424242',
      fontStyle: 'italic',
    },
    clearButton: {
      marginTop: 24,
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
    drugDetailModal: {
      flex: 1,
      margin: 0,
    },
  });

export default CombosRoute;
