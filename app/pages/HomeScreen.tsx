import * as React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routes } from '../routes';
import FactsRoute from './FactsRoute';
import CombosRoute from './CombosRoute';
import ChatRoute from './ChatRoute';
import AboutRoute from './AboutRoute';
import { useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

interface HomeScreenProps {
  theme: any; 
}

const MD3BottomNavigation = (props: any) => {
  const { navigationState, onIndexChange, renderScene, renderIcon, barStyle, activeColor, shifting } = props;
  const { index, routes } = navigationState;
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  
  const surfaceColor = isDark ? paperTheme.colors.surface : paperTheme.colors.background;
  const elevationColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {renderScene({ route: routes[index], jumpTo: (key: string) => {
          const routeIndex = routes.findIndex(route => route.key === key);
          if (routeIndex !== -1) {
            onIndexChange(routeIndex);
          }
        }})}
      </View>
      
      <Animatable.View 
        style={[
          styles.bottomBar, 
          barStyle,
          { 
            backgroundColor: surfaceColor,
            borderTopColor: elevationColor,
            borderTopWidth: 1,
          }
        ]}
        animation="slideInUp"
        duration={500}
      >
        {routes.map((route: any, routeIndex: number) => {
          const focused = routeIndex === index;
          const color = focused ? activeColor : isDark ? paperTheme.colors.onSurfaceVariant : '#757575';
          
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={() => {
                if (index !== routeIndex) {
                  onIndexChange(routeIndex);
                }
              }}
              android_ripple={{ 
                color: paperTheme.colors.primary + '40', 
                borderless: false,
                radius: 32 
              }}
            >
              <Animatable.View
                animation={focused ? 'pulse' : undefined}
                iterationCount={focused ? 1 : undefined}
                duration={400}
                style={styles.iconContainer}
              >
                {renderIcon({ route, focused, color })}
              </Animatable.View>
              
              {focused && (
                <Animatable.View 
                  style={[
                    styles.activeDot, 
                    { backgroundColor: paperTheme.colors.primary }
                  ]}
                  animation="fadeIn"
                  duration={300}
                />
              )}
              
              {shifting && (
                <Animatable.View
                  animation={focused ? 'fadeIn' : 'fadeOut'}
                  duration={200}
                  style={styles.labelContainer}
                >
                  <Text 
                    style={[
                      styles.label, 
                      { color: focused ? activeColor : color }
                    ]} 
                    numberOfLines={1}
                  >
                    {route.title}
                  </Text>
                </Animatable.View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animatable.View>
    </View>
  );
};

export default function HomeScreen() {
  const [index, setIndex] = React.useState(0);
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const [routesState] = React.useState(routes);
  const isDark = useColorScheme() === 'dark';

  const renderScene = ({ route }: { route: any }) => {
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
    <MD3BottomNavigation
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
