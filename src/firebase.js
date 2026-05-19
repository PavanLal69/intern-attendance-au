import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace this with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "AIzaSyBZOWLNMGTgeUMCPe_aWQwZybtvF90Njw4",
  authDomain: "intern-attendance-3757e.firebaseapp.com",
  projectId: "intern-attendance-3757e",
  storageBucket: "intern-attendance-3757e.firebasestorage.app",
  messagingSenderId: "490505269125",
  appId: "1:490505269125:web:5b978b4fd934128dc6deec",
  measurementId: "G-S58N3MBXN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);