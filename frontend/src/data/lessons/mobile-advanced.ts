import type { Lesson } from '../../types/curriculum';

export const mobileAdvancedLessons: Lesson[] = [
  {
    id: 'ma_0',
    title: 'State Management at Scale',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'As a React Native app grows, local `useState` and prop drilling break down. The mobile ecosystem has two dominant approaches: **Zustand** for lightweight global state (user session, UI state) and **TanStack Query** for server state (fetching, caching, syncing from your API). Using both together covers almost every need without Redux complexity.',
      'The key insight is treating **server state and client state as fundamentally different things**. Server state lives on your backend, is async, can be stale, and needs refetching. Client state is synchronous and owned by the app. React Query owns the server state, Zustand owns the rest.',
      '**Offline-first architecture** is a mobile expectation, not a nice-to-have. Users go underground, lose signal, switch networks. React Query handles this with stale-while-revalidate — showing cached data immediately while refetching in background. For write operations, a mutation queue with retry ensures actions taken offline are synced when connection returns.'
    ],
    code: `// ── Zustand: persisted global state ──
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set) => ({
      user:        null,
      theme:       'dark',
      setUser:     (user)  => set({ user }),
      toggleTheme: ()      => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'app-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ── TanStack Query: server state with offline cache ──
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useLessons(topicId) {
  return useQuery({
    queryKey:  ['lessons', topicId],
    queryFn:   () => api.getLessons(topicId),
    staleTime: 5 * 60 * 1000,        // fresh for 5 min
    gcTime:    24 * 60 * 60 * 1000,  // cache for 24 hrs (offline access)
  });
}

// ── Optimistic update: feel instant ──
function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId) => api.completeLesson(lessonId),
    onMutate: async (lessonId) => {
      await qc.cancelQueries({ queryKey: ['progress'] });
      const prev = qc.getQueryData(['progress']);
      qc.setQueryData(['progress'], (old) => ({
        ...old,
        completed: [...(old?.completed || []), lessonId],
      }));
      return { prev }; // snapshot for rollback
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['progress'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });
}`
  },
  {
    id: 'ma_1',
    title: 'Performance & Animations',
    badge: 'Native Feel',
    badgeClass: 'badge-code',
    content: [
      '**React Native runs JS on a separate thread from the UI.** Heavy JS work blocks the JS thread and makes the UI feel janky even if the native thread is idle. The goal is keeping the JS thread free for handling gestures and interactions.',
      '**Reanimated 2** solves this by running animations entirely on the UI thread using worklets — small JS functions that execute natively without bridge communication. This gives smooth 60fps animations even when the JS thread is under load.',
      '**Hermes** is Meta\'s JS engine optimised for React Native — it pre-compiles JS to bytecode at build time, cutting startup time by 40-60% on Android. Enabled by default in new projects and one of the highest-ROI performance improvements available.'
    ],
    code: `import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, interpolate,
  runOnJS, useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

// ── Entrance animation: staggered cards ──
function LessonCard({ lesson, index }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value    = withTiming(1,  { duration: 300 });
    translateY.value = withSpring(0,  { damping: 20, stiffness: 200 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Text>{lesson.title}</Text>
    </Animated.View>
  );
}

// ── Swipe to dismiss ──
function SwipeableCard({ onDismiss, children }) {
  const translateX = useSharedValue(0);
  const THRESHOLD  = 120;

  const gestureHandler = useAnimatedGestureHandler({
    onActive:  (e) => { translateX.value = e.translationX; },
    onEnd:     (e) => {
      if (Math.abs(e.translationX) > THRESHOLD) {
        translateX.value = withTiming(e.translationX > 0 ? 400 : -400);
        runOnJS(onDismiss)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-200, 0, 200], [-15, 0, 15]);
    return { transform: [{ translateX: translateX.value }, { rotate: \`\${rotate}deg\` }] };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, cardStyle]}>{children}</Animated.View>
    </PanGestureHandler>
  );
}`
  },
  {
    id: 'ma_2',
    title: 'App Store Deployment with EAS',
    badge: 'Ship It',
    badgeClass: 'badge-practice',
    content: [
      '**EAS (Expo Application Services)** is the modern way to build and submit React Native apps. `eas build` compiles your app in the cloud — no Xcode or Android Studio required on your machine. `eas submit` uploads the binary directly to App Store Connect or Google Play Console.',
      'Both stores require setup before your first submission. Apple requires a **paid developer account** ($99/year), provisioning profiles, and signing certificates. Google Play requires a **one-time $25 fee**. Budget 2-4 hours for first-time setup per platform.',
      '**Over-the-air (OTA) updates** via Expo Updates let you push JS changes to users instantly — no App Store review. This works because only the JS bundle changes, not the native shell. Use OTA for bug fixes and content updates. Any change to native code or permissions requires a full store submission.'
    ],
    code: `# ── EAS: cloud builds without Xcode or Android Studio ──
npm install -g eas-cli
eas login
eas build:configure   # creates eas.json

# eas.json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal" },
    "production":  { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "ios":     { "appleId": "you@email.com", "ascAppId": "1234567890" },
      "android": { "serviceAccountKeyPath": "./gplay-key.json", "track": "production" }
    }
  }
}

# Build both platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --profile production

# ── OTA: push fixes without review ──
eas update --branch production --message "Fix lesson completion bug"

# ── app.json: required metadata ──
{
  "expo": {
    "name": "Learning Hub",
    "slug": "learning-hub",
    "version": "1.0.0",
    "icon":    "./assets/icon.png",
    "splash":  { "image": "./assets/splash.png", "resizeMode": "contain" },
    "ios": {
      "bundleIdentifier": "com.yourname.learninghub",
      "infoPlist": { "NSCameraUsageDescription": "Used for profile photo" }
    },
    "android": {
      "package": "com.yourname.learninghub",
      "permissions": ["CAMERA"]
    },
    "updates": {
      "enabled": true,
      "url": "https://u.expo.dev/your-project-id"
    }
  }
}`
  },
  {
    id: 'ma_3',
    title: 'Testing React Native Apps',
    badge: 'Quality',
    badgeClass: 'badge-practice',
    content: [
      '**React Native Testing Library (RNTL)** is the standard for component testing — it renders components in a simulated environment and lets you query and interact with them the same way a user would. Query by what the user sees (text, role, label) not by implementation details like component names or internal state.',
      'End-to-end testing uses **Maestro** — a newer, YAML-based tool that drives a real device or simulator with simple tap/swipe/type instructions. E2E tests are slower and more brittle than unit tests but they catch the class of bugs that only appear when everything runs together on a real device.',
      '**Always test on real devices before shipping.** Simulators lie. Font rendering, touch sensitivity, memory pressure, and hardware-specific bugs only appear on physical devices. EAS Build\'s internal distribution makes it easy to send preview builds to testers before every release.'
    ],
    code: `// ── React Native Testing Library ──
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

describe('LessonCard', () => {
  const lesson = { id: 'js_0', title: 'Variables & Scope', duration: 8 };

  it('renders title and duration', () => {
    render(<LessonCard lesson={lesson} onPress={jest.fn()} />);
    expect(screen.getByText('Variables & Scope')).toBeTruthy();
    expect(screen.getByText('8 min')).toBeTruthy();
  });

  it('calls onPress with the lesson id when tapped', () => {
    const onPress = jest.fn();
    render(<LessonCard lesson={lesson} onPress={onPress} />);
    fireEvent.press(screen.getByText('Variables & Scope'));
    expect(onPress).toHaveBeenCalledWith('js_0');
  });

  it('shows a completed badge when done', () => {
    render(<LessonCard lesson={lesson} onPress={jest.fn()} completed={true} />);
    expect(screen.getByTestId('completed-badge')).toBeTruthy();
  });
});

# ── Maestro E2E: simple YAML flow ──
# .maestro/complete_lesson.yaml
appId: com.yourname.learninghub
---
- launchApp
- tapOn: "React Native Developer"
- tapOn: "Yes"
- tapOn: "Yes"
- tapOn: "Yes"
- tapOn: "Accept this path"
- assertVisible: "Your Learning Path"
- tapOn: "React Native vs The Web"
- scrollDown
- tapOn: "Mark Complete"
- assertVisible: "Lesson completed!"`
  },
  {
  id: 'ma_4',
  title: 'Crash Reporting & Production Monitoring',
  badge: 'Operations',
  badgeClass: 'badge-concept',
  content: [
    'In mobile apps, you don\'t have server logs — users experience crashes silently and often just uninstall. **Sentry** and **Firebase Crashlytics** are mobile crash reporting services that capture unhandled errors with full stack traces, device info (OS version, device model, memory), and recent user actions leading to the crash. Without crash reporting, you\'re flying blind in production.',
    'Beyond raw crashes, capture **breadcrumbs** — a chronological trail of events before the crash. "User tapped Lesson Card → API call started → response received → crash in parseLesson()". Breadcrumbs transform debugging from "this crashed somewhere" to "this crashed because the API returned an unexpected null for lesson.duration". Sentry captures navigation, network requests, and custom events as breadcrumbs automatically.',
    '**Performance monitoring** in Sentry tracks how long your screens take to load ("Time to Interactive" per screen), how long specific operations take, and the percentage of sessions with performance issues. This is different from crash reporting — slow apps have lower engagement and retention even without crashing. Route both to your team\'s Slack or PagerDuty for immediate notification.'
  ],
  code: `// ── Sentry setup for Expo ──
npm install @sentry/react-native && npx @sentry/wizard@latest -i reactNative

// ── app/_layout.tsx ──
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV,  // 'production' | 'staging'
  tracesSampleRate: 0.2,   // Sample 20% of transactions for performance
  debug: __DEV__,          // Verbose in dev only
  integrations: [Sentry.reactNativeTracingIntegration()],
});

export default Sentry.wrap(RootLayout);  // Wraps all errors

// ── Attach user context after login ──
async function onLoginSuccess(user: User) {
  Sentry.setUser({ id: user.id, email: user.email });
  Sentry.setTag('plan', user.plan);
}

// ── Add custom breadcrumb (manual action) ──
Sentry.addBreadcrumb({
  message: 'User completed lesson',
  data: { lessonId: lesson.id, moduleId: lesson.moduleId },
  level: 'info',
});

// ── Capture non-fatal errors (API failures, etc.) ──
try {
  const result = await api.submitLesson(lessonId);
} catch (err) {
  Sentry.captureException(err, { extra: { lessonId, userId } });
  showToast('Unable to save progress. Please try again.');
}`
},
{
  id: 'ma_5',
  title: 'Analytics & User Behavior Tracking',
  badge: 'Product',
  badgeClass: 'badge-concept',
  content: [
    '**Product analytics** (Firebase Analytics, Amplitude, Mixpanel) answers different questions than crash reporting. Instead of "what broke?", it answers "do users actually use this feature?", "where in the onboarding flow do users drop off?", and "what actions correlate with users who retain for 30+ days?". These insights drive your roadmap decisions.',
    'Track **3 event categories**: Navigation events (which screens users visit, in what order — automatically captured by Firebase), **Conversion events** (critical actions: lesson_completed, module_finished, account_upgraded), and **Engagement events** (session_started, lesson_paused, search_performed). Start with the 5 most business-critical events; don\'t track everything.',
    '**Privacy compliance**: In the EU, you need explicit consent before setting any analytics cookies or identifiers (GDPR). In iOS 14+, you need the App Tracking Transparency dialog (`requestTrackingAuthorization()`) before accessing the IDFA for cross-app tracking. Firebase Analytics automatically respects `isAnalyticsCollectionEnabled` — set it based on user consent stored in AsyncStorage.'
  ],
  code: `// ── Firebase Analytics for Expo ──
import analytics from '@react-native-firebase/analytics';

// ── Track lesson completion (conversion event) ──
async function onLessonCompleted(lesson: Lesson) {
  await analytics().logEvent('lesson_completed', {
    lesson_id:    lesson.id,
    lesson_title: lesson.title,
    module_id:    lesson.moduleId,
    badge_type:   lesson.badge,
    duration_sec: lesson.estimatedSeconds,
  });
}

// ── Track screen views (auto or manual) ──
useEffect(() => {
  analytics().logScreenView({
    screen_name: 'LessonViewer',
    screen_class: 'LessonViewerScreen',
  });
}, []);

// ── Set user properties for segmentation ──
async function setUserProperties(user: User) {
  await analytics().setUserId(user.id);
  await analytics().setUserProperties({
    plan:         user.plan,      // 'free' | 'pro'
    cohort_month: user.createdMonth,
    topic_focus:  user.primaryTopic,
  });
}

// ── GDPR: only track if user consented ──
async function applyAnalyticsConsent(hasConsented: boolean) {
  await analytics().setAnalyticsCollectionEnabled(hasConsented);
}`
},
{
  id: 'ma_6',
  title: 'Deep Linking & Universal Links',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '**Deep linking** opens a specific screen directly from an external URL. When a push notification says "You have a new lesson!", tapping it should open `LessonViewer` for that specific lesson, not the app\'s home screen. Without deep linking, users navigate manually — friction that sharply reduces notification engagement rates.',
    '**Universal Links (iOS) and App Links (Android)** are the production-grade form of deep linking. Instead of a custom scheme (`myapp://lesson/123` — any app can claim this), Universal Links use your actual domain (`https://learninghub.com/lesson/123`). iOS and Android verify ownership via a file hosted on your server (`apple-app-site-association` / `assetlinks.json`). If the app is installed, the OS opens it; if not, Safari/Chrome opens the web version.',
    '**Expo Router** integrates deep linking natively via its file-based routing. Your `app/(lessons)/[lessonId].tsx` file automatically handles `https://learninghub.com/lessons/js_0`. Set the `scheme` in `app.json`, host the verification files, and Expo Router handles the rest. Push notifications from Expo Notifications can include the deep link URL in the `data` payload — handled automatically by the router.'
  ],
  code: `// ── app.json: configure deep link scheme and domain ──
{
  "expo": {
    "scheme": "learninghub",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "https", "host": "learninghub.com" }],
        "category": ["DEFAULT", "BROWSABLE"]
      }
    ]
  }
}

// ── Host this file at: https://learninghub.com/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [{ "appID": "TEAMID.com.yourname.learninghub",
      "paths": ["/lesson/*", "/module/*", "/profile"] }]
  }
}

// ── Expo Router: automatic deep link handling ──
// app/lesson/[id].tsx
import { useLocalSearchParams } from 'expo-router';
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Fires when opened via learninghub://lesson/js_0 or https://learninghub.com/lesson/js_0
  return <LessonViewer lessonId={id} />;
}

// ── Include deep link in push notification ──
await sendPushNotification({
  to: user.expoPushToken,
  title: 'New lesson available!',
  body: 'React Hooks Deep Dive is live',
  data: { url: '/lesson/ra_0' },  // Expo Router handles navigation
});`
}
];

