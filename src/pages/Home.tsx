import { useState, useEffect } from 'react';
import { 
  Download, 
  Headphones, 
  LayoutGrid, 
  Gamepad2, 
  Banknote, 
  Trophy, 
  Bell, 
  Gem,
  Dice5,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  onSelectGame: (gameId: string) => void;
}

const CATEGORIES = [
  { id: 'all', icon: LayoutGrid, label: "All", color: "bg-gray-50 text-gray-400" },
  { id: 'slots', icon: Gamepad2, label: "Slots", color: "bg-green-50 text-green-500" },
  { id: 'lottery', icon: Banknote, label: "Lottery", color: "bg-theme-yellow/10 text-theme-yellow", active: true },
  { id: 'sports', icon: Trophy, label: "Sports", color: "bg-blue-50 text-theme-blue" },
];

const USER_POOL = [
  { id: 'ZSZ', img: 'https://img.freepik.com/free-photo/lifestyle-people-emotions-concept-close-up-cheerful-stylish-girl-with-blue-eyes-natural-makeup-wearing-grey-t-shirt-smiling-broadly-expressing-joy-happiness-optimism_176420-14285.jpg' },
  { id: 'XHX', img: 'https://img.freepik.com/free-photo/portrait-handsome-man-with-dark-hair_176420-15582.jpg' },
  { id: 'TLJ', img: 'https://img.freepik.com/free-photo/side-view-profile-portrait-middle-aged-man_176420-15344.jpg' },
  { id: 'BVM', img: 'https://img.freepik.com/free-photo/portrait-young-man-with-dark-hair_176420-15581.jpg' },
  { id: 'DI', img: 'https://img.freepik.com/free-photo/portrait-young-gentleman-holding-camera_23-2148213337.jpg' },
  { id: 'OIO', img: 'https://img.freepik.com/free-photo/close-up-young-woman-with-surprised-expression_23-2148859451.jpg' },
  { id: 'XPN', img: 'https://img.freepik.com/free-photo/portrait-smiling-attractive-man_23-2148859450.jpg' },
  { id: 'UYA', img: 'https://img.freepik.com/free-photo/beautiful-woman-portrait_23-2148859455.jpg' },
  { id: 'PBD', img: 'https://img.freepik.com/free-photo/young-man-portrait_23-2148859460.jpg' },
  { id: 'TIN', img: 'https://img.freepik.com/free-photo/portrait-smiling-young-man_23-2148859464.jpg' },
  { id: 'JRS', img: 'https://img.freepik.com/free-photo/portrait-old-man-wearing-hat_23-2148859468.jpg' },
  { id: 'SEV', img: 'https://img.freepik.com/free-photo/portrait-attractive-smiling-man_23-2148859472.jpg' },
  { id: 'KKL', img: 'https://img.freepik.com/free-photo/young-woman-portrait_23-2148859476.jpg' },
  { id: 'MOP', img: 'https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859480.jpg' },
  { id: 'QWE', img: 'https://img.freepik.com/free-photo/beautiful-girl-with-brown-hair_1157-26019.jpg' },
];

const generateRandomWin = () => {
  const user = USER_POOL[Math.floor(Math.random() * USER_POOL.length)];
  return {
    ...user,
    uid: Math.random().toString(36).substring(7).toUpperCase(),
    amount: (Math.random() * 5000 + 100).toFixed(2),
    timestamp: Date.now()
  };
};

function CategoryItem({ icon: Icon, label, color, ring }: { icon: any, label: string, color: string, ring?: boolean }) {
  return (
    <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center space-y-1.5 cursor-pointer group">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all ${ring ? 'ring-2 ring-theme-yellow ring-offset-2' : ''}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}

export default function Home({ onSelectGame }: HomeProps) {
  const [activeWinners, setActiveWinners] = useState(() => Array.from({ length: 8 }, generateRandomWin));
  const [leaderboard, setLeaderboard] = useState(() => {
    return Array.from({ length: 10 }, () => {
      const user = USER_POOL[Math.floor(Math.random() * USER_POOL.length)];
      return {
        ...user,
        amount: Math.floor(Math.random() * 9000000 + 100000)
      };
    }).sort((a, b) => b.amount - a.amount);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update winners list
      setActiveWinners(prev => {
        const nextWin = generateRandomWin() as any;
        return [nextWin, ...prev.slice(0, 9)];
      });

      // Occasionally update leaderboard slightly for feel
      if (Math.random() > 0.7) {
        setLeaderboard(prev => {
          const next = prev.map(item => ({
            ...item,
            amount: item.amount + Math.floor(Math.random() * 5000)
          })).sort((a, b) => b.amount - a.amount);
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const podium = [leaderboard[1], leaderboard[0], leaderboard[2]];
  const listItems = leaderboard.slice(3);


  return (
    <div className="flex flex-col min-h-screen bg-[#f1f2f6] pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100">
        <h1 className="text-2xl font-black italic text-[#f1c40f] tracking-tighter">
          QQ4
        </h1>
        <div className="flex items-center space-x-4 text-gray-400">
          <Download size={22} className="hover:text-theme-yellow transition-colors" />
          <Headphones size={22} className="hover:text-theme-yellow transition-colors" />
        </div>
      </header>

      {/* Hero Banner */}
      <div className="px-4 py-4">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[2/1] bg-gradient-to-br from-red-600 via-red-800 to-black"
        >
          <img 
            src="https://img.freepik.com/free-vector/casino-glittering-banner-with-sparkling-lights_1017-31359.jpg" 
            alt="Promotion"
            className="w-full h-full object-cover mix-blend-overlay opacity-80"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <h2 className="text-white text-4xl font-black italic ml-[-4px]">QQ4</h2>
            <div className="flex items-baseline space-x-2 mt-1">
               <p className="text-theme-yellow text-2xl font-black italic">REFER & EARN</p>
            </div>
            <p className="text-white text-lg font-bold italic tracking-wide">৳100 EACH</p>
            <p className="text-white/60 text-[10px] font-black uppercase mt-1">ON EVERY REFER</p>
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl px-4 py-2 flex items-center shadow-sm border border-gray-100">
          <div className="bg-theme-yellow/10 p-1.5 rounded-lg mr-3 text-theme-yellow">
             <Bell size={16} />
          </div>
          <div className="overflow-hidden whitespace-nowrap text-[11px] font-bold text-gray-500 flex-1">
            <motion.p
              animate={{ x: [400, -1000] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              Welcome to QQ4. Global Trusted & Premium Gaming Platform! Win Big Every Day! ৳৳৳ Highest commission in the market! Invite friend and win huge rewards!
            </motion.p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 px-4 mb-8">
        {CATEGORIES.map(cat => (
          <CategoryItem key={cat.id} icon={cat.icon} label={cat.label} color={cat.color} ring={cat.active} />
        ))}
      </div>

      {/* Lottery Section */}
      <div className="px-4 mb-8">
        <h3 className="flex items-center text-gray-800 font-black border-l-4 border-theme-yellow pl-3 mb-4 uppercase tracking-widest text-sm italic">
          Lottery
        </h3>
        <div className="grid grid-cols-2 gap-4">
           {/* WINGO */}
           <motion.div 
             whileTap={{ scale: 0.98 }}
             onClick={() => onSelectGame('wingo')}
             className="bg-[#2ecc71] rounded-3xl p-6 text-white h-48 relative overflow-hidden shadow-lg shadow-green-500/20 cursor-pointer"
           >
              <Gem className="absolute top-4 right-4 opacity-30" size={32} />
              <div className="space-y-1">
                <h4 className="text-2xl font-black italic tracking-tighter">WINGO</h4>
                <p className="text-[10px] font-bold opacity-80">Play & Win Big</p>
              </div>
              <div className="absolute bottom-6 left-6 flex space-x-2">
                 {[1, 5, 0].map((n, i) => (
                   <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border border-white/20 shadow-sm ${
                     n === 0 ? 'bg-purple-500' : n % 2 === 0 ? 'bg-red-500' : 'bg-emerald-600'
                   }`}>
                      {n}
                   </div>
                 ))}
              </div>
           </motion.div>

           {/* K3 LOTTERY */}
           <motion.div 
             whileTap={{ scale: 0.98 }}
             className="bg-[#3498db] rounded-3xl p-6 text-white h-48 relative overflow-hidden shadow-lg shadow-blue-500/20 opacity-90"
           >
              <Dice5 className="absolute top-4 right-4 opacity-30" size={32} />
              <div className="space-y-1">
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">K3 Lottery</h4>
                 <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Dice Game</p>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Winning Information */}
      <div className="px-4 mb-8">
        <h3 className="flex items-center text-gray-800 font-black border-l-4 border-theme-yellow pl-3 mb-4 uppercase tracking-widest text-sm italic text-left">
          Winning Information
        </h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 min-h-[320px]">
           <AnimatePresence mode="popLayout">
             {activeWinners.slice(0, 5).map((winner: any, i) => (
               <motion.div 
                 key={winner.uid}
                 layout
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 transition={{ duration: 0.5 }}
                 className="flex items-center justify-between p-4 border-b last:border-0 border-gray-50 bg-white"
               >
                  <div className="flex items-center space-x-3 text-left">
                     <img src={winner.img} className="w-10 h-10 rounded-xl object-cover" />
                     <div>
                        <p className="text-xs font-black text-gray-400">User</p>
                        <p className="text-[10px] font-bold text-gray-600">Mem***{winner.uid}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400">Winning amount</p>
                     <p className="text-sm font-black text-win">৳{Number(winner.amount).toLocaleString()}</p>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Leaderboard Chart */}
      <div className="px-4 mb-10 pb-12">
        <h3 className="flex items-center text-gray-800 font-black border-l-4 border-theme-yellow pl-3 mb-4 uppercase tracking-widest text-sm italic text-left">
          Today's earnings chart
        </h3>
        
        {/* Podium */}
        <div className="flex items-end justify-center space-x-2 mb-8 mt-12 px-2">
           {podium.map((item, idx) => {
             const rankOrder = [2, 1, 3];
             const rank = rankOrder[idx];
             return (
               <div key={item.id + rank} className={rank === 1 ? 'z-10' : ''}>
                 <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden">
                         <img src={item.img} className="w-full h-full object-cover" />
                      </div>
                      {rank === 1 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                           <span className="text-yellow-500 text-xl">👑</span>
                        </div>
                      )}
                    </div>
                    <div className={`
                      ${rank === 1 ? 'bg-gradient-to-b from-[#ff7675] to-[#d63031] h-32 w-28' : 
                        rank === 2 ? 'bg-gradient-to-b from-[#74b9ff] to-[#0984e3] h-24 w-24' : 
                        'bg-gradient-to-b from-[#fab1a0] to-[#e17055] h-20 w-24'}
                      rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-lg relative
                    `}>
                       <div className="absolute -top-3 bg-theme-yellow px-4 py-0.5 rounded-full shadow-md">
                          <span className="text-[10px] font-black text-gray-800 italic">NO{rank}</span>
                       </div>
                       <span className="text-[10px] font-black text-white/80 mt-2">Mem***{item.id}</span>
                       <span className="text-[10px] font-black text-white mt-1 leading-none">৳{item.amount.toLocaleString()}</span>
                    </div>
                 </div>
               </div>
             );
           })}
        </div>

        {/* List 4-10 */}
        <div className="space-y-2">
           {listItems.map((item, i) => (
             <div key={item.id + i} className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border border-gray-50">
                <div className="flex items-center space-x-3 text-left">
                   <span className="w-6 text-center text-lg font-black text-gray-300 italic">{i + 4}</span>
                   <img src={item.img} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" />
                   <span className="text-xs font-black text-gray-600 uppercase tracking-widest italic">Mem***{item.id}</span>
                </div>
                <div className="bg-win/10 px-4 py-1.5 rounded-full border border-win/20">
                   <span className="text-[11px] font-black text-win italic">৳{item.amount.toLocaleString()}</span>
                </div>
             </div>
           ))}
        </div>
      </div>


      {/* Floating Support Button */}
      <button className="fixed bottom-24 right-4 w-12 h-12 bg-theme-yellow rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-95 transition-all z-50">
        <Headphones size={24} className="stroke-[2.5]" />
      </button>
    </div>
  );
}
