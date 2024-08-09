import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import * as React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme, BottomNavigation, BottomNavigationRoute } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac4',
    background: '#121212',
    surface: '#121212',
    text: '#ffffff',
  },
};

// Define a custom Route type that extends BottomNavigationRoute with an icon property
interface Route extends BottomNavigationRoute {
  key: string;
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export default function Index() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <HomeScreen theme={theme} />
    </PaperProvider>
  );
}

interface HomeScreenProps {
  theme: typeof lightTheme;
}

function HomeScreen({ theme }: HomeScreenProps) {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState<Route[]>([
    { key: 'facts', title: 'Facts', icon: 'book' },
    { key: 'combos', title: 'Combos', icon: 'flask' },
    { key: 'wiki', title: 'Wiki', icon: 'earth' },
    { key: 'chat', title: 'Chat', icon: 'chat' },
    { key: 'contact', title: 'Contact', icon: 'email' },
    { key: 'about', title: 'About', icon: 'information' },
  ]);

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

const FactsRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="book" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Facts</Text>
  </View>
);

const CombosRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="flask" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Combos</Text>
  </View>
);

const WikiRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="earth" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Wiki</Text>
  </View>
);

const ChatRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="chat" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Chat</Text>
  </View>
);

const ContactRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="email" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>Contact</Text>
  </View>
);

const AboutRoute = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="information" size={100} color="#6200ee" />
    <Text style={{ fontSize: 24, marginTop: 20 }}>About</Text>
  </View>
);