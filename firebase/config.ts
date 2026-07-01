import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

const baseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// measurementId is optional — only include it if provided
const firebaseConfig: FirebaseOptions = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  ? { ...baseConfig, measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
  : baseConfig;

// Prevent re-initializing during hot reload in development
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default app;
