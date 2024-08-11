import * as React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { Searchbar, Card, Title, Paragraph, Chip } from 'react-native-paper';
import DrugDetailScreen from '../components/DrugDetail';

type Drug = {
  id: string;
  name: string;
  summary: string;
  categories: string;
};

const FactsRoute: React.FC = () => {
  const [data, setData] = useState<Drug[]>([]);
  const [filteredData, setFilteredData] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);  // state
  const isDarkMode = useColorScheme() === 'dark';

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
                categories: drugDetails.categories ? drugDetails.categories.join(', ') : 'Uncategorized',
              };
            });
          });

          setData(drugs);
          setFilteredData(drugs);
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
    if (query) {
      const filtered = data.filter(drug =>
        drug.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'depressant':
        return '#FF6F61';
      case 'psychedelic':
        return '#6A1B9A';
      case 'stimulant':
        return '#43A047';
      case 'opioid':
        return '#F57C00';
      default:
        return '#9E9E9E';
    }
  };

  const renderDrug = ({ item }: { item: Drug }) => {
    const categoriesArray = item.categories.split(', ');

    return (
      <TouchableOpacity
        onPress={() => setSelectedDrug(item)}
      >
        <Card style={styles(isDarkMode).card}>
          <Card.Content>
            <Title style={styles(isDarkMode).title}>{item.name}</Title>
            <View style={styles(isDarkMode).chipContainer}>
              {categoriesArray.map((category, index) => (
                <Chip
                  key={index}
                  style={[styles(isDarkMode).chip, { backgroundColor: getCategoryColor(category) }]}
                  textStyle={styles(isDarkMode).chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
            <Paragraph style={styles(isDarkMode).summary}>{item.summary}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles(isDarkMode).loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
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

  return (
    <View style={styles(isDarkMode).container}>
      <Searchbar
        placeholder="Search"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles(isDarkMode).searchBar}
        inputStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderDrug}
        contentContainerStyle={styles(isDarkMode).listContainer}
      />
    </View>
  );
};

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0',
  },
  searchBar: {
    margin: 10,
    marginTop: 50,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF',
  },
  title: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: '#FFFFFF',
  },
  summary: {
    color: isDarkMode ? '#B0B0B0' : '#505050',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
});

export default FactsRoute;
