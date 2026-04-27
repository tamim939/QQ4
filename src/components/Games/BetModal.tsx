import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bet: { type: string; value: string; amount: number; multiplier: number }) => void;
  selection: { type: string; value: string; color: string };
  balance: number;
}

export default function BetModal({ isOpen, onClose, onConfirm, selection, balance }: BetModalProps) {
  const [amount, setAmount] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const amounts = [1, 10, 100, 1000];
  const multipliers = [1, 5, 10, 20, 50, 100];

  const total = amount * multiplier * quantity;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px]">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-md rounded-t-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className={`p-6 text-white ${selection.color} relative`}>
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold">Win Go</h3>
            <div className="mt-2 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-medium">
              Bet on: <span className="font-bold">{selection.value}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount Selection */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-500">Amount</p>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      amount === a ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-gray-500">Quantity</p>
               <div className="flex items-center space-x-4">
                 <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-400 hover:border-theme-red hover:text-theme-red transition-colors"
                 >
                   -
                 </button>
                 <span className="text-lg font-black w-8 text-center">{quantity}</span>
                 <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-400 hover:border-theme-red hover:text-theme-red transition-colors"
                 >
                   +
                 </button>
               </div>
            </div>

            {/* Multiplier Selection */}
            <div className="space-y-2 overflow-x-auto no-scrollbar">
              <div className="flex space-x-2 min-w-max pb-2">
                {multipliers.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                      multiplier === m ? 'border-theme-red bg-theme-red/5 text-theme-red' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="flex items-center space-x-3 pb-2 text-xs text-gray-500">
               <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-theme-red focus:ring-theme-red" />
               <p>I agree to the <span className="text-theme-red font-bold underline">Pre-sale Rules</span></p>
            </div>

            {/* Footer */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm({ type: selection.type, value: selection.value, amount, multiplier: multiplier * quantity })}
                disabled={total > balance}
                className={`flex-2 py-4 font-black rounded-2xl shadow-lg active:scale-95 transition-all ${
                  total > balance 
                  ? 'bg-gray-300 text-gray-100 cursor-not-allowed shadow-none' 
                  : `text-white shadow-theme-red/30 ${selection.color.replace('text-', 'bg-') || 'bg-theme-red'}`
                }`}
              >
                Total ৳{total.toFixed(2)}
              </button>
            </div>
            
            {total > balance && (
              <p className="text-center text-[10px] text-theme-red font-bold">Insufficient balance!</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
