import * as React from 'react';
import { StyleSheet, Platform, View, Text } from 'react-native';
import { BottomNavigation, useTheme as usePaperTheme, TouchableRipple, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes } from '../routes';
import FactsRoute from './FactsRoute';
import CombosRoute from './CombosRoute';
import ChatRoute from './ChatRoute';
import AboutRoute from './AboutRoute';
import Animated from 'react-native';

interface Route {
  key: string;
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const CustomBottomNavigation = ({ navigationState, onTabPress, renderIcon, getLabelText, activeColor, inactiveColor, barStyle }: any) => {
  const theme = usePaperTheme();
  
  return (
    <Surface 
      style={[styles(theme).bar, barStyle]} 
      elevation={2}
      theme={{
        colors: {
          surface: theme.colors.elevation.level2,
        },
      }}
    >
      <View style={styles(theme).bottomBar}>
        {navigationState.routes.map((route: Route, index: number) => {
          const focused = navigationState.index === index;
          const color = focused ? activeColor : inactiveColor;
          
          return (
            <TouchableRipple
              key={route.key}
              borderless
              centered
              rippleColor={`${theme.colors.primary}20`}
              onPress={() => onTabPress(index)}
              style={styles(theme).tabButton}
            >
              <Animated.View style={[
                styles(theme).iconContainer,
                focused && styles(theme).activeTab
              ]}>
                {renderIcon({ route, focused, color })}
                <View style={styles(theme).labelContainer}>
                  {getLabelText({ route, focused, color })}
                </View>
                {focused && (
                  <View style={[
                    styles(theme).activeIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]} />
                )}
              </Animated.View>
            </TouchableRipple>
          );
        })}
      </View>
    </Surface>
  );
};

export default function HomeScreen() {
  const [index, setIndex] = React.useState(0);
  const paperTheme = usePaperTheme();

  const navigationState = {
    index,
    routes: routes.map(route => ({
      ...route,
      key: route.key,
    })),
  };

  const renderScene = BottomNavigation.SceneMap({
    facts: FactsRoute,
    combos: CombosRoute,
    chat: ChatRoute,
    about: AboutRoute,
  });

  const renderIcon = ({ route, color }: { route: Route; color: string }) => (
    <MaterialCommunityIcons
      name={route.icon}
      size={24}
      color={color}
      style={styles(paperTheme).icon}
    />
  );

  const getLabelText = ({ route, color }: { route: Route; color: string }) => (
    <Text style={[styles(paperTheme).label, { color }]}>{route.title}</Text>
  );

  const handleTabPress = (newIndex: number) => {
    setIndex(newIndex);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {renderScene({ route: navigationState.routes[index], jumpTo: () => {} })}
      </View>
      <CustomBottomNavigation
        navigationState={navigationState}
        onTabPress={handleTabPress}
        renderIcon={renderIcon}
        getLabelText={getLabelText}
        activeColor={paperTheme.colors.primary}
        inactiveColor={paperTheme.colors.onSurfaceVariant}
        barStyle={[
          styles(paperTheme).barStyle,
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
      />
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  bar: {
    overflow: 'hidden',
    borderTopWidth: 0,
  },
  icon: {
    alignSelf: 'center',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  barStyle: {
  },
  bottomBar: {
    flexDirection: 'row',
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: `${theme.colors.primary}12`,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  labelContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  }
});
