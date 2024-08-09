import * as React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { Searchbar, Card, Title, Paragraph, Chip } from 'react-native-paper';
import DrugDetailScreen from '../components/DrugDetail'; // Import the DrugDetailScreen

// Define types for the drug data
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
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);  // State for selected drug

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
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{item.name}</Title>
            <View style={styles.chipContainer}>
              {categoriesArray.map((category, index) => (
                <Chip
                  key={index}
                  style={[styles.chip, { backgroundColor: getCategoryColor(category) }]}
                  textStyle={styles.chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
            <Paragraph style={styles.summary}>{item.summary}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading...</Text>
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
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderDrug}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    margin: 10,
    marginTop: 50,
    borderRadius: 10,
    elevation: 3,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: '#2E2E2E',
  },
  title: {
    color: '#FFFFFF',
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
    color: '#B0B0B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FactsRoute;
