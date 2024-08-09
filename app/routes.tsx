import { BottomNavigationRoute } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface Route extends BottomNavigationRoute {
  key: string;
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export const routes: Route[] = [
  { key: 'facts', title: 'Facts', icon: 'book' },
  { key: 'combos', title: 'Combos', icon: 'flask' },
  { key: 'wiki', title: 'Wiki', icon: 'earth' },
  { key: 'chat', title: 'Chat', icon: 'chat' },
  { key: 'contact', title: 'Contact', icon: 'email' },
  { key: 'about', title: 'About', icon: 'information' },
];