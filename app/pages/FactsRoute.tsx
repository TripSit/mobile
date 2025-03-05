// FactsRoute.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  BackHandler,
  Linking,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  Searchbar,
  Card,
  Paragraph,
  Appbar,
  Avatar,
  Text,
  Chip,
  Checkbox,
  Portal,
  Modal,
  Button,
  useTheme,
  IconButton,
  Surface,
  FAB,
  Divider,
  Title,
  MD3Colors,
  Tooltip,
  AnimatedFAB,
  SegmentedButtons,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import localDrugData from '../data/drugs.json';
import DrugDetailScreen from '../components/DrugDetail';
import { formatDistance } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Combo = {
  status: string;
  note?: string;
  sources?: {
    author: string;
    title: string;
    url: string;
  }[];
};

type FormattedTiming = {
  _unit: string;
  value?: string;
  Insufflated?: string;
  Oral?: string;
  [key: string]: string | undefined;
};

type DrugProperties = {
  summary?: string;
  after_effects?: string;
  avoid?: string;
  half_life?: string;
  marquis?: string;
  aliases?: string[];
  categories?: string[];
  dose?: string;
  onset?: string;
  [key: string]: string | string[] | undefined;
};

type DrugSources = {
  _general?: string[];
  bioavailability?: string[];
  [key: string]: string[] | undefined;
};

type DrugDetail = {
  name: string;
  pretty_name?: string;
  aliases?: string[];
  categories?: string[];
  combos?: { [key: string]: Combo };
  dose_note?: string;
  formatted_aftereffects?: any;
  formatted_dose?: { [key: string]: { [key: string]: string } };
  formatted_duration?: any;
  formatted_effects?: string[];
  formatted_onset?: any;
  links?: { [key: string]: string };
  properties?: DrugProperties;
  pweffects?: { [key: string]: string };
  sources?: DrugSources;
  [key: string]: any; // Allow additional properties
};

type Drug = {
  id: string;
  name: string;
  summary: string;
  categories: string[];
  aliases: string[];
  details: DrugDetail;
};

type ApiDrugObject = {
  [key: string]: Omit<DrugDetail, 'name'> & { name?: string };
};

type ApiResponse = ApiDrugObject[];

const transformToRequired = (detail: DrugDetail, drugName: string): DrugDetail => {
  return {
    ...detail,
    name: detail.name || drugName,
  };
};

const parseApiDrug = (drugName: string, drugDetails: ApiDrugObject[string], index: number, innerIndex: number): Drug => ({
  id: `${index}-${innerIndex}`,
  name: drugDetails.pretty_name || drugName,
  summary: drugDetails.properties?.summary || 'No summary available.',
  categories: drugDetails.categories || ['Uncategorized'],
  aliases: drugDetails.aliases || [],
  details: {
    ...drugDetails,
    name: drugName,
  },
});

const parseLocalDrug = (drugName: string, drugDetails: ApiDrugObject[string], index: number): Drug => ({
  id: `${index}`,
  name: drugDetails.pretty_name || drugName,
  summary: drugDetails.properties?.summary || 'No summary available.',
  categories: drugDetails.categories || ['Uncategorized'],
  aliases: drugDetails.aliases || [],
  details: {
    ...drugDetails,
    name: drugName,
  },
});

const parseApiData = (data: ApiResponse): Drug[] => {
  const drugs: Drug[] = [];
  data.forEach((drugObject, index) => {
    Object.entries(drugObject).forEach(([drugName, drugDetails], innerIndex) => {
      drugs.push(parseApiDrug(drugName, drugDetails, index, innerIndex));
    });
  });
  return drugs;
};

const parseLocalData = (data: Record<string, DrugDetail>): Drug[] => {
  return Object.entries(data).map(([drugName, drugDetails], index) => 
    parseLocalDrug(drugName, drugDetails, index)
  );
};

const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const FactsRoute: React.FC = () => {
  const [data, setData] = useState<Drug[]>([]);
  const [displayedData, setDisplayedData] = useState<Drug[]>([]);
  const [filteredData, setFilteredData] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const isDarkMode = useColorScheme() === 'dark';

  const ITEMS_PER_PAGE = 20;
  const [page, setPage] = useState<number>(1);

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;

  // Animation values
  const searchBarHeight = useSharedValue(0);
  const filterModalY = useSharedValue(windowHeight);
  const headerOpacity = useSharedValue(1);
  const listScale = useSharedValue(1);

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(searchBarHeight.value, [0, 56], [0, 1], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(searchBarHeight.value, [0, 56], [-20, 0], Extrapolate.CLAMP),
      },
    ],
    height: searchBarHeight.value,
    overflow: 'hidden',
  }));

  const filterModalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: filterModalY.value }],
  }));

  const toggleSearchBar = () => {
    if (searchBarHeight.value === 0) {
      searchBarHeight.value = withSpring(56);
      headerOpacity.value = withTiming(0.8);
      listScale.value = withTiming(0.98);
    } else {
      searchBarHeight.value = withSpring(0);
      headerOpacity.value = withTiming(1);
      listScale.value = withTiming(1);
      setSearchQuery('');
      applyFilters('', selectedCategories);
    }
    setIsSearchBarVisible(!isSearchBarVisible);
  };

  const toggleFilterModal = () => {
    if (filterModalY.value === windowHeight) {
      filterModalY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      listScale.value = withTiming(0.95, { duration: 200 });
    } else {
      filterModalY.value = withSpring(windowHeight, {
        damping: 20,
        stiffness: 90,
      });
      listScale.value = withTiming(1, { duration: 200 });
    }
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  useEffect(() => {
    let isMounted = true;

    const parseDrugData = (data: ApiResponse | Record<string, DrugDetail>): Drug[] => {
      return Array.isArray(data) ? parseApiData(data) : parseLocalData(data);
    };

    const loadData = async () => {
      try {
        setLoading(true);

        // Try to get data from AsyncStorage
        const storedData = await AsyncStorage.getItem('drugData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (isMounted) {
            setData(parsedData);
            setFilteredData(parsedData);
            setDisplayedData(parsedData.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
          }
        } else {
          // If no data in AsyncStorage, load from local JSON
          if (localDrugData) {
            const parsedData = parseDrugData(localDrugData);
            if (isMounted) {
              setData(parsedData);
              setFilteredData(parsedData);
              setDisplayedData(parsedData.slice(0, ITEMS_PER_PAGE));
              setLoading(false);
            }
          } else {
            // If no local data, show error
            if (isMounted) {
              setLoading(false);
              console.error('No data available');
            }
          }
        }

        // Check internet connectivity
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            // Fetch data from API
            fetch('https://tripsit.me/api/tripsit/getalldrugs')
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then(result => {
                if (result && result.data) {
                  const drugs = parseDrugData(result.data);

                  if (isMounted) {
                    setData(drugs);
                    setFilteredData(drugs);
                    setDisplayedData(drugs.slice(0, ITEMS_PER_PAGE));
                  }

                  // Save data to AsyncStorage
                  AsyncStorage.setItem('drugData', JSON.stringify(drugs)).catch(error => {
                    console.error('Error saving data to AsyncStorage:', error);
                  });
                }
              })
              .catch(error => {
                console.error('Error fetching data from API:', error);
              });
          } else {
            // Not connected
            console.log('No internet connection');
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedCategories);
  };

  const handleCategorySelection = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);
    applyFilters(searchQuery, updatedCategories);
  };

  const applyFilters = (query: string, categories: string[]) => {
    let filtered = data;

    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(drug => {
        const nameMatch = drug.name.toLowerCase().includes(lowerCaseQuery);
        const aliasMatch = drug.aliases.some(alias =>
          alias.toLowerCase().includes(lowerCaseQuery),
        );
        return nameMatch || aliasMatch;
      });
    }

    if (categories.length > 0) {
      filtered = filtered.filter(drug =>
        drug.categories.some(category =>
          categories.includes(category.toLowerCase()),
        ),
      );
    }

    setFilteredData(filtered);
    setDisplayedData(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
  };

  const loadMoreData = () => {
    const nextPage = page + 1;
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newData = filteredData.slice(startIndex, endIndex);
    if (newData.length > 0) {
      setDisplayedData([...displayedData, ...newData]);
      setPage(nextPage);
    }
  };

  const getIconForCategory = (category: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
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
    };
    return iconMap[category] || 'pill';
  };

  const categoryColors: { [key: string]: string } = {
    depressant: '#2196F3',
    psychedelic: '#9C27B0',
    stimulant: '#FFC107',
    opioid: '#FF5722',
    cannabinoid: '#4CAF50',
    dissociative: '#00BCD4',
    deliriant: '#795548',
    nootropic: '#3F51B5',
    'research chemical': '#607D8B',
    antidepressant: '#E91E63',
    antipsychotic: '#9E9E9E',
    benzodiazepine: '#673AB7',
    ssri: '#F06292',
    maoi: '#8BC34A',
    vitamin: '#FFEB3B',
    entactogen: '#F44336',
    alcohol: '#FF9800',
    gabaergic: '#3F51B5',
    steroid: '#009688',
    unclassified: '#757575',
    'habit-forming': '#FF5252',
  };

  const getCategoryColor = (categories: string[]): string => {
    for (const category of categories) {
      if (categoryColors[category.toLowerCase()]) {
        return categoryColors[category.toLowerCase()];
      }
    }
    return '#757575';
  };

  const renderDrug = useCallback(({ item, index }: { item: Drug; index: number }) => {
    const categories = item.categories;
    const icon = getIconForCategory(categories[0]);
    const color = getCategoryColor(categories);

    return (
      <Animated.View
        entering={FadeIn.delay(index * 100).springify()}
        exiting={FadeOut}
      >
        <TouchableOpacity onPress={() => setSelectedDrug(item)}>
          <Card
            style={[
              styles(isDarkMode, theme).card,
              { borderLeftColor: color, elevation: 2 },
            ]}
            mode="elevated"
          >
            <Card.Title
              title={item.name}
              titleStyle={styles(isDarkMode, theme).title}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon={icon}
                  color="#FFFFFF"
                  style={{ backgroundColor: color }}
                />
              )}
            />
            <Card.Content>
              <View style={styles(isDarkMode, theme).chipContainer}>
                {categories.map((category, idx) => (
                  <Chip
                    key={idx}
                    style={[
                      styles(isDarkMode, theme).chip,
                      {
                        backgroundColor: color,
                        opacity: 0.9,
                      },
                    ]}
                    textStyle={styles(isDarkMode, theme).chipText}
                    onPress={() => handleCategorySelection(category.toLowerCase())}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
              <Paragraph style={styles(isDarkMode, theme).summary}>
                {item.summary.length > 150
                  ? `${item.summary.slice(0, 150)}...`
                  : item.summary}
              </Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [isDarkMode, theme]);

  const listAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: listScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles(isDarkMode, theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(isDarkMode, theme).loadingText}>Loading...</Text>
      </View>
    );
  }

  if (selectedDrug) {
    return (
      <View style={{ flex: 1 }}>
        <DrugDetailScreen drug={selectedDrug} onClose={() => setSelectedDrug(null)} />
      </View>
    );
  }

  return (
    <View style={styles(isDarkMode, theme).container}>
      <Animated.View style={[styles(isDarkMode, theme).header, { opacity: headerOpacity }]}>
        <Appbar.Header 
          style={[
            styles(isDarkMode, theme).appBar,
            { backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface }
          ]} 
          mode="center-aligned"
          theme={{
            colors: {
              surface: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
            },
          }}
        >
          <Appbar.Content 
            title="Substances"
            titleStyle={{ color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface }}
          />
          <Appbar.Action 
            icon="filter-variant" 
            onPress={toggleFilterModal}
            iconColor={isDarkMode ? theme.colors.onSurface : theme.colors.onSurface}
          />
          <Appbar.Action
            icon={isSearchBarVisible ? 'close' : 'magnify'}
            onPress={toggleSearchBar}
            iconColor={isDarkMode ? theme.colors.onSurface : theme.colors.onSurface}
          />
        </Appbar.Header>
      </Animated.View>

      <Animated.View style={[styles(isDarkMode, theme).searchBarContainer, searchBarAnimatedStyle]}>
        <Searchbar
          placeholder="Search substances"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles(isDarkMode, theme).searchBar}
          inputStyle={{ color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface }}
        />
      </Animated.View>

      <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
        {loading ? (
          <View style={styles(isDarkMode, theme).loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles(isDarkMode, theme).loadingText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={displayedData}
            renderItem={renderDrug}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles(isDarkMode, theme).listContainer}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              displayedData.length < filteredData.length ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ margin: 16 }}
                />
              ) : null
            }
          />
        )}
      </Animated.View>

      <Portal>
        <Animated.View 
          style={[
            styles(isDarkMode, theme).filterModalOverlay,
            { opacity: interpolate(filterModalY.value, [windowHeight, windowHeight * 0.4], [0, 0.5]) }
          ]}
          pointerEvents={isFilterModalVisible ? 'auto' : 'none'}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={toggleFilterModal}
            activeOpacity={1}
          />
        </Animated.View>
        <AnimatedSurface style={[styles(isDarkMode, theme).filterModal, filterModalAnimatedStyle]}>
          <View style={styles(isDarkMode, theme).filterModalHandle} />
          <View style={styles(isDarkMode, theme).filterModalContent}>
            <View style={styles(isDarkMode, theme).filterModalHeader}>
              <Text variant="titleLarge" style={styles(isDarkMode, theme).filterTitle}>
                Filter by Category
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={toggleFilterModal}
                mode="contained-tonal"
              />
            </View>
            <ScrollView
              style={styles(isDarkMode, theme).filterScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles(isDarkMode, theme).filterScrollContent}
            >
              <View style={styles(isDarkMode, theme).categoriesContainer}>
                {Array.from(
                  new Set(data.flatMap((drug) => drug.categories.map((cat) => cat.toLowerCase())))
                ).sort().map((category, index) => (
                  <Animated.View
                    key={category}
                    entering={FadeIn.delay(index * 50).springify()}
                  >
                    <Chip
                      selected={selectedCategories.includes(category)}
                      onPress={() => handleCategorySelection(category)}
                      style={[
                        styles(isDarkMode, theme).filterChip,
                        selectedCategories.includes(category) && {
                          backgroundColor: theme.colors.primaryContainer,
                        },
                      ]}
                      avatar={
                        <MaterialCommunityIcons
                          name={getIconForCategory(category)}
                          size={18}
                          color={selectedCategories.includes(category)
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant}
                        />
                      }
                      textStyle={{
                        color: selectedCategories.includes(category)
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                      }}
                      showSelectedOverlay
                      compact
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Chip>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>
            <Animated.View 
              style={styles(isDarkMode, theme).filterActions}
              entering={SlideInRight.delay(200)}
            >
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedCategories([]);
                  applyFilters(searchQuery, []);
                }}
                style={styles(isDarkMode, theme).clearButton}
                labelStyle={{ letterSpacing: 0 }}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={toggleFilterModal}
                style={styles(isDarkMode, theme).applyButton}
                labelStyle={{ letterSpacing: 0 }}
              >
                Apply {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
              </Button>
            </Animated.View>
          </View>
        </AnimatedSurface>
      </Portal>

      {selectedDrug && (
        <Portal>
          <Modal
            visible={!!selectedDrug}
            onDismiss={() => setSelectedDrug(null)}
            contentContainerStyle={styles(isDarkMode, theme).modalContent}
          >
            <DrugDetailScreen
              drug={selectedDrug}
              onClose={() => setSelectedDrug(null)}
            />
          </Modal>
        </Portal>
      )}
    </View>
  );
};

const styles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.background : theme.colors.background,
    },
    header: {
      zIndex: 1,
    },
    appBar: {
      elevation: 0,
    },
    searchBarContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: 'transparent',
    },
    searchBar: {
      borderRadius: 28,
      elevation: 2,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
      overflow: 'hidden',
    },
    title: {
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      borderRadius: 16,
    },
    chipText: {
      color: '#FFFFFF',
      fontSize: 12,
    },
    summary: {
      color: isDarkMode ? theme.colors.onSurfaceVariant : theme.colors.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
    },
    filterModalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
    },
    filterModal: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 16,
      paddingTop: 12,
      elevation: 8,
      height: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    filterModalHandle: {
      width: 32,
      height: 4,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    filterModalContent: {
      flex: 1,
    },
    filterModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    filterTitle: {
      color: isDarkMode ? theme.colors.onSurface : theme.colors.onSurface,
      fontWeight: '600',
      fontSize: 20,
    },
    filterScroll: {
      flex: 1,
    },
    filterScrollContent: {
      paddingBottom: 16,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 8,
    },
    filterChip: {
      marginBottom: 8,
      backgroundColor: isDarkMode ? theme.colors.elevation.level3 : theme.colors.surfaceVariant,
      height: 36,
    },
    filterActions: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 16,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    clearButton: {
      flex: 1,
      borderRadius: 20,
    },
    applyButton: {
      flex: 1,
      borderRadius: 20,
    },
    modalContent: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.surface,
      margin: 0,
    },
  });

export default FactsRoute;
