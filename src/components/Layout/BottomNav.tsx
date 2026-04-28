import { Home, Store, Gem, Wallet, User2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'lottery', label: 'Lottery', icon: Home },
    { id: 'mines', label: 'Mines', icon: Bomb },
    { id: 'promotion', label: 'Promotion', icon: Gem },
    { id: 'account', label: 'Profile', icon: User2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isPromotion = tab.id === 'promotion';
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 w-full relative h-full",
              isPromotion ? "-mt-10" : ""
            )}
          >
            {isPromotion ? (
              <div className="flex flex-col items-center">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all border-4 border-white",
                    isActive ? "bg-[#f1c40f] text-white" : "bg-gradient-to-br from-[#f1c40f] to-[#f39c12] text-white" 
                  )}
                >
                  <Icon size={28} strokeWidth={2.5} className="fill-white/20" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-bold mt-1",
                  isActive ? "text-[#f1c40f]" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
              </div>
            ) : (
              <>
                <div className={cn(
                  "transition-all",
                  isActive ? "text-[#f1c40f]" : "text-gray-400"
                )}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold mt-0.5",
                  isActive ? "text-[#f1c40f]" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
