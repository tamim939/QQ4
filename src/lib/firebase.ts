import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAOS4QuuRD4hh5fMqb-JF8h2kn0PJ57whI",
  authDomain: "qq4t-c46fc.firebaseapp.com",
  databaseURL: "https://qq4t-c46fc-default-rtdb.firebaseio.com",
  projectId: "qq4t-c46fc",
  storageBucket: "qq4t-c46fc.firebasestorage.app",
  messagingSenderId: "537022208674",
  appId: "1:537022208674:web:ce0ad57b36a95fa23755fb",
  measurementId: "G-6TVSQ024PQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
