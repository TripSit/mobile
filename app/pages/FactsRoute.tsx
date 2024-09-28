import * as React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useState, useEffect } from 'react';
import {
  Searchbar,
  Card,
  Paragraph,
  Appbar,
  Avatar,
  Text,
  Chip,
  Button,
  Modal,
  Checkbox,
  Portal,
} from 'react-native-paper';
import DrugDetailScreen from '../components/DrugDetail';

type Drug = {
  id: string;
  name: string;
  summary: string;
  categories: string[];
  aliases: string[];
};

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

  useEffect(() => {
    fetch('https://tripsit.me/api/tripsit/getalldrugs')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        if (result && result.data) {
          const drugs: Drug[] = result.data.flatMap((drugObject: any, index: number) => {
            return Object.keys(drugObject).map((drugName, innerIndex) => {
              const drugDetails = drugObject[drugName];
              return {
                id: `${index}-${innerIndex}`,
                name: drugDetails.pretty_name || drugName,
                summary: drugDetails.properties?.summary || 'No summary available.',
                categories: drugDetails.categories || ['Uncategorized'],
                aliases: drugDetails.aliases || [],
              };
            });
          });

          setData(drugs);
          setFilteredData(drugs);
          setDisplayedData(drugs.slice(0, ITEMS_PER_PAGE));
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
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

  const getCategoryIcon = (categories: string[]): string => {
    for (let category of categories) {
      if (categoryIcons[category.toLowerCase()]) {
        return categoryIcons[category.toLowerCase()];
      }
    }
    return 'pill';
  };

  const getCategoryColor = (categories: string[]): string => {
    for (let category of categories) {
      if (categoryColors[category.toLowerCase()]) {
        return categoryColors[category.toLowerCase()];
      }
    }
    return '#757575';
  };

  const renderDrug = ({ item }: { item: Drug }) => {
    const categoriesArray = item.categories;
    const icon = getCategoryIcon(categoriesArray);
    const color = getCategoryColor(categoriesArray);

    return (
      <TouchableOpacity onPress={() => setSelectedDrug(item)}>
        <Card style={[styles(isDarkMode).card, { borderLeftColor: color }]}>
          <Card.Title
            title={item.name}
            titleStyle={styles(isDarkMode).title}
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
            <View style={styles(isDarkMode).chipContainer}>
              {categoriesArray.map((category, index) => (
                <Chip
                  key={index}
                  style={[
                    styles(isDarkMode).chip,
                    {
                      backgroundColor: categoryColors[category.toLowerCase()] || '#757575',
                    },
                  ]}
                  textStyle={styles(isDarkMode).chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
            <Paragraph style={styles(isDarkMode).summary}>
              {item.summary.length > 150 ? `${item.summary.slice(0, 150)}...` : item.summary}
            </Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode).loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles(isDarkMode).loadingText}>Loading...</Text>
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

  const allCategories = Array.from(
    new Set(data.flatMap(drug => drug.categories.map(cat => cat.toLowerCase()))),
  );

  return (
    <View style={styles(isDarkMode).container}>
      <Appbar.Header style={styles(isDarkMode).appBar}>
        <Appbar.Content title="Substances" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setIsFilterModalVisible(true)}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => setIsSearchBarVisible(!isSearchBarVisible)}
        />
      </Appbar.Header>
      {isSearchBarVisible && (
        <Searchbar
          placeholder="Search substances"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles(isDarkMode).searchBar}
          inputStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
          onIconPress={() => {
            setIsSearchBarVisible(false);
            setSearchQuery('');
            applyFilters('', selectedCategories);
          }}
        />
      )}
      <FlatList
        data={displayedData}
        keyExtractor={(item) => item.id}
        renderItem={renderDrug}
        contentContainerStyle={styles(isDarkMode).listContainer}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          displayedData.length < filteredData.length ? (
            <ActivityIndicator size="small" color="#6200EE" style={{ margin: 16 }} />
          ) : null
        }
      />
      <Portal>
        <Modal
          visible={isFilterModalVisible}
          onDismiss={() => setIsFilterModalVisible(false)}
          contentContainerStyle={[
            styles(isDarkMode).modalContainer,
            { backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF' },
          ]}
        >
          <Text style={styles(isDarkMode).modalTitle}>Filter by Categories</Text>
          <FlatList
            data={allCategories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles(isDarkMode).checkboxContainer}>
                <Checkbox
                  status={selectedCategories.includes(item) ? 'checked' : 'unchecked'}
                  onPress={() => handleCategorySelection(item)}
                  color={categoryColors[item] || '#757575'}
                />
                <Text style={styles(isDarkMode).checkboxLabel}>{item}</Text>
              </View>
            )}
          />
          <Button
            mode="contained"
            onPress={() => setIsFilterModalVisible(false)}
            style={styles(isDarkMode).applyButton}
          >
            Apply Filters
          </Button>
        </Modal>
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
      paddingBottom: 10,
    },
    card: {
      marginVertical: 8,
      borderRadius: 8,
      elevation: 2,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderLeftWidth: 5,
    },
    title: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontWeight: 'bold',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 8,
    },
    chip: {
      marginRight: 6,
      marginBottom: 6,
      backgroundColor: '#757575',
    },
    chipText: {
      color: '#FFFFFF',
      fontSize: 12,
    },
    summary: {
      color: isDarkMode ? '#DDDDDD' : '#424242',
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
    modalContainer: {
      margin: 20,
      padding: 20,
      borderRadius: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    checkboxLabel: {
      marginLeft: 8,
      color: isDarkMode ? '#FFFFFF' : '#000000',
      textTransform: 'capitalize',
    },
    applyButton: {
      marginTop: 10,
    },
  });

export default FactsRoute;
