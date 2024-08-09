import * as React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CombosRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="flask" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Combos</Text>
  </View>
);

export default CombosRoute;