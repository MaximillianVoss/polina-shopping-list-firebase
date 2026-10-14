import type AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';

// Firebase 12.19 exports this function in its React Native runtime, but the
// umbrella firebase/auth declaration selects the platform-neutral type file.
// Describe that one missing public RN export without disabling type checking.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>,
  ): Persistence;
}
