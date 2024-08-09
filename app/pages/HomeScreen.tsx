import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes } from '../routes';
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
      renderIcon={({ route, focused }) => (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={route.icon} 
            size={focused ? 28 : 24} // Dynamic size for selected state (Material 3)
            color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant} // Dynamic color based on selection
          />
        </View>
      )}
      barStyle={{
        backgroundColor: theme.colors.surface, // Using surface color from the theme
        elevation: 3, // Material 3 elevation value
        borderTopLeftRadius: 16, // Rounded corners for modern look
        borderTopRightRadius: 16,
      }}
      shifting={true}
      labeled={true} // Ensure labels are always visible
    />
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    height: '100%', // Take up the full height of the BottomNavigation
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    width: '100%', // Take up the full width to avoid any misalignment
  },
  parentContainer: {
    flexDirection: 'row', // Ensure the icons are laid out in a row
    alignItems: 'center', // Center the icons vertically
    justifyContent: 'space-around', // Distribute the icons evenly
  },
});
