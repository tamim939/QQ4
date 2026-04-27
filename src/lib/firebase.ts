import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  "projectId": "messenger-clone-8c84f",
  "appId": "1:727320176215:web:452ee54d361c211d412512",
  "apiKey": "AIzaSyAqwlo5VSa1HHrkgU9H3kwahDhwHKR8ZqM",
  "authDomain": "messenger-clone-8c84f.firebaseapp.com",
  "databaseURL": "https://messenger-clone-8c84f-default-rtdb.firebaseio.com",
  "storageBucket": "messenger-clone-8c84f.firebasestorage.app",
  "messagingSenderId": "727320176215",
  "measurementId": "G-9KS2DTBZ13"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
