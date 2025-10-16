import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyD2vYzivm2Gbgl_ee0t81d6r5GPHeI4Gqs",
  authDomain: "quizontal-de977.firebaseapp.com",
  projectId: "quizontal-de977",
  storageBucket: "quizontal-de977.firebasestorage.app",
  messagingSenderId: "448533191404",
  appId: "1:448533191404:web:f13787dc074def891fe3c9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
