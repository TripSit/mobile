import * as React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WikiRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="earth" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Wiki</Text>
  </View>
);

export default WikiRoute;