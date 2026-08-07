import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Supports values copied from Firebase's JavaScript config object, such as
// `apiKey: "AIza...",`, as well as plain Vite environment values.
const cleanFirebaseValue = (value) => value?.trim().replace(/,$/, '').replace(/^["']|["']$/g, '').trim()

const firebaseConfig = {
  apiKey: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanFirebaseValue(import.meta.env.VITE_FIREBASE_APP_ID),
}

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

const app = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export { app, hasFirebaseConfig }
