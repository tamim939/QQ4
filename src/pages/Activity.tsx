import { 
  Trophy, 
  Gift, 
  Calendar,
  Download,
  Headphones,
  Award,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Activity() {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative text-left">
      {/* Top Navigation */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter">MK WIN 25</h1>
        <div className="flex space-x-4 text-gray-400">
          <Download size={20} strokeWidth={2.5} />
          <Headphones size={20} strokeWidth={2.5} />
        </div>
      </header>

      {/* Activity Center Header Card */}
      <div className="px-4 py-4">
        <div className="bg-[#f1c40f] rounded-[30px] p-6 text-white text-center relative shadow-lg shadow-[#f1c40f]/20">
          <h2 className="text-lg font-bold mb-8">Activity Center</h2>
          
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex-1">
              <p className="text-[10px] font-medium opacity-90 mb-1">Today's bonus</p>
              <p className="text-2xl font-black tracking-tight">৳0.00</p>
            </div>
            <div className="w-[1px] h-10 bg-white/30" />
            <div className="flex-1">
              <p className="text-[10px] font-medium opacity-90 mb-1">Total bonus</p>
              <p className="text-2xl font-black tracking-tight">৳0.00</p>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 flex justify-center">
            <button className="bg-white text-[#f1c40f] px-12 py-3 rounded-full text-xs font-black shadow-md shadow-[#f1c40f]/10 active:scale-95 transition-all">
              Bonus details
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-12 space-y-6">
        {/* Main Icon Grid */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-4 gap-4">
          <ActivityIcon icon={Award} label="Activity Award" color="bg-rose-50" iconColor="text-rose-500" />
          <ActivityIcon icon={Wallet} label="Betting rebate" color="bg-orange-50" iconColor="text-orange-500" />
          <ActivityIcon icon={Trophy} label="Super Jackpot" color="bg-emerald-50" iconColor="text-emerald-500" />
          <ActivityIcon icon={Gift} label="Invite Wheel" color="bg-purple-50" iconColor="text-purple-500" />
        </div>

        {/* Large Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <div className="h-28 bg-[#f56565] flex items-center justify-center relative">
               <Gift size={32} className="text-white relative z-10" />
            </div>
            <div className="p-3 text-center border-t border-gray-50">
              <p className="text-sm font-black text-gray-700">Gifts</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <div className="h-28 bg-[#4299e1] flex items-center justify-center relative">
               <Calendar size={32} className="text-white relative z-10" />
            </div>
            <div className="p-3 text-center border-t border-gray-50">
              <p className="text-sm font-black text-gray-700">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <button className="fixed right-6 bottom-24 w-12 h-12 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-xl z-40 border-4 border-white/50 active:scale-95 transition-all">
        <Headphones size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ActivityIcon({ icon: Icon, label, color, iconColor }: { icon: any, label: string, color: string, iconColor: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer active:scale-95 transition-transform">
      <div className={`${color} ${iconColor} w-12 h-12 rounded-2xl flex items-center justify-center`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-bold text-gray-500 text-center leading-tight whitespace-pre-wrap">{label}</p>
    </div>
  );
}
