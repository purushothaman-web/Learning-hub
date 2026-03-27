import type { Lesson } from '../../types/curriculum';

export const reactNativeLessons: Lesson[] = [
  {
    id: 'rn_0',
    title: 'React Native vs The Web',
    badge: 'Mental Model',
    badgeClass: 'badge-concept',
    content: [
      'React Native uses the same React concepts you already know — components, props, state, hooks — but instead of rendering HTML to a browser DOM, it renders **native UI components** on iOS and Android. There is no HTML, no CSS, no browser. `<View>` replaces `<div>`, `<Text>` replaces `<p>`, `<TouchableOpacity>` replaces `<button>`.',
      'Styling in React Native uses a JavaScript object API that looks like CSS but is not CSS. There are no cascading styles, no class selectors, no media queries. Every component is styled individually using `StyleSheet.create()`. Flexbox works but defaults differ — the main axis is **vertical** by default, not horizontal like the web.',
      '**The biggest mental shift**: on the web a broken layout still renders something. On mobile a missing `<Text>` wrapper around a string crashes the entire app. React Native is stricter — every string must be inside a `<Text>` component, every tap target needs a touchable wrapper, and layout must be explicit.'
    ],
    code: `// ── Web React vs React Native side by side ──

// WEB
function WebCard({ title, onPress }) {
  return (
    <div className="card" onClick={onPress}>
      <h2>{title}</h2>
      <p>Tap to open</p>
    </div>
  );
}

// REACT NATIVE — same logic, native primitives
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function NativeCard({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Tap to open</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1d27',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,         // Android shadow
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: '#94a3b8',
  },
});`
  },
  {
    id: 'rn_1',
    title: 'Core Components & Layout',
    badge: 'Building Blocks',
    badgeClass: 'badge-code',
    content: [
      'React Native has a small set of core components that map directly to native platform widgets. The essentials: `<View>` for layout containers, `<Text>` for all text, `<Image>` for images, `<ScrollView>` for scrollable content, `<FlatList>` for long lists, and `<TextInput>` for user input. Every UI you build is a composition of these.',
      '**FlatList vs ScrollView** is one of the most important performance decisions. `ScrollView` renders all children at once — fine for short content but memory-destructive for long lists. `FlatList` is virtualised — it only renders items currently visible on screen and recycles components as you scroll. Always use `FlatList` for lists longer than 20 items.',
      '**Safe Area** is a mobile-specific concern with no web equivalent. The iPhone notch, Android status bar, and home indicator physically overlap your UI if ignored. `useSafeAreaInsets` from `react-native-safe-area-context` gives you inset values to pad your layout correctly on every device.'
    ],
    code: `import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Safe Area: never let content hide behind the notch ──
function Screen({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {children}
    </View>
  );
}

// ── FlatList: virtualised — always use for long lists ──
function LessonList({ lessons }) {
  return (
    <FlatList
      data={lessons}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.duration} min</Text>
        </View>
      )}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

// ── TextInput: controlled ──
function SearchBar({ value, onChange }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="Search lessons..."
      placeholderTextColor="#64748b"
      returnKeyType="search"
      clearButtonMode="while-editing"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  card:  { backgroundColor: '#1a1d27', borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#e2e8f0' },
  meta:  { fontSize: 12, color: '#64748b', marginTop: 4 },
  input: {
    backgroundColor: '#1a1d27', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, color: '#e2e8f0',
    borderWidth: 1, borderColor: '#2d3149',
  },
});`
  },
  {
    id: 'rn_2',
    title: 'Navigation with React Navigation',
    badge: 'Routing',
    badgeClass: 'badge-code',
    content: [
      '**React Navigation** is the standard navigation library for React Native. Unlike React Router on the web where the URL drives everything, mobile navigation is stack-based — screens are pushed onto a stack and popped off. Going back means popping the current screen, not changing a URL.',
      'There are three core navigators: **Stack** for screen-to-screen flows, **Tab** for bottom tab bars, and **Drawer** for side menus. In real apps these are almost always nested — a Tab navigator where each tab contains its own Stack navigator.',
      '**Passing data between screens** uses route params, not URL query strings. You pass params when navigating and read them from `route.params` in the destination. For data many screens need — like the logged-in user — use React Context, not params, to avoid drilling through navigation layers.'
    ],
    code: `import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Lessons Stack: list → detail ──
function LessonsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#0f1117' },
        headerTintColor:  '#e2e8f0',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="LessonList"   component={LessonListScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Root: Tab navigator wrapping stacks ──
function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle:          { backgroundColor: '#0f1117', borderTopColor: '#1e2231' },
        tabBarActiveTintColor: '#4f8ef7',
        headerShown:          false,
      }}
    >
      <Tab.Screen name="Lessons" component={LessonsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Navigate with params ──
function LessonListScreen({ navigation }) {
  return (
    <FlatList
      data={lessons}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('LessonDetail', {
            lessonId: item.id,
            title:    item.title,
          })}
        >
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ── Read params in destination ──
function LessonDetailScreen({ route, navigation }) {
  const { lessonId, title } = route.params;
  useEffect(() => {
    navigation.setOptions({ title });
  }, [title]);
  return <LessonContent id={lessonId} />;
}

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}`
  },
  {
    id: 'rn_3',
    title: 'Device APIs & Native Features',
    badge: 'Native Power',
    badgeClass: 'badge-practice',
    content: [
      'The biggest advantage of React Native over a web app is **direct access to device hardware** — camera, GPS, push notifications, biometrics, haptic feedback. These are things a browser cannot do. Expo SDK provides most of these as pre-built modules so you rarely need to write any native Swift, Kotlin or Objective-C.',
      'Expo SDK modules follow a consistent async pattern. You first request **permissions** — iOS and Android both require explicit user consent before accessing sensitive hardware. Always check permission status before attempting to use a feature and handle denial gracefully.',
      '**Haptic feedback** and **push notifications** are two features that disproportionately improve how native your app feels. Haptics give physical confirmation to interactions. Push notifications re-engage users when the app is closed — something impossible in a standard web app.'
    ],
    code: `import * as Location      from 'expo-location';
import * as Notifications  from 'expo-notifications';
import * as Haptics        from 'expo-haptics';

// ── Location: request permission first ──
async function getUserLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission denied', 'Location access is needed.');
    return null;
  }
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return location.coords; // { latitude, longitude }
}

// ── Push notifications: register device ──
async function registerForPush() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-expo-project-id',
  });
  // Store token on your backend per user
  await api.post('/notifications/register', { token: token.data });
  return token.data;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

// ── Haptics: make completions feel satisfying ──
function LessonCompleteButton({ onComplete }) {
  const handlePress = async () => {
    await onComplete();
    // Success: lesson complete  |  Warning: missed goal  |  Error: failed
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.btn}>
      <Text style={styles.btnText}>Mark Complete ✓</Text>
    </TouchableOpacity>
  );
}`
  },
  {
  id: 'rn_4',
  title: 'State Management in React Native',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'As apps grow, managing state locally becomes difficult.',
    'Use global state libraries like Zustand or Redux for shared data.',
    'For server state, React Query is preferred for caching and syncing.'
  ],
  code: `import { create } from 'zustand';

const useStore = create(set => ({
  user: null,
  setUser: (user) => set({ user })
}));`
},
{
  id: 'rn_5',
  title: 'Performance Optimization',
  badge: 'Performance',
  badgeClass: 'badge-concept',
  content: [
    'Mobile performance is critical — slow apps get uninstalled quickly.',
    'Avoid unnecessary re-renders using memoization.',
    'Optimize lists and images for better performance.'
  ],
  code: `const Item = React.memo(({ item }) => {
  return <Text>{item.title}</Text>;
});`
},
{
  id: 'rn_6',
  title: 'Platform Differences & Native Bridge',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'iOS and Android behave differently in UI and APIs.',
    'React Native allows platform-specific code using Platform API.',
    'For advanced features, native modules can be written in Swift/Kotlin.'
  ],
  code: `import { Platform } from 'react-native';

const styles = {
  padding: Platform.OS === 'ios' ? 20 : 10
};`
},
{
  id: 'rn_7',
  title: 'App Deployment & Builds',
  badge: 'Production',
  badgeClass: 'badge-practice',
  content: [
    'React Native apps must be built into APK (Android) or IPA (iOS).',
    'Expo simplifies builds using EAS.',
    'Publishing requires store guidelines and signing keys.'
  ],
  code: `# Expo build
npx expo prebuild
npx expo run:android

# EAS build
npx expo build`
},
{
  id: 'rn_8',
  title: 'Project Execution: Mobile App',
  badge: 'Project',
  badgeClass: 'badge-practice',
  content: [
    'Build a full mobile app with navigation, state management, and API integration.',
    'Ensure performance optimization and proper architecture.',
    'Deploy the app to a test environment.'
  ],
  code: `# ── Checklist ──
# 1. Navigation setup
# 2. Global state
# 3. API integration
# 4. Build & deploy`
}
];
