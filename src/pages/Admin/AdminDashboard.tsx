import { 
  Users, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpToLine, 
  Gift, 
  Settings,
  ShieldCheck,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDocs, where, limit, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

type AdminTab = 'users' | 'deposits' | 'withdrawals' | 'gifts';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('deposits');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-10 text-left font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-all">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex-1 flex items-center justify-center space-x-2">
           <ShieldCheck size={20} className="text-[#f1c40f]" strokeWidth={3} />
           <h2 className="font-black text-gray-800 tracking-wider uppercase text-sm">ADMIN PANEL</h2>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Stats Summary */}
      <div className="p-4 grid grid-cols-2 gap-3">
         <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-start space-x-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
               <TrendingUp size={20} />
            </div>
            <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Revenue</p>
               <p className="text-sm font-black text-gray-800 tracking-tight">৳ 12,450.00</p>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-start space-x-3">
            <div className="w-10 h-10 bg-[#f1c40f]/10 text-[#f1c40f] rounded-2xl flex items-center justify-center">
               <Users size={20} />
            </div>
            <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Users</p>
               <p className="text-sm font-black text-gray-800 tracking-tight">342</p>
            </div>
         </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
         <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex items-center px-5 py-3.5 space-x-3 focus-within:border-[#f1c40f] transition-all">
            <Search size={18} className="text-gray-300" />
            <input 
              type="text" 
              placeholder="Search user ID or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-gray-800 placeholder:text-gray-300"
            />
         </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
         <div className="bg-white/50 p-1 rounded-2xl flex border border-gray-100">
            {(['deposits', 'withdrawals', 'users', 'gifts'] as AdminTab[]).map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab 
                     ? 'bg-white text-[#f1c40f] shadow-sm' 
                     : 'text-gray-400 hover:text-gray-600'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>
      </div>

      <div className="flex-1 px-4 space-y-4">
          {activeTab === 'deposits' && <TransactionList type="deposit" searchQuery={searchQuery} />}
          {activeTab === 'withdrawals' && <TransactionList type="withdraw" searchQuery={searchQuery} />}
          {activeTab === 'users' && <UsersList searchQuery={searchQuery} />}
          {activeTab === 'gifts' && <GiftsManage />}
      </div>
    </div>
  );
}

function TransactionList({ type, searchQuery }: { type: 'deposit' | 'withdraw', searchQuery: string }) {
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('type', '==', type),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      setTxns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [type]);

  const handleAction = async (id: string, status: 'success' | 'rejected', amount: number, userId: string) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status });
      if (status === 'success' && type === 'deposit') {
         await updateDoc(doc(db, 'users', userId), {
            wallet: increment(amount),
            hasDeposited: true
         });
      }
      toast.success(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} ${status}`);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filtered = txns.filter(t => 
    t.txId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.number?.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
       {filtered.map(t => (
         <div key={t.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
               <div className="text-left">
                  <p className="text-sm font-black text-gray-800">৳{t.amount.toFixed(2)}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{t.method} {type === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL'}</p>
               </div>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                 t.status === 'pending' ? 'bg-amber-50 text-amber-500' : t.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
               }`}>
                 {t.status}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 text-left">
               <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{type === 'deposit' ? 'TrxID' : 'Ac/Number'}</p>
                  <p className="text-[10px] font-bold text-gray-500 font-mono">{type === 'deposit' ? t.txId : t.number}</p>
               </div>
               <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Time</p>
                  <p className="text-[10px] font-bold text-gray-500 truncate">{t.timestamp?.toDate().toLocaleString()}</p>
               </div>
            </div>

            <p className="text-[8px] font-mono text-gray-200 text-left">UID: {t.userId}</p>
            
            {t.status === 'pending' && (
              <div className="flex space-x-2 pt-1">
                 <button 
                  onClick={() => handleAction(t.id, 'rejected', t.amount, t.userId)}
                  className="flex-1 py-3 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                 >
                    Reject
                 </button>
                 <button 
                  onClick={() => handleAction(t.id, 'success', t.amount, t.userId)}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                 >
                    Approve
                 </button>
              </div>
            )}
         </div>
       ))}
       {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center opacity-30 grayscale">
             <Clock size={40} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">No {type}s found.</p>
          </div>
       )}
    </div>
  );
}


function UsersList({ searchQuery }: { searchQuery: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    }, (error) => {
      // Fallback if createdAt doesn't exist yet on all docs
      const qFallback = query(collection(db, 'users'), limit(100));
      onSnapshot(qFallback, (snap) => {
        setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      });
    });
  }, []);

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        wallet: increment(parseFloat(adjustAmount))
      });
      toast.success('Balance adjusted!');
      setSelectedUser(null);
      setAdjustAmount('');
    } catch (err) {
      toast.error('Failed to adjust');
    }
  };

  const filtered = users.filter((u) => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile?.includes(searchQuery) ||
    u.userNumericId?.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {filtered.map((u) => (
        <div key={u.uid} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                 <img src={u.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="text-left leading-tight">
                 <p className="text-sm font-black text-gray-800">{u.displayName}</p>
                 <div className="flex flex-col space-y-0.5 mt-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {u.userNumericId}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Bal: ৳{u.wallet.toFixed(2)}</p>
                 </div>
              </div>
           </div>
           <button 
            onClick={() => setSelectedUser(u)}
            className="p-3 bg-gray-50 text-gray-400 hover:text-[#f1c40f] hover:bg-[#f1c40f]/10 rounded-2xl active:scale-95 transition-all"
           >
              <Settings size={18} />
           </button>
        </div>
      ))}
      {filtered.length === 0 && <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">No users found</div>}

      <AnimatePresence>
         {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedUser(null)}
                 className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-white w-full max-w-sm rounded-[32px] p-8 relative z-10 text-center"
               >
                  <h3 className="text-lg font-black text-gray-800 mb-2 uppercase tracking-widest">Edit User</h3>
                  <p className="text-[10px] font-bold text-gray-400 mb-6 font-mono">UID: {selectedUser.uid}</p>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-left mb-1.5 ml-1">Adjust Wallet</label>
                        <div className="relative">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f1c40f] font-black">৳</div>
                           <input 
                             type="number"
                             placeholder="Amount (e.g. 500 or -500)"
                             value={adjustAmount}
                             onChange={(e) => setAdjustAmount(e.target.value)}
                             className="w-full py-4 pl-10 pr-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#f1c40f] font-bold text-gray-800"
                           />
                        </div>
                     </div>
                     
                     <div className="flex space-x-3 pt-2">
                        <button onClick={() => setSelectedUser(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                        <button onClick={handleAdjustBalance} className="flex-1 py-4 bg-[#f1c40f] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-[#f1c40f]/20">Apply Changes</button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function GiftsManage() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxClaims, setMaxClaims] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
       result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerate = async () => {
    if (!amount || !maxClaims) {
       toast.error('Please enter amount and claims');
       return;
    }
    
    setIsGenerating(true);
    const newCode = generateRandomCode();
    
    try {
      const codeRef = doc(db, 'gift_codes', newCode);
      await setDoc(codeRef, {
         code: newCode,
         status: 'active',
         amount: parseFloat(amount),
         maxClaims: parseInt(maxClaims),
         currentClaims: 0,
         createdAt: serverTimestamp()
      });
      
      setGeneratedCode(newCode);
      toast.success('Gift Code Generated!');
      setAmount('');
      setMaxClaims('');
    } catch (err) {
      toast.error('Failed to create code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col items-center">
       <div className="w-16 h-16 bg-[#f1c40f]/10 rounded-[28px] flex items-center justify-center text-[#f1c40f] mb-6">
          <Gift size={32} strokeWidth={2.5} />
       </div>
       <h3 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em] mb-10">MANAGE GIFT CODES</h3>
       
       <div className="w-full space-y-4">
          {generatedCode && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast.success('Code copied!');
               }}
               className="w-full bg-emerald-50 border border-emerald-100 p-6 rounded-3xl mb-6 text-center cursor-pointer active:scale-95 transition-all"
             >
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 font-sans">Latest Generated Code (Tap to Copy)</p>
                <div className="flex items-center justify-center space-x-3">
                   <p className="text-2xl font-black text-emerald-700 tracking-wider font-mono">{generatedCode}</p>
                   <div className="p-2 bg-emerald-500 text-white rounded-xl">
                      <Copy size={16} />
                   </div>
                </div>
             </motion.div>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col space-y-1">
             <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Bonus Amount</span>
             <input 
               type="number" 
               placeholder="e.g. 500" 
               value={amount} onChange={(e) => setAmount(e.target.value)}
               className="bg-transparent border-none outline-none font-bold text-gray-800 px-1"
             />
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col space-y-1">
             <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Total Users (Max Claims)</span>
             <input 
               type="number" 
               placeholder="e.g. 100" 
               value={maxClaims} onChange={(e) => setMaxClaims(e.target.value)}
               className="bg-transparent border-none outline-none font-bold text-gray-800 px-1"
             />
          </div>
          
          <button 
            disabled={isGenerating}
            className="w-full py-5 mt-4 bg-[#f1c40f] text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all shadow-xl shadow-[#f1c40f]/20 disabled:opacity-50"
            onClick={handleGenerate}
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE GIFT CODE'}
          </button>
       </div>
    </div>
  );
}
