import { 
  ChevronLeft,
  History,
  Gift
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Gifts({ onBack }: { onBack: () => void }) {
  const { user, userData } = useAuth();
  const [giftCode, setGiftCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'gift_claims'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRedeem = async () => {
    if (!giftCode.trim()) {
      toast.error('Please enter gift code');
      return;
    }

    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Check if the code exists
      const codeRef = doc(db, 'gift_codes', giftCode.trim());
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        toast.error('Invalid gift code');
        return;
      }

      const codeData = codeSnap.data();

      // 2. Check if code is expired or used up
      if (codeData.status !== 'active') {
        toast.error('This code is no longer active');
        return;
      }

      // 3. Check if user already claimed this code
      const { getDocs } = await import('firebase/firestore');
      const claimsSnap = await getDocs(query(
        collection(db, 'gift_claims'),
        where('userId', '==', user.uid),
        where('code', '==', giftCode.trim())
      ));
      
      if (!claimsSnap.empty) {
        toast.error('You have already claimed this code');
        return;
      }
      
      // 4. Check code usage limit if applicable
      if (codeData.maxClaims && codeData.currentClaims >= codeData.maxClaims) {
        toast.error('This code has reached its maximum limit');
        return;
      }
      
      // Proceed with claim
      await addDoc(collection(db, 'gift_claims'), {
        userId: user.uid,
        code: giftCode.trim(),
        amount: codeData.amount || 0,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        wallet: increment(codeData.amount || 0)
      });

      // Update code claim count
      await updateDoc(codeRef, {
        currentClaims: increment(1)
      });

      toast.success(`Bonus of ৳${codeData.amount} added!`);
      setGiftCode('');
    } catch (error) {
      toast.error('Redemption failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-all">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="flex-1 text-center font-black text-gray-800 pr-8">Gifts</h2>
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Banner Image */}
        <div className="px-4 py-6">
          <div className="rounded-3xl overflow-hidden shadow-lg shadow-black/5">
             <img 
               src="https://i.postimg.cc/52rsJjst/photo-1549465220-1a8b9238cd48.jpg" 
               alt="Gifts Banner" 
               className="w-full h-auto object-cover h-[180px]"
             />
          </div>
        </div>

        {/* Redemption Input Box */}
        <div className="px-4">
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
              <p className="text-[11px] font-bold text-gray-400 text-center px-4">
                Enter the redemption code to receive gift rewards
              </p>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Please enter gift code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-bold text-gray-700 outline-none focus:border-[#f1c40f] transition-all placeholder:text-gray-300"
                />
              </div>

              <button 
                onClick={handleRedeem}
                disabled={isSubmitting}
                className="w-full bg-[#f1c40f] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#f1c40f]/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Receive'}
              </button>
           </div>
        </div>

        {/* History Section */}
        <div className="px-4 mt-8">
           <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center space-x-2">
                 <History size={16} className="text-gray-400" />
                 <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">History</span>
              </div>
              
              <div className="p-10 text-center">
                 {history.length === 0 ? (
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">NO GIFTS CLAIMED.</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      {history.map((claim: any) => (
                        <div key={claim.id} className="flex justify-between items-center text-left">
                           <div>
                              <p className="text-xs font-black text-gray-800">{claim.code}</p>
                              <p className="text-[9px] font-bold text-gray-400">
                                {claim.timestamp?.toDate().toLocaleString()}
                              </p>
                           </div>
                           <span className="text-[#f1c40f] font-black">+৳{claim.amount}</span>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
