import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Auth from './pages/Auth';
import Lottery from './pages/Lottery';
import Profile from './pages/Profile';
import Mines from './pages/Mines';
import Promotion from './pages/Promotion';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BottomNav from './components/Layout/BottomNav';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import SplashScreen from './components/Common/SplashScreen';

type ViewState = 'wallet' | 'payment' | 'history';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('lottery');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialWalletTab, setInitialWalletTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [initialView, setInitialView] = useState<ViewState>('wallet');
  const [showAdmin, setShowAdmin] = useState(false);

  const navigateToWallet = (tab: 'deposit' | 'withdraw' = 'deposit', view: ViewState = 'wallet') => {
    setInitialWalletTab(tab);
    setInitialView(view);
    setActiveTab('wallet');
  };

  // Initial splash effect
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || isInitializing) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'lottery' && <Lottery onBack={() => {}} />}
        {activeTab === 'mines' && <Mines onBack={() => setActiveTab('lottery')} />}
        {activeTab === 'promotion' && <Promotion />}
        {activeTab === 'wallet' && <WalletPage initialTab={initialWalletTab} initialView={initialView} />}
        {activeTab === 'account' && <Profile onNavigateToWallet={navigateToWallet} onShowGifts={() => {}} onShowAdmin={() => setShowAdmin(true)} />}
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
