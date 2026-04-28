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
  const [activeTab, setActiveTab] = useState<'game' | 'chart' | 'my'>('game');
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
        multiplier: bet.multiplier,
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
    const s = seconds % 60;
    return {
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const time = formatTime(gameState.timeLeft);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fc] pb-10 font-sans text-left">
      {/* Yellow Header */}
      <div className="bg-[#ffc93c] p-4 pb-12 rounded-b-[40px] relative z-10">
        <header className="flex items-center justify-between text-white mb-6">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-90 transition-all">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div className="flex flex-col items-center">
             <h1 className="text-xl font-black italic tracking-tighter leading-tight drop-shadow-md underline">QQ4</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Headphones size={20} />
            <Volume2 size={20} />
          </div>
        </header>

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl flex flex-col space-y-4 border border-white/20">
           <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-1">
                 <p className="text-[20px] font-black text-gray-800">৳ {userData?.wallet.toFixed(2)}</p>
                 <button onClick={() => window.location.reload()} className="text-gray-300 active:rotate-180 transition-transform">
                    <RefreshCw size={14} />
                 </button>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Wallet Balance</p>
           </div>
           <div className="flex space-x-3">
              <button className="flex-1 bg-[#ff6b6b] text-white py-3.5 rounded-full text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Withdraw</button>
              <button className="flex-1 bg-[#2ed573] text-white py-3.5 rounded-full text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Deposit</button>
           </div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        {/* Duration Tabs */}
        <div className="grid grid-cols-4 gap-2">
           {[30, 60, 180, 300].map((d) => (
             <button
              key={d}
              onClick={() => setActiveDuration(d)}
              className={`flex flex-col items-center py-3 rounded-2xl transition-all ${
                activeDuration === d ? 'bg-[#ffc93c] text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'
              }`}
             >
                <div className="mb-1"><Gamepad2 size={20} className={activeDuration === d ? 'text-white' : 'text-gray-300'} /></div>
                <span className="text-[9px] font-black tracking-tighter uppercase">WinGo {d >= 60 ? `${d/60}Min` : `${d}s`}</span>
             </button>
           ))}
        </div>

        {/* Time remaining and Period */}
        <div className="bg-white rounded-[24px] p-4 flex items-center justify-between relative overflow-hidden shadow-sm border border-gray-100">
           <div className="flex flex-col space-y-2">
              <button onClick={() => setShowRules(true)} className="flex items-center space-x-1 border border-yellow-100 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full w-fit">
                <Info size={12} />
                <span className="text-[10px] font-black uppercase">How to play</span>
              </button>
              <div className="flex items-center space-x-1">
                {gameState.history.slice(0, 5).map((h, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                    h.color === 'Violet' ? 'bg-purple-500' : h.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                  }`}>
                    {h.number}
                  </div>
                ))}
              </div>
           </div>
           
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Time remaining</p>
              <div className="flex items-center space-x-1 justify-end">
                 <div className="w-6 h-8 bg-gray-50 text-[#ffc93c] border border-gray-100 rounded-md flex items-center justify-center font-black text-lg">0</div>
                 <div className="w-6 h-8 bg-gray-50 text-[#ffc93c] border border-gray-100 rounded-md flex items-center justify-center font-black text-lg">0</div>
                 <span className="font-black text-lg mx-0.5 text-gray-300">:</span>
                 <div className="w-6 h-8 bg-gray-50 text-[#ffc93c] border border-gray-100 rounded-md flex items-center justify-center font-black text-lg">{time.s[0]}</div>
                 <div className="w-6 h-8 bg-gray-50 text-[#ffc93c] border border-gray-100 rounded-md flex items-center justify-center font-black text-lg">{time.s[1]}</div>
              </div>
              <p className="text-[9px] font-black mt-2 text-gray-400">{gameState.currentPeriodId}</p>
           </div>
        </div>

        {/* Betting Panel */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm space-y-6 relative overflow-hidden">
           {isLocked && (
             <div className="absolute inset-0 z-20 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <p className="text-6xl font-black text-[#ff6b6b] italic animate-bounce font-mono">{gameState.timeLeft}</p>
             </div>
           )}

           <div className="grid grid-cols-3 gap-2">
             <BetBtn label="Green" color="bg-[#2ed573]" onClick={() => handleBetClick('color', 'Green', 'bg-[#2ed573]')} />
             <BetBtn label="Violet" color="bg-[#9c88ff]" onClick={() => handleBetClick('color', 'Violet', 'bg-[#9c88ff]')} />
             <BetBtn label="Red" color="bg-[#ff4757]" onClick={() => handleBetClick('color', 'Red', 'bg-[#ff4757]')} />
           </div>

           <div className="grid grid-cols-5 gap-y-4 gap-x-2">
             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
               const colorClass = (n === 0 || n === 5) ? 'bg-purple-500' : (n % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500');
               const ringColor = (n === 0 || n === 5) ? 'border-purple-100/50' : (n % 2 === 0 ? 'border-red-100/50' : 'border-emerald-100/50');
               return (
                 <div key={n} className="flex flex-col items-center">
                   <button 
                    onClick={() => handleBetClick('number', n.toString(), colorClass)}
                    className={`w-12 h-12 rounded-full border-4 ${ringColor} bg-white flex items-center justify-center font-black text-xl shadow-sm active:scale-90 transition-all ${colorClass.replace('bg-', 'text-')}`}
                   >
                     {n}
                   </button>
                 </div>
               );
             })}
           </div>

           <div className="flex space-x-2">
              {['X1', 'X5', 'X10', 'X20', 'X50', 'X100'].map(mx => (
                <button key={mx} className="flex-1 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 border border-gray-100">
                   {mx}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-2 gap-2 pt-2">
             <button onClick={() => handleBetClick('size', 'Big', 'bg-[#ffa502]')} className="bg-[#ffa502] text-white font-black py-4 rounded-xl text-[14px] uppercase tracking-widest shadow-md active:scale-95 transition-all">Big</button>
             <button onClick={() => handleBetClick('size', 'Small', 'bg-[#1e90ff]')} className="bg-[#1e90ff] text-white font-black py-4 rounded-xl text-[14px] uppercase tracking-widest shadow-md active:scale-95 transition-all">Small</button>
           </div>
        </div>

        {/* History Tabs and Table */}
        <div className="space-y-3">
           <div className="flex bg-white/50 p-1 rounded-2xl">
              <TabBtn label="Game history" active={activeTab === 'game'} onClick={() => setActiveTab('game')} />
              <TabBtn label="Chart" active={activeTab === 'chart'} onClick={() => setActiveTab('chart')} />
              <TabBtn label="My history" active={activeTab === 'my'} onClick={() => setActiveTab('my')} />
           </div>

           <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50 min-h-[400px]">
              {activeTab === 'game' && <HistoryTable history={gameState.history} />}
              {activeTab === 'my' && <MyHistoryTable records={myRecords} />}
              {activeTab === 'chart' && (
                <div className="p-6 space-y-6">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">Number Frequency (Last 100)</h4>
                   <div className="flex items-end justify-between h-40 px-2 group">
                      {[0,1,2,3,4,5,6,7,8,9].map(num => {
                        const count = gameState.history.filter(h => h.number === num).length;
                        const height = Math.max(10, count * 15);
                        const colorClass = (num === 0 || num === 5) ? 'bg-purple-500' : (num % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500');
                        return (
                          <div key={num} className="flex flex-col items-center flex-1 space-y-2">
                             <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  className={`w-4/5 rounded-t-lg shadow-sm transition-all hover:brightness-110 ${colorClass}`}
                                />
                                <span className="absolute -top-6 text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   {count}
                                </span>
                             </div>
                             <span className={`text-[10px] font-black ${colorClass.replace('bg-', 'text-')}`}>{num}</span>
                          </div>
                        );
                      })}
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Big / Small</p>
                         <div className="flex justify-center space-x-3">
                            <span className="text-xs font-black text-gray-700">B: {gameState.history.filter(h => h.size === 'Big').length}</span>
                            <span className="text-xs font-black text-gray-700">S: {gameState.history.filter(h => h.size === 'Small').length}</span>
                         </div>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Red / Green</p>
                         <div className="flex justify-center space-x-3">
                            <span className="text-xs font-black text-red-500">R: {gameState.history.filter(h => h.color === 'Red').length}</span>
                            <span className="text-xs font-black text-emerald-500">G: {gameState.history.filter(h => h.color === 'Green').length}</span>
                         </div>
                      </div>
                   </div>
                </div>
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
               className="bg-white w-full max-w-sm rounded-[40px] p-10 relative z-10"
            >
               <button onClick={() => setShowRules(false)} className="absolute right-8 top-8 text-gray-300">
                  <X size={24} strokeWidth={3} />
               </button>
               <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">GAME RULES</h3>
               <div className="space-y-4 text-[12px] font-bold text-gray-500 leading-relaxed">
                  <p>• Green: 1,3,7,9 (2x) | 5 (1.5x)</p>
                  <p>• Red: 2,4,6,8 (2x) | 0 (1.5x)</p>
                  <p>• Violet: 0,5 (4.5x)</p>
                  <p>• Number: 0-9 (9x)</p>
                  <p>• Big/Small: 5-9 Big, 0-4 Small (2x)</p>
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

function BetBtn({ label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`${color} text-white font-black py-4 rounded-xl text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-md`}>
      {label}
    </button>
  );
}

function TabBtn({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
        active ? 'bg-[#ffc93c] text-white shadow-md' : 'text-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

function HistoryTable({ history }: { history: any[] }) {
  return (
    <table className="w-full text-center text-[12px]">
      <thead className="bg-[#ffc93c]/10 text-gray-400 font-black uppercase tracking-widest">
        <tr>
          <th className="py-4 pl-4 text-left">Period</th>
          <th className="py-4">Number</th>
          <th className="py-4">Big Small</th>
          <th className="py-4 pr-4">Color</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {history.map((rec, i) => (
          <tr key={i} className="text-gray-700 font-bold border-b border-gray-50">
            <td className="py-4 pl-4 text-left text-gray-400 font-mono text-[10px] tracking-tighter">{rec.periodId}</td>
            <td className={`py-4 text-3xl font-black drop-shadow-sm ${
              rec.color === 'Violet' ? 'text-purple-500' : rec.color === 'Red' ? 'text-red-500' : 'text-emerald-500'
            }`}>
              {rec.number}
            </td>
            <td className="py-4 text-[11px] font-black text-gray-500 uppercase tracking-tighter">{rec.size}</td>
            <td className="py-4 pr-4">
               <div className="flex justify-center items-center">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${
                    rec.color === 'Violet' ? 'bg-purple-500' : rec.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
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
      <table className="w-full text-center text-[12px]">
        <thead className="bg-[#ffc93c]/10 text-gray-400 font-black uppercase tracking-widest">
          <tr>
            <th className="py-4 pl-4 text-left">Period</th>
            <th className="py-4">Pick</th>
            <th className="py-4">Bet</th>
            <th className="py-4 pr-4">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {records.map((rec, i) => (
            <tr key={i} className="text-gray-700 font-bold">
              <td className="py-4 pl-4 text-left text-gray-400 font-mono text-[10px]">{rec.periodId.slice(-6)}</td>
              <td className="py-4">
                 <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[10px] uppercase font-black">{rec.value}</span>
              </td>
              <td className="py-4">৳{rec.amount}</td>
              <td className={`py-4 pr-4 text-[10px] uppercase font-black ${
                rec.status === 'win' ? 'text-emerald-500' : rec.status === 'lose' ? 'text-red-500' : 'text-gray-300'
              }`}>
                {rec.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
