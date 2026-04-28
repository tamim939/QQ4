import { 
  ChevronLeft,
  Trophy,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Rebate({ onBack }: { onBack: () => void }) {
  const { userData } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);

  // Example logic: ৳6 for every ৳1000 bet
  const totalBet = userData?.totalWager || 0;
  const claimedRebate = userData?.claimedRebate || 0;
  
  // Total rebate earned so far based on total bet
  const totalRebateEarned = (totalBet / 1000) * 6;
  
  // What's available to claim now
  const claimableAmount = Math.max(0, totalRebateEarned - claimedRebate);

  const handleClaim = async () => {
    if (claimableAmount <= 0) {
      toast.error('No rebate available to claim');
      return;
    }

    setIsClaiming(true);
    try {
      if (userData?.uid) {
        await updateDoc(doc(db, 'users', userData.uid), {
          wallet: increment(claimableAmount),
          claimedRebate: increment(claimableAmount)
        });
        toast.success(`৳${claimableAmount.toFixed(2)} rebate claimed!`);
      }
    } catch (error) {
      toast.error('Failed to claim rebate');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-all">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="flex-1 text-center font-black text-gray-800 pr-8 tracking-wider uppercase">BETTING REBATE</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Rebate Card */}
        <div className="bg-[#f1c40f] rounded-[32px] p-8 text-white shadow-xl shadow-[#f1c40f]/20 relative overflow-hidden">
           {/* Decorative circles */}
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
           <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/5 rounded-full blur-lg" />

           <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">TOTAL BET AMOUNT</p>
                <p className="text-4xl font-black tracking-tight">৳ {totalBet.toFixed(2)}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 flex items-center justify-between">
                 <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">CLAIMABLE REBATE</p>
                    <p className="text-2xl font-black tracking-tight">৳ {claimableAmount.toFixed(2)}</p>
                 </div>
                 <button 
                  onClick={handleClaim}
                  disabled={claimableAmount <= 0 || isClaiming}
                  className="bg-white text-[#f1c40f] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                 >
                   {isClaiming ? '...' : 'CLAIM'}
                 </button>
              </div>
           </div>
        </div>

        {/* Rebate Rules Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center space-y-4">
           <div className="flex items-center justify-center space-x-2 text-gray-800">
              <Trophy size={18} className="text-[#f1c40f]" />
              <h3 className="text-sm font-black uppercase tracking-widest">REBATE RULES</h3>
           </div>
           
           <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 italic">
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                For every ৳1,000 bet generated, you can claim ৳6.00 as a rebate reward. 
                The more you bet, the more you earn!
              </p>
           </div>

           <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-gray-300">
              <Info size={12} />
              <span>Rebate calculation is real-time.</span>
           </div>
        </div>

        {/* Extra info */}
        <div className="px-4 py-8 text-center">
           <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
