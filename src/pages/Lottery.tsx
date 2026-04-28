import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, Volume2, Gamepad2, Info, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';

import BetModal from '../components/Games/BetModal';

interface LotteryProps {
  onBack: () => void;
}

export default function Lottery({ onBack }: LotteryProps) {
  const { userData } = useAuth();
  const { durations } = useGame();
  const [activeDuration, setActiveDuration] = useState(30);
  const [activeTab, setActiveTab] = useState<'game' | 'my'>('game');
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selection, setSelection] = useState({ type: '', value: '', color: '' });
  const [notif, setNotif] = useState<{ msg: string; type: 'win' | 'lose' } | null>(null);

  const gameState = durations[activeDuration];
  const isLocked = gameState.timeLeft <= 5;

  const handleBetClick = (type: string, value: string, colorClass: string) => {
    if (isLocked) return;
    setSelection({ type, value, color: colorClass });
    setBetModalOpen(true);
  };

  const handleConfirmBet = async (bet: { type: string; value: string; amount: number; multiplier: number }) => {
    if (!userData) return;
    const totalAmount = bet.amount * bet.multiplier;

    if (totalAmount > userData.wallet) {
      alert("Insufficient Balance!");
      return;
    }

    try {
      const path = 'bets';
      await addDoc(collection(db, path), {
        userId: userData.uid,
        periodId: gameState.currentPeriodId,
        duration: activeDuration,
        type: bet.type,
        value: bet.value,
        amount: totalAmount,
        status: 'pending',
        timestamp: serverTimestamp(),
      });

      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        wallet: increment(-totalAmount),
        totalWager: increment(totalAmount)
      });

      setBetModalOpen(false);
    } catch (e) {
      console.error("Betting error:", e);
      alert("Bet placement failed. Please check your connection.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return {
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const time = formatTime(gameState.timeLeft);

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f2f6] pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between text-gray-800 sticky top-0 z-40 border-b">
        <button onClick={onBack} className="text-gray-600"><ChevronLeft size={28} /></button>
        <div className="flex flex-col items-center">
           <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter">QQ4</h1>
           <span className="text-[10px] font-bold text-gray-400">WIN GO {activeDuration >= 60 ? `${activeDuration / 60}MIN` : `${activeDuration}S`}</span>
        </div>
        <button className="text-gray-600"><Headphones size={24} /></button>
      </header>

      <div className="p-4 space-y-4">
        {/* Wallet Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col space-y-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-theme-yellow/10 p-3 rounded-2xl text-theme-yellow">
                 <RefreshCw size={24} />
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Balance</p>
                 <p className="text-3xl font-black text-gray-800">৳{userData?.wallet.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
             <button className="flex-1 bg-theme-yellow/10 text-theme-yellow py-3 rounded-2xl text-sm font-black border border-theme-yellow/20">Withdraw</button>
             <button className="flex-1 bg-theme-yellow text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-theme-yellow/20">Deposit</button>
          </div>
        </div>

        {/* Tab Switcher for Durations */}
        <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
           {[30, 60, 180].map((d) => (
             <button
              key={d}
              onClick={() => setActiveDuration(d)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeDuration === d ? 'bg-theme-red text-white shadow-lg' : 'text-gray-400'
              }`}
             >
                Win Go {d >= 60 ? `${d / 60}Min` : `${d}s`}
             </button>
           ))}
        </div>

        {/* Game Info Card */}
        <div className="bg-gradient-to-br from-theme-red to-orange-600 rounded-3xl p-6 text-white flex relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
           <div className="flex-1 space-y-5">
              <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center space-x-2">
                 <Info size={14} />
                 <span className="text-[10px] font-black uppercase">Rules</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] opacity-70 font-bold uppercase">Game History</p>
                <div className="flex items-center space-x-2">
                  {gameState.history.slice(0, 5).map((res, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-black ${
                      res.color === 'Violet' ? 'bg-purple-500' : res.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}>
                      {res.number}
                    </div>
                  ))}
                </div>
              </div>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center border-l border-white/10 pl-4">
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-3">Next Period</p>
              <div className="flex items-center space-x-1">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white w-9 h-11 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg">{time.m[0]}</div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white w-9 h-11 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg">{time.m[1]}</div>
                <span className="text-xl font-black pb-1">:</span>
                <div className="bg-white text-theme-red w-9 h-11 rounded-xl flex items-center justify-center text-2xl font-black shadow-xl">{time.s[0]}</div>
                <div className="bg-white text-theme-red w-9 h-11 rounded-xl flex items-center justify-center text-2xl font-black shadow-xl">{time.s[1]}</div>
              </div>
              <p className="mt-4 text-[10px] font-black tracking-widest text-white/60">{gameState.currentPeriodId}</p>
           </div>
        </div>

        {/* Betting Section */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-8 relative overflow-hidden border border-gray-100">
           {isLocked && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center"
             >
                <div className="relative">
                   <p className="text-9xl font-black text-theme-red italic animate-pulse opacity-20">{gameState.timeLeft}</p>
                   <p className="absolute inset-0 flex items-center justify-center text-5xl font-black text-theme-red italic">{gameState.timeLeft}</p>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Wait for next round</p>
             </motion.div>
           )}

           <div className="grid grid-cols-3 gap-4">
             <button onClick={() => handleBetClick('color', 'Green', 'bg-emerald-500')} className="bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all text-sm uppercase">Green</button>
             <button onClick={() => handleBetClick('color', 'Violet', 'bg-purple-500')} className="bg-purple-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-500/30 active:scale-95 transition-all text-sm uppercase">Violet</button>
             <button onClick={() => handleBetClick('color', 'Red', 'bg-red-500')} className="bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-500/30 active:scale-95 transition-all text-sm uppercase">Red</button>
           </div>

           <div className="grid grid-cols-5 gap-4">
             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
               const colorClass = (n === 0 || n === 5) ? 'bg-gradient-to-br from-purple-500 to-purple-400' : (n % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500');
               return (
                 <button 
                  key={n} 
                  onClick={() => handleBetClick('number', n.toString(), colorClass)}
                  className={`${colorClass} aspect-square rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white active:scale-90 transition-all`}
                 >
                   {n}
                 </button>
               );
             })}
           </div>

           <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleBetClick('size', 'Big', 'bg-theme-yellow')} className="bg-theme-yellow text-gray-800 font-black py-5 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest">Big</button>
             <button onClick={() => handleBetClick('size', 'Small', 'bg-blue-600')} className="bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest">Small</button>
           </div>
        </div>

        {/* History Switcher */}
        <div className="space-y-4">
           <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setActiveTab('game')} 
                className={`flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${activeTab === 'game' ? 'bg-theme-red text-white shadow-lg' : 'text-gray-400'}`}
              >
                Game Record
              </button>
              <button 
                onClick={() => setActiveTab('my')} 
                className={`flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${activeTab === 'my' ? 'bg-theme-red text-white shadow-lg' : 'text-gray-400'}`}
              >
                My Record
              </button>
           </div>

           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
             <table className="w-full text-center text-[10px]">
                <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-4">Period</th>
                    <th className="py-4">{activeTab === 'game' ? 'Result' : 'Pick'}</th>
                    <th className="py-4">Size</th>
                    <th className="py-4">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 uppercase font-black text-gray-700">
                  {gameState.history.map((rec, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-400 font-bold">{rec.periodId.slice(-4)}</td>
                      <td className="py-4">
                        <span className={`inline-block w-7 h-7 rounded-full text-white leading-7 text-xs ${
                          rec.color === 'Violet' ? 'bg-purple-500' : rec.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                        }`}>
                          {rec.number}
                        </span>
                      </td>
                      <td className="py-4 text-[10px]">{rec.size}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                             rec.color === 'Violet' ? 'bg-purple-500' : rec.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                          }`} />
                          <span className={rec.color === 'Violet' ? 'text-purple-500' : rec.color === 'Red' ? 'text-red-500' : 'text-emerald-500'}>
                            {rec.color}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {gameState.history.length === 0 && (
               <div className="py-20 text-center text-gray-300 font-black italic tracking-widest uppercase">
                  No records yet
               </div>
             )}
           </div>
        </div>
      </div>

      <BetModal 
        isOpen={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        onConfirm={handleConfirmBet}
        selection={selection}
        balance={userData?.wallet || 0}
      />
    </div>
  );
}
