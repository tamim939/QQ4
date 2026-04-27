import { useState, useEffect } from 'react';
import { ChevronLeft, Wallet as WalletIcon, Bomb, Gem, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Mines({ onBack }: { onBack: () => void }) {
  const { userData } = useAuth();
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const factorials: number[] = [1];
  for (let i = 1; i <= 25; i++) factorials[i] = factorials[i - 1] * i;
  const nCr = (n: number, r: number) => factorials[n] / (factorials[r] * factorials[n - r]);
  const multiplier = isPlaying && revealed.length > 0 
    ? (1 / (nCr(25 - mineCount, revealed.length) / nCr(25, revealed.length)) * 0.95).toFixed(2)
    : "0.00";

  const startGame = async () => {
    if (!userData || userData.wallet < bet) return;
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, { wallet: increment(-bet) });

    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const m = Math.floor(Math.random() * 25);
      if (!newMines.includes(m)) newMines.push(m);
    }
    setMines(newMines);
    setRevealed([]);
    setGameOver(false);
    setWin(false);
    setIsPlaying(true);
  };

  const handleTileClick = (idx: number) => {
    if (!isPlaying || revealed.includes(idx) || gameOver) return;

    if (mines.includes(idx)) {
      setGameOver(true);
      setWin(false);
      setIsPlaying(false);
      setRevealed([...revealed, idx]);
    } else {
      const newRevealed = [...revealed, idx];
      setRevealed(newRevealed);
      if (newRevealed.length === 25 - mineCount) {
         handleCashout();
      }
    }
  };

  const handleCashout = async () => {
    if (!isPlaying || revealed.length === 0) return;
    const profit = bet * parseFloat(multiplier);
    const userRef = doc(db, 'users', userData!.uid);
    await updateDoc(userRef, { wallet: increment(profit) });
    setWin(true);
    setGameOver(true);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-theme-yellow px-4 py-4 flex items-center justify-between text-gray-800 sticky top-0 z-40 border-b">
        <button onClick={onBack}><ChevronLeft size={24} /></button>
        <div className="flex flex-col items-center">
           <h1 className="text-xl font-black italic text-white tracking-tighter drop-shadow-sm">QQ4</h1>
           <span className="text-[10px] font-bold text-white/80">MINES GAME</span>
        </div>
        <div className="w-8" />
      </header>

      <div className="p-4 space-y-4">
        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="bg-theme-yellow p-2 rounded-xl text-gray-800">
                 <WalletIcon size={24} />
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Balance</p>
                 <p className="text-xl font-black text-gray-800">৳{userData?.wallet.toFixed(2)}</p>
              </div>
           </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Bet Amount</label>
                 <input 
                  type="number" 
                  value={bet} 
                  onChange={(e) => setBet(Number(e.target.value))}
                  disabled={isPlaying}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 font-black text-gray-700 focus:outline-none focus:ring-2 focus:ring-theme-red/20 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Mines</label>
                 <select 
                  value={mineCount} 
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  disabled={isPlaying}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 font-black text-gray-700 focus:outline-none focus:ring-2 focus:ring-theme-red/20 transition-all appearance-none"
                 >
                    {[1, 3, 5, 10, 15, 20, 24].map(v => <option key={v} value={v}>{v}</option>)}
                 </select>
              </div>
           </div>

           {/* Grid */}
           <div className="grid grid-cols-5 gap-2 aspect-square">
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTileClick(i)}
                  className={`rounded-xl flex items-center justify-center text-2xl shadow-sm transition-all relative overflow-hidden ${
                    revealed.includes(i)
                    ? (mines.includes(i) ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white')
                    : (isPlaying ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 opacity-50 cursor-not-allowed')
                  }`}
                >
                  {revealed.includes(i) ? (
                    mines.includes(i) ? <Bomb /> : <Gem className="scale-110" />
                  ) : null}
                  {gameOver && mines.includes(i) && !revealed.includes(i) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-100/30 text-red-300">
                      <Bomb size={16} />
                    </div>
                  )}
                </motion.button>
              ))}
           </div>

           {/* Controls */}
           <div className="space-y-4">
              {isPlaying && (
                <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Multiplier</span>
                      <span className="text-xl font-black text-emerald-700">{multiplier}x</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Cashout Amount</span>
                      <span className="text-xl font-black text-emerald-700">৳{(bet * parseFloat(multiplier)).toFixed(2)}</span>
                   </div>
                </div>
              )}

              <button
                onClick={isPlaying ? handleCashout : startGame}
                className={`w-full py-5 rounded-3xl font-black text-lg shadow-lg transition-all active:scale-95 ${
                  isPlaying 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200' 
                  : 'bg-gradient-to-r from-theme-red to-orange-600 text-white shadow-red-200'
                }`}
              >
                {isPlaying ? '💸 CASHOUT' : '🚀 START GAME'}
              </button>
           </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl text-center font-bold ${win ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {win ? `CONGRATS! You won ৳${(bet * parseFloat(multiplier)).toFixed(2)}` : 'BOOM! Game Over.'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
