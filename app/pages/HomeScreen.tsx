import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes } from '../routes';
import FactsRoute from './FactsRoute';
import CombosRoute from './CombosRoute';
import WikiRoute from './WikiRoute';
import ChatRoute from './ChatRoute';
import ContactRoute from './ContactRoute';
import AboutRoute from './AboutRoute';
import { useTheme } from '@react-navigation/native';

interface HomeScreenProps {
  theme: any; 
}

export default function HomeScreen() {
  const [index, setIndex] = React.useState(0);
  const theme = useTheme(); 
  const [routesState] = React.useState(routes);

  const renderScene = BottomNavigation.SceneMap({
    facts: FactsRoute,
    combos: CombosRoute,
    wiki: WikiRoute,
    chat: ChatRoute,
    contact: ContactRoute,
    about: AboutRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes: routesState }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderIcon={({ route, focused, color }) => (
        <MaterialCommunityIcons
          name={route.icon}
          size={24}
          color={color}
          style={styles.icon}
        />
      )}
      barStyle={[
        styles.barStyle,
        {
          ...Platform.select({
            android: { elevation: 8 },
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          }),
        },
      ]}
      activeColor={theme.colors.primary}
      shifting={false} 
      sceneAnimationEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
    marginBottom: 5, 
  },
  barStyle: {
  },
});
