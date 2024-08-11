import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar, Chip, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

// URLs for the JSON data
const COMBOS_URL = 'https://raw.githubusercontent.com/TripSit/drugs/main/combos.json';
const COMBO_DEFINITIONS_URL = 'https://raw.githubusercontent.com/TripSit/drugs/main/combo_definitions.json';

const CombosRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [combosData, setCombosData] = useState({});
  const [comboDefinitions, setComboDefinitions] = useState({});
  const { colors } = useTheme();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cachedCombos, cachedDefinitions] = await Promise.all([
          AsyncStorage.getItem('combos'),
          AsyncStorage.getItem('combo_definitions'),
        ]);

        if (cachedCombos && cachedDefinitions) {
          setCombosData(JSON.parse(cachedCombos));
          setComboDefinitions(JSON.parse(cachedDefinitions));
        }

        const [combosResponse, definitionsResponse] = await Promise.all([
          fetch(COMBOS_URL),
          fetch(COMBO_DEFINITIONS_URL),
        ]);

        const combosJson = await combosResponse.json();
        const definitionsJson = await definitionsResponse.json();

        setCombosData(combosJson);
        setComboDefinitions(definitionsJson);

        await AsyncStorage.setItem('combos', JSON.stringify(combosJson));
        await AsyncStorage.setItem('combo_definitions', JSON.stringify(definitionsJson));
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch or store data.');
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleDrugSelection = (drug: string) => {
    setSelectedDrugs((prevSelected) =>
      prevSelected.includes(drug)
        ? prevSelected.filter((d) => d !== drug)
        : [...prevSelected, drug]
    );
  };

  const renderCombinationResult = () => {
    if (selectedDrugs.length < 2) return null;

    const drug1 = selectedDrugs[0];
    const drug2 = selectedDrugs[1];
    const interaction = combosData[drug1]?.[drug2];

    if (!interaction) {
      return (
        <Text style={styles.noInteractionText}>No interaction data available for this combination.</Text>
      );
    }

    return (
      <Card style={styles.resultCard}>
        <Card.Title
          title={`${drug1.toUpperCase()} + ${drug2.toUpperCase()}`}
          left={(props) => <MaterialCommunityIcons {...props} name="flask" size={40} />}
        />
        <Card.Content>
          <Text style={styles.interactionText}>Status: {interaction.status}</Text>
          <Text style={styles.interactionNote}>{interaction.note}</Text>
          <Text style={styles.interactionDetail}>
            {comboDefinitions[interaction.status]}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const filteredDrugs = Object.keys(combosData).filter((drug) =>
    drug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search for a drug"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredDrugs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleDrugSelection(item)}>
            <Chip
              mode="outlined"
              selected={selectedDrugs.includes(item)}
              style={[
                styles.chip,
                { backgroundColor: selectedDrugs.includes(item) ? colors.primary : '#FFFFFF' },
              ]}
              textStyle={[
                styles.chipText,
                { color: selectedDrugs.includes(item) ? '#FFFFFF' : colors.text },
              ]}
            >
              {item}
            </Chip>
          </TouchableOpacity>
        )}
        horizontal
        contentContainerStyle={styles.drugList}
      />
      <ScrollView contentContainerStyle={styles.resultContainer}>
        {renderCombinationResult()}
      </ScrollView>
      <Button
        mode="contained"
        onPress={() => setSelectedDrugs([])}
        style={styles.clearButton}
      >
        Clear Selection
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
  chip: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  chipText: {
    fontSize: 16,
  },
  drugList: {
    paddingVertical: 10,
  },
  resultContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  resultCard: {
    marginBottom: 20,
  },
  interactionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  interactionNote: {
    fontSize: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  interactionDetail: {
    fontSize: 14,
    color: '#888',
  },
  noInteractionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  clearButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default CombosRoute;
