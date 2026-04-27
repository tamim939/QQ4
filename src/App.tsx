import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import Profile from './pages/Profile';
import Mines from './pages/Mines';
import Promotion from './pages/Promotion';
import Activity from './pages/Activity';
import WalletPage from './pages/WalletPage';
import BottomNav from './components/Layout/BottomNav';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import SplashScreen from './components/Common/SplashScreen';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial splash effect
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1500); // Give it a bit of time for a premium feel
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { doc, getDocFromServer } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission-denied')) {
          console.warn("Firestore connection test: permission-denied (expected)");
        } else if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  if (loading || isInitializing) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  if (activeGame === 'wingo') {
    return <Lottery onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'mines') {
    return <Mines onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Home onSelectGame={(id) => setActiveGame(id)} />
            </motion.div>
          )}
          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Activity />
            </motion.div>
          )}
          {activeTab === 'promotion' && (
            <motion.div key="promotion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Promotion />
            </motion.div>
          )}
          {activeTab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WalletPage />
            </motion.div>
          )}
          {activeTab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainApp />
      </GameProvider>
    </AuthProvider>
  );
}
