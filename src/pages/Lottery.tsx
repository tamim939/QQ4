import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, Volume2, Gamepad2, Info, Headphones, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

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
  const [showRules, setShowRules] = useState(false);
  const [myRecords, setMyRecords] = useState<any[]>([]);

  const gameState = durations[activeDuration];
  const isLocked = gameState.timeLeft <= 5;

  // Fetch My Records
  useEffect(() => {
    if (!userData?.uid) return;
    const q = query(
      collection(db, 'bets'),
      where('userId', '==', userData.uid),
      where('duration', '==', activeDuration),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMyRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [userData?.uid, activeDuration]);

  const handleBetClick = (type: string, value: string, colorClass: string) => {
    if (isLocked) return;
    setSelection({ type, value, color: colorClass });
    setBetModalOpen(true);
  };

  const handleConfirmBet = async (bet: { type: string; value: string; amount: number; multiplier: number }) => {
    if (!userData) return;
    const totalAmount = bet.amount * bet.multiplier;

    if (totalAmount > userData.wallet || totalAmount <= 0) {
      toast.error("Insufficient Balance!");
      return;
    }

    try {
      await addDoc(collection(db, 'bets'), {
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
      toast.success('Bet placed successfully!');
    } catch (e) {
      console.error("Betting error:", e);
      toast.error("Bet placement failed.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 100; // Match 30s logic better
    return {
      m: m.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    };
  };

  const time = formatTime(gameState.timeLeft);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fc] pb-20 font-sans text-left">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between text-gray-800 sticky top-0 z-40 border-b border-gray-50">
        <button onClick={onBack} className="text-gray-400 p-2 -ml-2 active:scale-90 transition-all">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter leading-tight">QQ4</h1>
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">WIN GO 30S</span>
        </div>
        <button className="text-gray-400 p-2 -mr-2 active:scale-90 transition-all"><Headphones size={24} /></button>
      </header>

      <div className="p-4 space-y-4">
        {/* Wallet Balance Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col space-y-5 border border-gray-100">
           <div className="flex items-center space-x-4">
              <div 
                onClick={() => window.location.reload()}
                className="bg-theme-yellow/10 p-3 rounded-2xl text-theme-yellow active:rotate-180 transition-transform duration-500"
              >
                 <RefreshCw size={24} strokeWidth={3} />
              </div>
              <div>
                 <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest leading-none mb-1.5">Total Balance</p>
                 <p className="text-3xl font-black text-gray-800 tracking-tight">৳ {userData?.wallet.toFixed(2)}</p>
              </div>
           </div>
           <div className="flex space-x-3">
              <button className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 active:scale-95 transition-all">Withdraw</button>
              <button className="flex-1 bg-[#f1c40f] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#f1c40f]/20 active:scale-95 transition-all">Deposit</button>
           </div>
        </div>

        {/* Tab Switcher for Durations */}
        <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
           {[30, 60, 180].map((d) => (
             <button
              key={d}
              onClick={() => setActiveDuration(d)}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                activeDuration === d ? 'bg-[#ff5e3a] text-white shadow-lg' : 'text-gray-400'
              }`}
             >
                {d >= 60 ? `${d / 60}Min` : `${d}s`}
             </button>
           ))}
        </div>

        {/* Game Info Card (Next Period & Timer) */}
        <div className="bg-gradient-to-br from-[#ff5e3a] to-[#ff2a68] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-red-500/10">
           <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse" />
           
           <div className="flex items-center justify-between relative z-10">
              <div className="space-y-5">
                 <button 
                  onClick={() => setShowRules(true)}
                  className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-full flex items-center space-x-2 border border-white/20 active:scale-90 transition-all"
                 >
                    <Info size={14} className="text-white" />
                    <span className="text-[11px] font-black uppercase tracking-widest">RULES</span>
                 </button>
                 
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-0.5">GAME HISTORY</p>
                    <div className="flex items-center -space-x-1">
                       {gameState.history.slice(0, 5).map((h, i) => (
                         <div key={i} className={`w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-black shadow-sm ${
                            h.color === 'Violet' ? 'bg-purple-500' : h.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                         }`}>
                           {h.number}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="text-right flex flex-col items-end">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3.5 mr-0.5">NEXT PERIOD</p>
                 <div className="flex items-center space-x-1.5">
                    <TimerBox value={time.s[0]} />
                    <TimerBox value={time.s[1]} />
                 </div>
                 <p className="mt-5 text-[11px] font-black tracking-[0.2em] font-mono text-white/90">{gameState.currentPeriodId}</p>
              </div>
           </div>
        </div>

        {/* Betting Section */}
        <div className="bg-white rounded-[44px] p-8 shadow-sm space-y-8 relative overflow-hidden border border-gray-100">
           {isLocked && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center"
             >
                <div className="relative">
                   <p className="text-[160px] font-black text-theme-red italic animate-pulse opacity-10">{gameState.timeLeft}</p>
                   <p className="absolute inset-0 flex items-center justify-center text-6xl font-black text-theme-red italic">{gameState.timeLeft}</p>
                </div>
                <p className="text-[11px] font-black text-theme-red uppercase tracking-[0.4em] -mt-10">LOCKING</p>
             </motion.div>
           )}

           <div className="grid grid-cols-3 gap-3.5">
             <BetChoice label="GREEN" color="bg-[#00b894]" onClick={() => handleBetClick('color', 'Green', 'bg-[#00b894]')} />
             <BetChoice label="VIOLET" color="bg-[#a29bfe]" onClick={() => handleBetClick('color', 'Violet', 'bg-[#a29bfe]')} />
             <BetChoice label="RED" color="bg-[#ff7675]" onClick={() => handleBetClick('color', 'Red', 'bg-[#ff7675]')} />
           </div>

           <div className="grid grid-cols-5 gap-3.5">
             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
               const colorClass = (n === 0 || n === 5) ? 'bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7]' : (n % 2 === 0 ? 'bg-[#ff7675]' : 'bg-[#00b894]');
               return (
                 <button 
                  key={n} 
                  onClick={() => handleBetClick('number', n.toString(), colorClass)}
                  className={`${colorClass} aspect-square rounded-[22px] flex items-center justify-center text-white font-black text-xl shadow-md border-b-4 border-black/10 active:scale-90 transition-all`}
                 >
                    {n}
                 </button>
               );
             })}
           </div>

           <div className="grid grid-cols-2 gap-4 pt-4">
             <button onClick={() => handleBetClick('size', 'Big', 'bg-[#fdcb6e]')} className="bg-[#fdcb6e] text-gray-800 font-black py-5 rounded-[28px] shadow-lg shadow-[#fdcb6e]/10 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">BIG</button>
             <button onClick={() => handleBetClick('size', 'Small', 'bg-[#0984e3]')} className="bg-[#0984e3] text-white font-black py-5 rounded-[28px] shadow-lg shadow-[#0984e3]/10 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">SMALL</button>
           </div>
        </div>

        {/* Records Section */}
        <div className="space-y-4">
           <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setActiveTab('game')} 
                className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${activeTab === 'game' ? 'bg-[#ff5e3a] text-white shadow-md' : 'text-gray-300'}`}
              >
                Game Record
              </button>
              <button 
                onClick={() => setActiveTab('my')} 
                className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${activeTab === 'my' ? 'bg-[#ff5e3a] text-white shadow-md' : 'text-gray-300'}`}
              >
                My Record
              </button>
           </div>

           <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              {activeTab === 'game' ? (
                <HistoryTable history={gameState.history} />
              ) : (
                <MyHistoryTable records={myRecords} />
              )}
           </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setShowRules(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ scale: 0.9, y: 20, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="bg-white w-full max-w-sm rounded-[40px] p-10 relative z-10 overflow-hidden"
            >
               <button 
                onClick={() => setShowRules(false)}
                className="absolute right-8 top-8 text-gray-300 hover:text-gray-800 transition-colors"
               >
                  <X size={24} strokeWidth={3} />
               </button>
               
               <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tight">GAME RULES</h3>
               <div className="space-y-5 text-[13px] font-bold text-gray-500 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic mb-4">
                     Predict the 30s outcome of numbers 0-9.
                  </div>
                  <p>• <span className="text-emerald-500">Green</span>: 1, 3, 7, 9 pays 2x. (5 pays 1.5x)</p>
                  <p>• <span className="text-red-500">Red</span>: 2, 4, 6, 8 pays 2x. (0 pays 1.5x)</p>
                  <p>• <span className="text-purple-500">Violet</span>: 0, 5 pays 4.5x.</p>
                  <p>• <span className="text-gray-800 font-black">Numbers</span>: Correct 0-9 pays 9x.</p>
                  <p>• <span className="text-yellow-600">Big/Small</span>: 5-9 Big, 0-4 Small. Pays 2x.</p>
                  <p className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-gray-300 uppercase tracking-widest text-center">Play Responsibly</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

function TimerBox({ value }: { value: string }) {
  return (
    <div className="bg-white text-[#ff5e3a] w-10 h-14 rounded-xl flex items-center justify-center text-3xl font-black shadow-xl shadow-red-500/20">
      {value}
    </div>
  );
}

function BetChoice({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`${color} text-white font-black py-4 rounded-[22px] shadow-lg shadow-black/5 active:scale-95 transition-all text-[11px] tracking-[0.2em]`}
    >
      {label}
    </button>
  );
}

function HistoryTable({ history }: { history: any[] }) {
  return (
    <table className="w-full text-center text-[11px] font-sans">
      <thead className="bg-[#fbfcfe] text-gray-300 font-black uppercase tracking-[0.2em] border-b border-gray-50">
        <tr>
          <th className="py-5 pl-8 text-left">PERIOD</th>
          <th className="py-5">RESULT</th>
          <th className="py-5">SIZE</th>
          <th className="py-5 pr-8">COLOR</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 uppercase font-black text-gray-800">
        {history.map((rec, i) => (
          <tr key={i} className="hover:bg-gray-50/30 transition-colors">
            <td className="py-5 pl-8 text-left font-mono font-bold text-gray-300 text-[10px]">{rec.periodId.slice(-4)}</td>
            <td className="py-5">
              <span className={`inline-block w-7 h-7 rounded-full text-white leading-7 text-xs font-black shadow-sm ${
                rec.color === 'Violet' ? 'bg-[#a29bfe]' : rec.color === 'Red' ? 'bg-[#ff7675]' : 'bg-[#00b894]'
              }`}>
                {rec.number}
              </span>
            </td>
            <td className="py-5">
              <span className={`text-[10px] tracking-widest ${rec.size === 'Big' ? 'text-[#fdcb6e]' : 'text-[#0984e3]'}`}>{rec.size}</span>
            </td>
            <td className="py-5 pr-8">
               <div className="flex items-center justify-center space-x-2">
                  {(rec.number === 0 || rec.number === 5) && <div className="w-2.5 h-2.5 rounded-full bg-[#a29bfe] shadow-sm" />}
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${rec.color === 'Red' ? 'bg-[#ff7675]' : 'bg-[#00b894]'}`} />
               </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MyHistoryTable({ records }: { records: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-[11px]">
        <thead className="bg-[#fbfcfe] text-gray-300 font-black uppercase tracking-[0.2em] border-b border-gray-50">
          <tr>
            <th className="py-5 pl-8 text-left">PERIOD</th>
            <th className="py-4">PICK</th>
            <th className="py-4">BET</th>
            <th className="py-5 pr-8">RESULT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 uppercase font-black text-gray-700">
          {records.map((rec, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="py-5 pl-8 text-left font-mono font-bold text-gray-300 text-[10px]">{rec.periodId.slice(-4)}</td>
              <td className="py-5">
                 <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] border border-gray-100">
                    {rec.value}
                 </span>
              </td>
              <td className="py-5 text-gray-400 font-bold">৳{rec.amount}</td>
              <td className="py-5 pr-8">
                <span className={`text-[10px] font-black tracking-widest ${
                  rec.status === 'win' ? 'text-[#00b894]' : rec.status === 'lose' ? 'text-[#ff7675]' : 'text-gray-300'
                }`}>
                  {rec.status}
                </span>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
             <tr>
                <td colSpan={4} className="py-20 text-center text-gray-300 font-black tracking-widest uppercase text-[10px]">No records found</td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
