import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMpR-NremqsuRknefCiXd6tiWsgNjjXRQ",
  authDomain: "skill-lab-977b7.firebaseapp.com",
  projectId: "skill-lab-977b7",
  storageBucket: "gs://skill-lab-977b7.firebasestorage.app",
  messagingSenderId: "364210468649",
  appId: "1:364210468649:android:ba01294cdb405fe7846938",
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;