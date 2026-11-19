import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type UserCredential
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyPlaceholderForBuild",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "landstack-e01f4.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "landstack-e01f4",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "landstack-e01f4.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "266058167659",
  appId: env.VITE_FIREBASE_APP_ID || "1:266058167659:web:55935532bc49483edb882e",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-SG9ZNG0GFH"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  createdAt: string;
};

// Authentication Helpers
export async function firebaseSignUp(email: string, password: string, name: string, role: string, phone: string = ''): Promise<UserProfile> {
  const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    name: name || email.split('@')[0],
    role: role || 'citizen',
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

export async function firebaseLogin(email: string, password: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  // Default fallback profile if not found in Firestore
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    name: user.displayName || email.split('@')[0],
    role: 'citizen',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'users', user.uid), fallbackProfile);
  return fallbackProfile;
}

// Phone Auth recaptcha setup & verification
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore clear error
    }
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Reset reCAPTCHA
    }
  });
  return recaptchaVerifier;
}

export async function sendPhoneVerification(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export async function verifyPhoneCode(confirmationResult: ConfirmationResult, code: string): Promise<UserProfile> {
  const credential = await confirmationResult.confirm(code);
  const user = credential.user;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || `${user.phoneNumber}@demo.gov`,
    name: user.phoneNumber || 'Phone User',
    role: 'citizen',
    phone: user.phoneNumber || '',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

// Firestore Database Sync & Operations
export async function saveParcelToFirestore(parcel: Record<string, unknown>): Promise<void> {
  if (!parcel.id) return;
  await setDoc(doc(db, 'parcels', String(parcel.id)), parcel, { merge: true });
}

export async function fetchParcelsFromFirestore(): Promise<Array<Record<string, unknown>>> {
  try {
    const querySnapshot = await getDocs(collection(db, 'parcels'));
    const list: Array<Record<string, unknown>> = [];
    querySnapshot.forEach((doc: any) => {
      list.push(doc.data());
    });
    return list;
  } catch (error) {
    console.warn('Firestore fetchParcels error:', error);
    return [];
  }
}

export async function saveServiceRequestToFirestore(request: Record<string, unknown>): Promise<void> {
  if (!request.id) return;
  await setDoc(doc(db, 'service_requests', String(request.id)), request, { merge: true });
}

export async function fetchServiceRequestsFromFirestore(): Promise<Array<Record<string, unknown>>> {
  try {
    const querySnapshot = await getDocs(collection(db, 'service_requests'));
    const list: Array<Record<string, unknown>> = [];
    querySnapshot.forEach((doc: any) => {
      list.push(doc.data());
    });
    return list;
  } catch (error) {
    console.warn('Firestore fetchServiceRequests error:', error);
    return [];
  }
}
