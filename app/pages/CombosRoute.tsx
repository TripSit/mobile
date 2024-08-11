import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Card, Button, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import the combos data and definitions
const comboData = require('../data/combos.json');
const comboDefinitions = require('../data/combo_definitions.json');

type DrugCombo = {
  [key: string]: {
    status: string;
    note?: string;
  };
};

const CombosRoute = () => {
  const theme = useTheme();
  const [firstDrugQuery, setFirstDrugQuery] = useState('');
  const [secondDrugQuery, setSecondDrugQuery] = useState('');
  const [selectedFirstDrug, setSelectedFirstDrug] = useState<string | null>(null);
  const [selectedSecondDrug, setSelectedSecondDrug] = useState<string | null>(null);
  const [drugCombos, setDrugCombos] = useState<DrugCombo | null>(null);

  useEffect(() => {
    loadDrugCombos();
  }, []);

  const loadDrugCombos = async () => {
    try {
      const cachedCombos = await AsyncStorage.getItem('drugCombos');
      if (cachedCombos) {
        setDrugCombos(JSON.parse(cachedCombos));
      } else {
        setDrugCombos(comboData);
        await AsyncStorage.setItem('drugCombos', JSON.stringify(comboData));
      }
    } catch (error) {
      console.error('Failed to load combos:', error);
    }
  };

  const handleDrugSelect = (drug: string, type: 'first' | 'second') => {
    if (type === 'first') {
      setSelectedFirstDrug(drug);
    } else {
      setSelectedSecondDrug(drug);
    }
  };

  const getComboResult = () => {
    if (selectedFirstDrug && selectedSecondDrug && drugCombos) {
      const [drug1, drug2] = [selectedFirstDrug, selectedSecondDrug].sort();
      const comboKey = `${drug1}-${drug2}`;
      return drugCombos[comboKey];
    }
    return null;
  };

  const renderDrugOption = (drug: string, type: 'first' | 'second') => (
    <TouchableOpacity key={drug} onPress={() => handleDrugSelect(drug, type)}>
      <Card style={styles.drugOptionCard}>
        <Card.Content>
          <Text>{drug}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const filteredFirstDrugs = Object.keys(comboDefinitions).filter((drug) =>
    drug.toLowerCase().includes(firstDrugQuery.toLowerCase())
  );

  const filteredSecondDrugs = Object.keys(comboDefinitions).filter((drug) =>
    drug.toLowerCase().includes(secondDrugQuery.toLowerCase())
  );

  const comboResult = getComboResult();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar for the first drug */}
      <Searchbar
        placeholder="Search for first drug"
        onChangeText={setFirstDrugQuery}
        value={firstDrugQuery}
        style={styles.searchbar}
      />
      <ScrollView style={styles.drugList}>
        {filteredFirstDrugs.map((drug) => renderDrugOption(drug, 'first'))}
      </ScrollView>

      {/* Search bar for the second drug */}
      <Searchbar
        placeholder="Search for second drug"
        onChangeText={setSecondDrugQuery}
        value={secondDrugQuery}
        style={styles.searchbar}
      />
      <ScrollView style={styles.drugList}>
        {filteredSecondDrugs.map((drug) => renderDrugOption(drug, 'second'))}
      </ScrollView>

      {comboResult ? (
        <Card style={styles.resultCard}>
          <Card.Content>
            <MaterialCommunityIcons
              name="flask"
              size={40}
              color={theme.colors.primary}
              style={styles.resultIcon}
            />
            <Text style={styles.resultText}>
              {selectedFirstDrug} + {selectedSecondDrug}
            </Text>
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              Status: {comboResult.status}
            </Text>
            {comboResult.note && <Text style={styles.noteText}>{comboResult.note}</Text>}
          </Card.Content>
        </Card>
      ) : (
        selectedFirstDrug && selectedSecondDrug && (
          <Text style={styles.errorText}>
            No interaction information available for the selected combination.
          </Text>
        )
      )}

      <Button
        mode="contained"
        onPress={() => {
          setSelectedFirstDrug(null);
          setSelectedSecondDrug(null);
          setFirstDrugQuery('');
          setSecondDrugQuery('');
        }}
        style={styles.clearButton}
        labelStyle={styles.clearButtonText}
      >
        Clear Selection
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 10,
  },
  drugList: {
    marginBottom: 16,
  },
  drugOptionCard: {
    marginVertical: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  resultCard: {
    marginVertical: 20,
    borderRadius: 10,
  },
  resultIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  noteText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6a6a6a',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff0000',
    marginVertical: 20,
  },
  clearButton: {
    marginTop: 'auto',
    borderRadius: 30,
  },
  clearButtonText: {
    fontSize: 16,
  },
});

export default CombosRoute;
