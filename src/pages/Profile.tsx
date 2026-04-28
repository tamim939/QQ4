import { 
  LogOut, 
  Wallet, 
  ChevronRight, 
  Settings, 
  Copy, 
  RefreshCw, 
  ArrowDownToLine, 
  ArrowUpToLine, 
  Gem, 
  Vault, 
  ClipboardList, 
  Repeat, 
  Download, 
  Bell, 
  Gift, 
  BarChart, 
  Globe,
  Headphones,
  Star,
  X,
  ShieldCheck
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';


import toast from 'react-hot-toast';

export default function Profile({ onNavigateToWallet, onShowGifts, onShowAdmin }: { 
  onNavigateToWallet?: (tab: 'deposit' | 'withdraw', view?: 'wallet' | 'payment' | 'history') => void, 
  onShowGifts?: () => void,
  onShowAdmin?: () => void 
}) {
  const { userData, user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const isAdmin = userData?.mobile === '19093386355' || user?.email === 'qq44@email.com';

  const handleLogout = () => {
    auth.signOut();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const walletBalance = typeof userData?.wallet === 'number' ? userData.wallet : 0;
  const username = userData?.displayName || "...";
  const userNumericId = userData?.userNumericId || "........";

  const avatar = userData?.avatar || "https://img.freepik.com/premium-photo/profile-avatar-white-male-with-yellow-hair-angry-surprised-expression_1020697-38010.jpg";

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-24 text-left font-sans">
      {/* Top Utility Bar */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-50">
        <h1 className="text-2xl font-black italic text-[#f1c40f] tracking-tighter uppercase">MK WIN 25</h1>
        <div className="flex items-center space-x-4 text-gray-400">
           <Download size={22} className="stroke-[2.5]" />
           <Headphones size={22} className="stroke-[2.5]" />
        </div>
      </div>

      {/* Profile Header section */}
      <div className="bg-[#f1c40f] pt-10 pb-32 px-6 relative">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-10 right-6 p-2 active:scale-90 transition-all"
        >
           <Settings size={28} className="text-white drop-shadow-sm" />
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full p-0.5 shadow-md overflow-hidden">
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white drop-shadow-sm leading-none">{username}</h2>
              <div className="bg-white px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Star size={10} className="text-[#f1c40f] fill-[#f1c40f]" />
                <span className="text-[10px] font-black text-[#f1c40f] uppercase italic">VIP1</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-white uppercase mt-1">
              <span className="opacity-80">UID | {userNumericId}</span>
              <button 
                onClick={() => copyToClipboard(userNumericId)} 
                className="bg-white/20 p-1 rounded transition-all active:bg-white/40"
              >
                <Copy size={12} />
              </button>
              {copyFeedback && (
                <motion.span 
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/20 text-[8px] px-1 rounded"
                >
                  COPIED
                </motion.span>
              )}
            </div>
            <p className="text-[10px] font-bold text-white/70">Last login: Just now</p>
          </div>
        </div>
      </div>

      {/* Floating Content Card */}
      <div className="px-4 -mt-20 space-y-4 relative z-10">
        
        {/* Total Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/[0.03]">
          <div className="flex flex-col space-y-1">
            <p className="text-[12px] font-bold text-gray-400">Total balance</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-3xl font-black text-gray-800 tracking-tight">৳ {walletBalance.toFixed(2)}</h3>
              <button className="text-gray-300 hover:text-[#f1c40f] active:rotate-180 transition-all duration-300">
                <RefreshCw size={24} className="stroke-[3]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-8">
            <BalanceAction icon={Wallet} label="Wallet" color="bg-[#ff7675]" onClick={() => onNavigateToWallet?.('deposit')} />
            <BalanceAction icon={ArrowDownToLine} label="Deposit" color="bg-[#ffa502]" isCircle onClick={() => onNavigateToWallet?.('deposit')} />
            <BalanceAction icon={ArrowUpToLine} label="Withdraw" color="bg-[#1e90ff]" isCircle onClick={() => onNavigateToWallet?.('withdraw')} />
            <BalanceAction icon={Gem} label="VIP" color="bg-[#2ed573]" />
          </div>
        </div>

        {/* Safe Box Account */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="bg-[#fffde7] p-2 rounded-xl">
               <div className="bg-[#f1c40f]/20 p-1.5 rounded-lg text-[#f1c40f]">
                  <Vault size={24} className="stroke-[2.5]" />
               </div>
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm font-black text-gray-800">Safe</p>
              <p className="text-[10px] font-bold text-gray-400">Daily interest 0.1%, secure your funds</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-[#f1c40f] text-white px-3 py-1 rounded-full text-[12px] font-black italic shadow-sm">
               ৳0.00
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard icon={ClipboardList} label="Game History" sub="My game history" color="text-[#3498db]" />
          <FeatureCard icon={Repeat} label="Transaction" sub="My transaction" color="text-[#2ecc71]" onClick={() => onNavigateToWallet?.('deposit', 'history')} />
          <FeatureCard icon={ArrowDownToLine} label="DepositHistory" sub="My deposit history" color="text-[#ff7675]" onClick={() => onNavigateToWallet?.('deposit', 'history')} />
          <FeatureCard icon={ArrowUpToLine} label="WithdrawHistory" sub="My withdraw history" color="text-[#ffa502]" onClick={() => onNavigateToWallet?.('withdraw', 'history')} />
        </div>

        {/* Standard Menu List */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <MenuListItem icon={Bell} label="Notification" count={0} color="text-red-500" />
          <MenuListItem icon={Gift} label="Gifts" onClick={onShowGifts} />
          {isAdmin && (
            <MenuListItem 
              icon={ShieldCheck} 
              label="Admin Dashboard" 
              color="text-emerald-500" 
              onClick={onShowAdmin}
              extra="Admin"
            />
          )}
          <MenuListItem icon={BarChart} label="Game statistics" />
          <MenuListItem icon={Globe} label="Language" extra="English" />
        </div>

        {/* Logout Button Section at the bottom */}
        <div className="py-8 flex justify-center">
           <button 
            onClick={handleLogout}
            className="px-16 py-3.5 border-2 border-[#f1c40f] text-[#f1c40f] rounded-full flex items-center space-x-2 font-black italic text-lg active:scale-95 transition-all"
           >
             <LogOut size={20} strokeWidth={3} />
             <span>Log out</span>
           </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <AccountSettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            username={username}
          />
        )}
      </AnimatePresence>

      {/* Fixed Chat/Support Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <button className="w-14 h-14 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all">
          <Headphones size={28} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

function BalanceAction({ icon: Icon, label, color, isCircle, onClick }: { icon: any, label: string, color: string, isCircle?: boolean, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
      <div className="w-12 h-12 flex items-center justify-center">
         <div className={`${color} p-2 ${isCircle ? 'rounded-full' : 'rounded-xl'} shadow-lg shadow-black/5`}>
           <Icon size={22} className="text-white stroke-[2.5]" />
         </div>
      </div>
      <span className="text-[11px] font-bold text-gray-500">{label}</span>
    </div>
  );
}

function FeatureCard({ icon: Icon, label, sub, color, onClick }: { icon: any, label: string, sub: string, color: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center space-x-3 active:scale-95 transition-all cursor-pointer"
    >
      <div className={`${color} flex-shrink-0`}>
         <Icon size={28} strokeWidth={2.5} />
      </div>
      <div className="text-left leading-tight">
        <p className="text-[13px] font-black text-gray-800">{label}</p>
        <p className="text-[10px] font-bold text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function MenuListItem({ icon: Icon, label, count, extra, color, onClick }: { icon: any, label: string, count?: number, extra?: string, color?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50 cursor-pointer"
    >
      <div className="flex items-center space-x-4 text-left">
        <Icon className={color || "text-[#f1c40f]"} size={22} strokeWidth={2.5} />
        <span className="text-[13px] font-bold text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {count !== undefined && <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{count}</span>}
        {extra && <span className="text-[10px] font-bold text-gray-400">{extra}</span>}
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </button>
  );
}

function AccountSettingsModal({ onClose, username }: { onClose: () => void, username: string }) {
  const { userData } = useAuth();
  const [displayName, setDisplayName] = useState(username);
  const [currentAvatar, setCurrentAvatar] = useState(userData?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (userData?.uid) {
        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, {
          displayName: displayName.trim(),
          avatar: currentAvatar
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userData.uid}`));
        
        toast.success('প্রোফাইল আপডেট হয়েছে!');
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden relative z-10 shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-center mb-6 relative">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">সেটিংস</h3>
            <button onClick={onClose} className="absolute right-0 text-gray-300 hover:text-gray-500">
               <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Avatar Selection Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full p-1 border-2 border-[#f1c40f] overflow-hidden">
                <img src={currentAvatar} className="w-full h-full object-cover rounded-full" alt="preview" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Choose Avatar</p>
              <div className="flex space-x-2 overflow-x-auto pb-2 w-full no-scrollbar">
                {AVATARS.map((av, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentAvatar(av)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${currentAvatar === av ? 'border-[#f1c40f] scale-110' : 'border-transparent opacity-50'}`}
                  >
                    <img src={av} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">আপনার নাম</label>
              <input 
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#f1c40f] transition-all font-bold text-gray-700"
                placeholder="নতুন নাম দিন"
              />
            </div>

            {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

            <div className="flex space-x-3 pt-6">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase tracking-tighter active:scale-95 transition-all"
              >
                বাতিল
              </button>
              <button 
                disabled={loading}
                onClick={handleSave}
                className="flex-1 py-4 bg-[#f1c40f] text-white font-black rounded-2xl uppercase tracking-tighter shadow-lg shadow-[#f1c40f]/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'সেভ করুন'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

