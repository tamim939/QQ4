import { Gem, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#f1c40f] z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* Center Content */}
      <div className="relative flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8 
          }}
          className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-8"
        >
          <Gem size={56} className="text-[#f1c40f] fill-[#f1c40f]/20" />
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4, duration: 0.6 }}
           className="text-center"
        >
          <h1 className="text-5xl font-black italic text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
            QQ4
          </h1>
          <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mt-3">
            Premium Gaming
          </p>
        </motion.div>
      </div>

      {/* Modern Spinner at Bottom */}
      <div className="absolute bottom-24 flex flex-col items-center">
        <div className="relative w-12 h-12">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 bg-white rounded-full"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-5px',
                marginTop: '-5px',
                transform: `rotate(${i * 45}deg) translateY(-18px)`
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.125
              }}
            />
          ))}
        </div>
      </div>

      {/* Help Icon at Bottom Right like the image */}
      <div className="absolute bottom-10 right-10 opacity-60">
        <Headphones className="text-white" size={28} />
      </div>
    </div>
  );
}
