import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Gift, 
  History,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction, 
  doc, 
  orderBy,
  limit,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/utils';
import toast from 'react-hot-toast';

interface GiftClaim {
  id: string;
  code: string;
  amount: number;
  timestamp: any;
}

export default function Gifts({ onBack }: { onBack: () => void }) {
  const { user, userData } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<GiftClaim[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchHistory = async () => {
      try {
        // Since we store claims in a nested path, we might want a flat collection for easy history retrieval
        // Or we can search through all gift_codes/claims where userId matches if we have a group query
        // For simplicity in this demo environment, let's look at user's personal 'gift_claims' collection
        const q = query(
          collection(db, `users/${user.uid}/gift_claims`),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GiftClaim[];
        setClaims(historyData);
      } catch (err) {
        console.error("Error fetching gift history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleReceive = async () => {
    if (!code.trim() || !user || !userData) return;
    
    setLoading(true);
    try {
      // 1. Find the code
      const codesRef = collection(db, 'gift_codes');
      const q = query(codesRef, where('code', '==', code.trim()), where('status', '==', 'active'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error('Invalid or expired gift code');
        setLoading(false);
        return;
      }

      const codeDoc = snapshot.docs[0];
      const codeData = codeDoc.data();
      const codeId = codeDoc.id;

      // 2. Run transaction to claim
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const claimRef = doc(db, `gift_codes/${codeId}/claims`, user.uid);
        const historyRef = doc(collection(db, `users/${user.uid}/gift_claims`));
        
        const claimSnap = await transaction.get(claimRef);
        if (claimSnap.exists()) {
          throw new Error('You have already claimed this gift code');
        }

        const freshCodeSnap = await transaction.get(codeDoc.ref);
        const freshCodeData = freshCodeSnap.data();
        
        if (!freshCodeData || freshCodeData.currentClaims >= freshCodeData.maxClaims) {
          throw new Error('This gift code has reached its maximum claims');
        }

        // Update code claims count
        transaction.update(codeDoc.ref, {
          currentClaims: (freshCodeData.currentClaims || 0) + 1
        });

        // Update user balance
        transaction.update(userRef, {
          wallet: (userData.wallet || 0) + (freshCodeData.amount || 0)
        });

        // Record claim for this code
        transaction.set(claimRef, {
          userId: user.uid,
          timestamp: serverTimestamp()
        });

        // Add to user's history
        transaction.set(historyRef, {
          code: code.trim(),
          amount: freshCodeData.amount,
          timestamp: serverTimestamp()
        });
      });

      toast.success(`Successfully claimed ৳${codeData.amount}!`);
      setCode('');
      
      // Refresh history
      const newClaim: GiftClaim = {
        id: Math.random().toString(),
        code: code.trim(),
        amount: codeData.amount,
        timestamp: { toDate: () => new Date() } // Local optimistic update
      };
      setClaims(prev => [newClaim, ...prev]);

    } catch (err: any) {
      toast.error(err.message || 'Failed to claim gift code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f2f6] flex flex-col font-sans text-left">
      {/* Navbar */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-20">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-600 active:scale-95 transition-all">
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <h1 className="flex-1 text-center text-lg font-black text-gray-800 uppercase tracking-tight mr-7">Gifts</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Banner Section */}
        <div className="p-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] overflow-hidden shadow-xl shadow-pink-500/10 relative"
          >
            <img 
              src="https://img.freepik.com/free-photo/top-view-pink-gift-box-with-ribbon_23-2148404558.jpg" 
              alt="Gifts Banner"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent" />
          </motion.div>
        </div>

        {/* Redemption Card */}
        <div className="px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-gray-50">
            <div className="text-center space-y-2 mb-8">
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Enter the redemption code to receive gift rewards</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Insert Gift Code"
                  className="w-full h-16 px-6 bg-gray-50 border-2 border-gray-50 rounded-2xl text-lg font-black text-gray-700 placeholder:text-gray-300 outline-none focus:border-[#f1c40f] focus:bg-white transition-all text-center tracking-widest uppercase"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <p className="text-[9px] font-black text-[#f1c40f] uppercase tracking-widest">Type exactly as given</p>
                </div>
              </div>

              <button 
                disabled={loading || !code.trim()}
                onClick={handleReceive}
                className="w-full h-16 bg-[#f1c40f] rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-[#f1c40f]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-white" />
                ) : (
                  <span className="text-white text-lg font-black uppercase tracking-tight">Receive</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="p-4 pt-10">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 min-h-[300px]">
             <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gray-100 p-1.5 rounded-lg">
                   <History size={16} className="text-gray-400" />
                </div>
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">History</h3>
             </div>

             <div className="space-y-3">
                {loadingHistory ? (
                   <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                      <div className="w-10 h-10 bg-gray-100 rounded-full mb-3" />
                      <div className="h-2 w-24 bg-gray-100 rounded" />
                   </div>
                ) : claims.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                         <Gift size={32} className="text-gray-200" />
                      </div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No gifts claimed.</p>
                   </div>
                ) : (
                  claims.map((claim) => (
                    <motion.div 
                      key={claim.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                         <div className="bg-emerald-500/10 p-2 rounded-xl">
                            <Gift size={20} className="text-emerald-500" />
                         </div>
                         <div className="text-left">
                            <p className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{claim.code}</p>
                            <p className="text-[9px] font-bold text-gray-400">
                               {claim.timestamp?.toDate ? claim.timestamp.toDate().toLocaleString() : 'Just now'}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[15px] font-black text-emerald-500">+৳{claim.amount.toFixed(2)}</p>
                         <div className="flex items-center justify-end space-x-1">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-tighter">Success</span>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
