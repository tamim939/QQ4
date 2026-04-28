import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';

interface UserData {
  uid: string;
  userNumericId: string;
  mobile: string;
  displayName: string;
  avatar: string;
  wallet: number;
  hasDeposited: boolean;
  hideDepositBonus: boolean;
  lastBonusClaimDate: string | null;
  referCode: string;
  boundWallet?: {
    method: 'Nagad' | 'BKASH';
    number: string;
  };
}

const AVATARS = [
  'https://img.freepik.com/free-photo/lifestyle-people-emotions-concept-close-up-cheerful-stylish-girl-with-blue-eyes-natural-makeup-wearing-grey-t-shirt-smiling-broadly-expressing-joy-happiness-optimism_176420-14285.jpg',
  'https://img.freepik.com/free-photo/portrait-handsome-man-with-dark-hair_176420-15582.jpg',
  'https://img.freepik.com/free-photo/side-view-profile-portrait-middle-aged-man_176420-15344.jpg',
  'https://img.freepik.com/free-photo/portrait-young-man-with-dark-hair_176420-15581.jpg',
  'https://img.freepik.com/free-photo/portrait-young-gentleman-holding-camera_23-2148213337.jpg',
  'https://img.freepik.com/free-photo/close-up-young-woman-with-surprised-expression_23-2148859451.jpg',
  'https://img.freepik.com/free-photo/portrait-smiling-attractive-man_23-2148859450.jpg',
  'https://img.freepik.com/free-photo/beautiful-woman-portrait_23-2148859455.jpg',
  'https://img.freepik.com/premium-photo/profile-avatar-white-male-with-yellow-hair-angry-surprised-expression_1020697-38010.jpg',
  'https://img.freepik.com/free-photo/young-man-portrait_23-2148859460.jpg'
];

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubData: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (unsubData) {
        unsubData();
        unsubData = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        // Listen to user data changes
        unsubData = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false); // Set loading false as soon as we have data or know it's missing
        }, (error) => {
          console.error("User data snapshot error:", error);
          setLoading(false);
        });

        // Ensure we handle the "not yet registered" case
        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            const mobile = user.phoneNumber || user.email?.split('@')[0] || '';
            const numericId = Math.floor(1000000 + Math.random() * 9000000).toString();
            const newUserData: UserData = {
              uid: user.uid,
              userNumericId: numericId,
              mobile: mobile,
              displayName: `User_${numericId.slice(-4)}`,
              avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
              wallet: 20,
              hasDeposited: false,
              hideDepositBonus: false,
              lastBonusClaimDate: null,
              referCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            };
            await setDoc(userRef, newUserData);
          }
        } catch (error) {
          console.error("Profile check error:", error);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubData) unsubData();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
