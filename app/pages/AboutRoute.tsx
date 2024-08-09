import * as React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AboutRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="information" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>About</Text>
  </View>
);

export default AboutRoute;