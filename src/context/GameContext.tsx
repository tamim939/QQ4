import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';


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
  });

  const generatePeriodId = (duration: number, date: Date = new Date()) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const totalSecondsInDay = date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
    const periodIndex = Math.floor(totalSecondsInDay / duration) + 1;
    return `${year}${month}${day}${periodIndex.toString().padStart(5, '0')}`;
  };

  const calculateResult = (periodId: string) => {
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
      [30, 60, 180].forEach(d => {
        const periodId = generatePeriodId(d, now);
        const timeLeft = d - (secondsSinceEpoch % d);
        
        // When a period ends, we could potentially trigger result save here if we were "host"
        // But for simplicity, we derive results deterministically from periodId
        
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

  // Listen to history for each duration
  useEffect(() => {
    const unsubscribes = [30, 60, 180].map(d => {
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
      }, (error) => {
        console.error("Firestore history error:", error);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // "Host" logic to populate results (simple version)
  useEffect(() => {
    const hostInterval = setInterval(async () => {
      const now = new Date();
      [30, 60, 180].forEach(async (d) => {
        const prevDate = new Date(now.getTime() - d * 1000);
        const prevPeriodId = generatePeriodId(d, prevDate);
        
        // We only write if it's not already there
        // In a real app, this is done by a server
        const res = calculateResult(prevPeriodId);
        const docId = `${d}_${prevPeriodId}`;
        const docRef = doc(db, `game_periods/${d}/history`, prevPeriodId);
        
        // Only one user tends to win the race to set this
        try {
          await setDoc(docRef, {
            ...res,
            periodId: prevPeriodId,
            timestamp: prevDate.toISOString()
          }, { merge: true });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `game_periods/${d}/history/${prevPeriodId}`);
        }
      });
    }, 10000);

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
