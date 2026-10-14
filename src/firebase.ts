import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Expo substitutes EXPO_PUBLIC_* at bundle time. These client values are not server secrets.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function services() {
  if (Object.values(config).some((value) => !value || value.includes('YOUR_'))) {
    throw new Error('Configure your own Firebase web app in .env, then restart Expo.');
  }
  if (!config.databaseURL?.startsWith('https://')) {
    throw new Error('Use the HTTPS Realtime Database URL from your Firebase console.');
  }
  const existing = getApps()[0];
  const app = existing ?? initializeApp(config);
  const auth = existing ? getAuth(app) : initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  return { auth, database: getDatabase(app) };
}

export async function currentUser() {
  const { auth, database } = services();
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return { uid: user.uid, database };
}
