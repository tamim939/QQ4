import { 
  Trophy, 
  Gift, 
  Calendar,
  Download,
  Headphones,
  Award,
  Wallet,
  Zap,
  Target,
  Megaphone,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Activity() {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative text-left">
      {/* Top Navigation */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100 sticky top-0 z-50">
        <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter uppercase">MK WIN 25</h1>
        <div className="flex space-x-4 text-gray-400">
          <Download size={20} strokeWidth={2.5} />
          <Headphones size={20} strokeWidth={2.5} />
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-br from-[#f1c40f] to-[#f39c12] rounded-[32px] p-6 text-white text-center relative overflow-hidden shadow-xl shadow-[#f1c40f]/30">
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-xl" />

          <h2 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center justify-center space-x-2">
            <Megaphone size={18} fill="white" />
            <span>Activity Center</span>
          </h2>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center mb-10 border border-white/20">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">Today's Bonus</p>
              <p className="text-2xl font-black tracking-tight">৳ 0.00</p>
            </div>
            <div className="w-[1px] h-10 bg-white/20 mx-4" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">Total Bonus</p>
              <p className="text-2xl font-black tracking-tight">৳ 0.00</p>
            </div>
          </div>

          <div className="flex justify-center -mb-2">
            <button className="bg-white text-[#f1c40f] px-10 py-3 rounded-full text-[13px] font-black shadow-lg hover:shadow-xl active:scale-95 transition-all uppercase tracking-tight">
              Bonus details
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-8 space-y-8">
        {/* Main Categories Grid */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex justify-between items-center px-4">
           <ActivityAction icon={Award} label="Activity Award" color="bg-rose-50" iconColor="text-rose-500" />
           <ActivityAction icon={Megaphone} label="Promotion" color="bg-orange-50" iconColor="text-orange-500" />
           <ActivityAction icon={Trophy} label="Jackpot" color="bg-emerald-50" iconColor="text-emerald-500" />
           <ActivityAction icon={Calendar} label="Attendance" color="bg-blue-50" iconColor="text-blue-500" />
        </div>

        {/* Dynamic Activity List */}
        <div className="space-y-4">
           <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-4 bg-[#f1c40f] rounded-full" />
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Latest Events</h3>
           </div>

           <EventCard 
            title="Referral Program 2.0" 
            desc="Invite friends and earn up to ৳5,000 bonus instantly! Every referral counts."
            icon={Zap}
            color="bg-purple-600"
           />

           <EventCard 
            title="Weekly Lucky Draw" 
            desc="Deposit ৳500+ this week to enter. Top prize is a brand new iPhone 15 Pro!"
            icon={Target}
            color="bg-emerald-600"
           />

           <EventCard 
            title="VIP Loyalty Reward" 
            desc="Reach VIP Level 5 to unlock monthly cashback and personalized support."
            icon={Trophy}
            color="bg-blue-600"
           />
        </div>
      </div>

      {/* Floating Customer Support */}
      <button className="fixed right-6 bottom-24 w-14 h-14 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-2xl z-40 border-4 border-white active:scale-90 transition-all">
        <Headphones size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ActivityAction({ icon: Icon, label, color, iconColor }: { icon: any, label: string, color: string, iconColor: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer active:scale-95 transition-transform">
      <div className={`${color} ${iconColor} w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black text-gray-400 text-center leading-none uppercase tracking-tighter">{label}</p>
    </div>
  );
}

function EventCard({ title, desc, icon: Icon, color }: { title: string, desc: string, icon: any, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row active:scale-[0.98] transition-all"
    >
      <div className={`h-32 md:w-32 md:h-auto ${color} flex items-center justify-center relative`}>
         <div className="absolute inset-0 bg-black/10" />
         <Icon size={48} className="text-white relative z-10 opacity-40 absolute -right-4 -bottom-4 rotate-12" />
         <Icon size={32} className="text-white relative z-10" />
      </div>
      <div className="p-6 flex-1 bg-white">
        <h4 className="text-sm font-black text-gray-800 mb-1">{title}</h4>
        <p className="text-xs font-bold text-gray-400 leading-relaxed">{desc}</p>
        <button className="mt-4 text-[#f1c40f] text-[10px] font-black uppercase tracking-widest flex items-center space-x-1">
          <span>Explore Now</span>
          <ChevronRight size={12} strokeWidth={4} />
        </button>
      </div>
    </motion.div>
  );
}
