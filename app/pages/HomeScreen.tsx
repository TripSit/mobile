import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes, Route } from '../routes';
import FactsRoute from './FactsRoute';
import CombosRoute from './CombosRoute';
import WikiRoute from './WikiRoute';
import ChatRoute from './ChatRoute';
import ContactRoute from './ContactRoute';
import AboutRoute from './AboutRoute';

interface HomeScreenProps {
  theme: typeof import('../themes').lightTheme;
}

export default function HomeScreen({ theme }: HomeScreenProps) {
  const [index, setIndex] = React.useState(0);

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
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderIcon={({ route, color }) => (
        <MaterialCommunityIcons name={route.icon} size={24} color={color} />
      )}
      barStyle={{ backgroundColor: theme.colors.primary }}
      shifting={true}
    />
  );
}