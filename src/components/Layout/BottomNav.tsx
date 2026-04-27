import { Home, LayoutGrid, Gem, Wallet, User2 } from 'lucide-react';
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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: LayoutGrid },
    { id: 'promotion', label: 'Promotion', icon: Gem },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'account', label: 'Account', icon: User2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
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
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all border-4 border-[#f1f2f6]",
                    isActive ? "bg-[#f1c40f] text-white" : "bg-[#f1c40f] text-white" 
                  )}
                >
                  <Icon size={28} strokeWidth={2.5} className="fill-white/20" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-black mt-1 uppercase tracking-tight italic",
                  isActive ? "text-[#f1c40f]" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
              </div>
            ) : (
              <>
                <div className={cn(
                  "transition-all",
                  isActive ? "text-[#f1c40f] scale-110" : "text-gray-400 opacity-60"
                )}>
                  <Icon size={22} strokeWidth={isActive ? 3 : 2.5} className={isActive ? "fill-[#f1c40f]/10" : ""} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-tight italic mt-0.5",
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
