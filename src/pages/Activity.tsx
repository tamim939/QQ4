import { 
  Trophy, 
  Users, 
  Gift, 
  Target, 
  ChevronRight, 
  Sparkles,
  Flame,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Activity() {
  const { userData } = useAuth();

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-theme-red to-orange-600 px-4 pt-12 pb-24 text-white text-center rounded-b-[40px] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10" />
        <h1 className="text-2xl font-black italic tracking-tighter mb-1">ACTIVITY CENTER</h1>
        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Rewards & Promotions</p>
      </header>

      <div className="px-4 -mt-16 space-y-4">
        {/* Daily Bonus Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-3xl p-6 shadow-md border border-white flex justify-between items-center relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 w-1.5 h-full bg-theme-yellow" />
          <div className="flex items-center space-x-4">
            <div className="bg-theme-yellow/10 p-3 rounded-2xl text-theme-yellow">
               <Calendar size={28} className="stroke-[2.5]" />
            </div>
            <div>
               <p className="text-sm font-black text-gray-800">Attendance Bonus</p>
               <p className="text-[10px] font-bold text-gray-400">Claim ৳5 - ৳100 daily login reward</p>
            </div>
          </div>
          <button className="bg-theme-yellow text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-theme-yellow/20">Sign In</button>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
           <ActivityCard 
             icon={Users} 
             title="Refer & Earn" 
             desc="Get ৳100 per friend" 
             color="text-theme-blue" 
             bg="bg-theme-blue/10" 
           />
           <ActivityCard 
             icon={Trophy} 
             title="Tournament" 
             desc="Win share of ৳10,000" 
             color="text-win" 
             bg="bg-win/10" 
           />
           <ActivityCard 
             icon={Gift} 
             title="Jackpot" 
             desc="Unlock lucky boxes" 
             color="text-theme-red" 
             bg="bg-theme-red/10" 
           />
           <ActivityCard 
             icon={Target} 
             title="Missions" 
             desc="Complete daily tasks" 
             color="text-gray-700" 
             bg="bg-gray-100" 
           />
        </div>

        {/* Hot Events Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
           <div className="flex items-center space-x-2">
              <Flame className="text-theme-red animate-pulse" size={18} />
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Hot Promotions</h2>
           </div>

           <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 group">
                 <img 
                    src="https://img.freepik.com/free-vector/gradient-boxing-banner-template_23-2149021271.jpg" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    alt="Promo"
                 />
                 <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="bg-win self-start px-2 py-0.5 rounded text-[8px] font-black text-white uppercase mb-2">Live Now</div>
                    <h3 className="text-white font-black italic">FIRST DEPOSIT BONUS</h3>
                    <p className="text-white/70 text-[10px] font-bold">GET 100% EXTRA BALANCE ON YOUR FIRST RECHARGE</p>
                 </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 group">
                 <img 
                    src="https://img.freepik.com/free-vector/cyber-monday-background-with-glitch-effect_23-2148705058.jpg" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    alt="Promo"
                 />
                 <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="bg-theme-yellow self-start px-2 py-0.5 rounded text-[8px] font-black text-white uppercase mb-2">Weekly</div>
                    <h3 className="text-white font-black italic">REFERRAL CHAMPIONSHIP</h3>
                    <p className="text-white/70 text-[10px] font-bold">SHARE TOP ৳100,000 PRIZE POOL BY INVITING FRIENDS</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ icon: Icon, title, desc, color, bg }: { icon: any, title: string, desc: string, color: string, bg: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3 active:scale-95 transition-all cursor-pointer">
       <div className={`${bg} ${color} w-10 h-10 rounded-2xl flex items-center justify-center`}>
          <Icon size={22} className="stroke-[2.5]" />
       </div>
       <div>
          <p className="text-xs font-black text-gray-800">{title}</p>
          <p className="text-[9px] font-bold text-gray-400">{desc}</p>
       </div>
    </div>
  );
}
