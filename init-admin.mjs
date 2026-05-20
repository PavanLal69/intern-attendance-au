import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZOwLNMGTgeUMCPe_aW0wZybtvF90Njw4",
  authDomain: "intern-attendance-3757e.firebaseapp.com",
  projectId: "intern-attendance-3757e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'bharat@admin.com', 'aurora123');
    console.log('Login Success! UID:', cred.user.uid);
    const pSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!pSnap.exists() || pSnap.data().role !== 'admin') {
      await setDoc(doc(db, 'users', cred.user.uid), { role: 'admin', email: 'bharat@admin.com' }, { merge: true });
      console.log('Fixed Firestore role.');
    } else {
      console.log('Firestore role is correctly set to admin.');
    }
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      const cred = await createUserWithEmailAndPassword(auth, 'bharat@admin.com', 'aurora123');
      await setDoc(doc(db, 'users', cred.user.uid), { role: 'admin', email: 'bharat@admin.com' });
      console.log('Account created & role set!');
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}
main();
