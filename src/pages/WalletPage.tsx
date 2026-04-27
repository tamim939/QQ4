import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  ChevronRight, 
  Clock, 
  CreditCard,
  Banknote,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function WalletPage() {
  const { userData } = useAuth();

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-24">
      {/* Header */}
      <header className="bg-theme-yellow px-4 pt-12 pb-24 text-gray-800 text-center rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black rounded-full" />
           <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-black rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Balance</p>
        <h1 className="text-4xl font-black italic">৳{userData.wallet.toFixed(2)}</h1>
      </header>

      <div className="px-4 -mt-16 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-md shadow-gray-200/50 border border-white flex justify-around">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 bg-red-50 text-theme-red rounded-2xl flex items-center justify-center shadow-inner">
               <ArrowDownCircle size={28} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-gray-400 capitalize">Deposit</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center shadow-inner">
               <ArrowUpCircle size={28} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-gray-400 capitalize">Withdraw</span>
          </div>
        </div>

        {/* Assets Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Payment Assets</h2>
              <button className="text-[10px] font-black text-theme-yellow bg-theme-yellow/10 px-3 py-1 rounded-full">Add Card</button>
           </div>

           <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="flex items-center space-x-3">
                    <div className="bg-theme-yellow p-2 rounded-xl text-white">
                       <Banknote size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Main Wallet</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Available ৳{userData.wallet.toFixed(2)}</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-gray-300" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="flex items-center space-x-3">
                    <div className="bg-theme-blue p-2 rounded-xl text-white">
                       <CreditCard size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Bank Card</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">No card linked</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-gray-300" />
              </div>
           </div>
        </div>

        {/* Security Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
           <div className="bg-win/10 p-3 rounded-2xl text-win">
              <ShieldCheck size={32} />
           </div>
           <div>
              <p className="text-sm font-black text-gray-800">Funds Security</p>
              <p className="text-[10px] font-bold text-gray-400">All your transactions are encrypted and secured with bank-grade technology.</p>
           </div>
        </div>

        {/* History Link */}
        <button className="w-full flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-gray-100 group">
           <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-400 group-active:text-theme-red transition-colors">
                 <Clock size={20} />
              </div>
              <span className="text-xs font-black text-gray-700">Transaction History</span>
           </div>
           <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
