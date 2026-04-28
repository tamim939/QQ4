import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, where, getDocs, writeBatch, increment, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

interface GameResult {
  periodId: string;
  number: number;
  color: string;
  size: string;
}

interface GameState {
  currentPeriodId: string;
  timeLeft: number;
  history: GameResult[];
}

interface GameContextType {
  durations: { [key: number]: GameState };
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [durations, setDurations] = useState<{ [key: number]: GameState }>({
    30: { currentPeriodId: '', timeLeft: 30, history: [] },
    60: { currentPeriodId: '', timeLeft: 60, history: [] },
    180: { currentPeriodId: '', timeLeft: 180, history: [] },
    300: { currentPeriodId: '', timeLeft: 300, history: [] },
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setCurrentUser(u));
  }, []);

  const generatePeriodId = (duration: number, date: Date = new Date()) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const totalSecondsInDay = date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
    const periodIndex = Math.floor(totalSecondsInDay / duration) + 1;
    return `${year}${month}${day}${periodIndex.toString().padStart(5, '0')}`;
  };

  const calculateResult = (periodId: string) => {
    // Deterministic result based on period ID for consistency
    let hash = 0;
    for (let i = 0; i < periodId.length; i++) {
        hash = ((hash << 5) - hash) + periodId.charCodeAt(i);
        hash |= 0;
    }
    const number = Math.abs(hash % 10);
    const color = (number === 0 || number === 5) ? 'Violet' : (number % 2 === 0 ? 'Red' : 'Green');
    const size = (number >= 5) ? 'Big' : 'Small';
    return { number, color, size };
  };

  const updateTick = useCallback(() => {
    const now = new Date();
    const secondsSinceEpoch = Math.floor(now.getTime() / 1000);

    setDurations(prev => {
      const next = { ...prev };
      [30, 60, 180, 300].forEach(d => {
        const periodId = generatePeriodId(d, now);
        const timeLeft = d - (secondsSinceEpoch % d);
        
        next[d] = {
          ...prev[d],
          currentPeriodId: periodId,
          timeLeft: timeLeft
        };
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [updateTick]);

  // Listen to history
  useEffect(() => {
    const activeDurations = [30, 60, 180, 300];
    const unsubscribes = activeDurations.map(d => {
      const q = query(
        collection(db, `game_periods/${d}/history`),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => doc.data() as GameResult);
        setDurations(prev => ({
          ...prev,
          [d]: { ...prev[d], history }
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Settlement Logic
  useEffect(() => {
    if (!currentUser) return;

    const settleInterval = setInterval(async () => {
      try {
        const q = query(
          collection(db, 'bets'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'pending'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        let userWalletUpdate = 0;

        for (const betDoc of snapshot.docs) {
          const bet = betDoc.data();
          const duration = bet.duration;
          const periodId = bet.periodId;

          // Check if we have history for this period
          const historyEntry = durations[duration]?.history.find(h => h.periodId === periodId);
          if (historyEntry) {
             let isWin = false;
             let multiplier = 2; // Default for color/size

             if (bet.type === 'number') {
                isWin = parseInt(bet.value) === historyEntry.number;
                multiplier = 9;
             } else if (bet.type === 'color') {
                isWin = bet.value === historyEntry.color;
                if (isWin) {
                   if (bet.value === 'Violet') multiplier = 4.5;
                   else if ((historyEntry.number === 0 || historyEntry.number === 5)) multiplier = 1.5;
                }
             } else if (bet.type === 'size') {
                isWin = bet.value === historyEntry.size;
             }

             const status = isWin ? 'win' : 'lose';
             const winAmount = isWin ? bet.amount * multiplier : 0;

             batch.update(betDoc.ref, { 
               status, 
               winAmount,
               resultNumber: historyEntry.number,
               resultColor: historyEntry.color,
               resultSize: historyEntry.size,
               settledAt: serverTimestamp()
             });

             if (isWin) {
                userWalletUpdate += winAmount;
             }
          }
        }

        if (userWalletUpdate > 0) {
           batch.update(doc(db, 'users', currentUser.uid), {
              wallet: increment(userWalletUpdate)
           });
        }

        await batch.commit();
      } catch (e) {
        console.error("Settlement error:", e);
      }
    }, 3000); // Check every 3s

    return () => clearInterval(settleInterval);
  }, [currentUser, durations]);

  // Host logic: Ensures results are written to Firestore
  useEffect(() => {
    const hostInterval = setInterval(async () => {
      const now = new Date();
      [30, 60, 180, 300].forEach(async (d) => {
        // Generate current and previous results to be safe
        const currPeriodId = generatePeriodId(d, now);
        const prevDate = new Date(now.getTime() - d * 1000);
        const prevPeriodId = generatePeriodId(d, prevDate);
        
        [prevPeriodId, currPeriodId].forEach(async (pId) => {
          const res = calculateResult(pId);
          const docRef = doc(db, `game_periods/${d}/history`, pId);
          try {
            await setDoc(docRef, {
              ...res,
              periodId: pId,
              timestamp: now.toISOString() // Approximate
            }, { merge: true });
          } catch (e) {}
        });
      });
    }, 5000); // Check every 5s

    return () => clearInterval(hostInterval);
  }, []);

  return (
    <GameContext.Provider value={{ durations }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
