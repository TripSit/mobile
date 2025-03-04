import * as React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BottomNavigation, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes } from '../routes';
import FactsRoute from './FactsRoute';
import CombosRoute from './CombosRoute';
import ChatRoute from './ChatRoute';
import AboutRoute from './AboutRoute';

interface Route {
  key: string;
  title: string;
  icon: string;
}

export default function HomeScreen() {
  const [index, setIndex] = React.useState(0);
  const [routesState] = React.useState(routes);
  const paperTheme = usePaperTheme();

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case 'facts':
        return <FactsRoute />;
      case 'combos':
        return <CombosRoute />;
      case 'chat':
        return <ChatRoute />;
      case 'about':
        return <AboutRoute />;
      default:
        return null;
    }
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes: routesState }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderIcon={({ route, _focused, color }) => (
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
            android: { elevation: 4 },
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          }),
        },
      ]}
      activeColor={paperTheme.colors.primary}
      shifting={false}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  barStyle: {
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    margin: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  inactiveDot: {
    width: 5,
    height: 5,
    marginTop: 4,
  },
  labelContainer: {
    marginTop: 2,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  }
});
