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

      {/* Content */}
      <div className="flex-1 px-4 space-y-4">
         {activeTab === 'deposits' && <DepositsList searchQuery={searchQuery} />}
         {activeTab === 'withdrawals' && <WithdrawalsList searchQuery={searchQuery} />}
         {activeTab === 'users' && <UsersList searchQuery={searchQuery} />}
         {activeTab === 'gifts' && <GiftsManage />}
      </div>
    </div>
  );
}

function DepositsList({ searchQuery }: { searchQuery: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('type', '==', 'deposit'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAction = async (id: string, status: 'success' | 'rejected', amount: number, userId: string) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status });
      if (status === 'success') {
         await updateDoc(doc(db, 'users', userId), {
            wallet: increment(amount),
            hasDeposited: true
         });
      }
      toast.success(`Deposit ${status}`);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filtered = data.filter(d => 
    d.txId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filtered.map((item) => (
        <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-sm font-black text-gray-800">৳ {item.amount.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.method} Deposit</p>
             </div>
             <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                item.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                item.status === 'success' ? 'bg-emerald-50 text-emerald-500' :
                'bg-rose-50 text-rose-500'
             }`}>
                {item.status}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
             <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">TrxID</p>
                <p className="text-[11px] font-bold text-gray-600 font-mono">{item.txId}</p>
             </div>
             <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">User UID</p>
                <p className="text-[11px] font-bold text-gray-600 truncate">{item.userId}</p>
             </div>
          </div>

          {item.status === 'pending' && (
             <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => handleAction(item.id, 'rejected', item.amount, item.userId)}
                  className="flex-1 py-3.5 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'success', item.amount, item.userId)}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Approve
                </button>
             </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <div className="py-20 text-center text-gray-300 font-bold">No pending deposits</div>}
    </div>
  );
}

function WithdrawalsList({ searchQuery }: { searchQuery: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('type', '==', 'withdraw'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAction = async (id: string, status: 'success' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status });
      toast.success(`Withdrawal ${status}`);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filtered = data.filter(d => 
    d.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filtered.map((item) => (
        <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-sm font-black text-gray-800">৳ {item.amount.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.method} Withdrawal</p>
             </div>
             <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                item.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                item.status === 'success' ? 'bg-emerald-50 text-emerald-500' :
                'bg-rose-50 text-rose-500'
             }`}>
                {item.status}
             </span>
          </div>

          <div className="py-3 border-y border-gray-50">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Account Number</p>
             <p className="text-[11px] font-bold text-gray-600 font-mono">{item.number}</p>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2 mb-0.5">User UID</p>
             <p className="text-[11px] font-bold text-gray-600 truncate">{item.userId}</p>
          </div>

          {item.status === 'pending' && (
             <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => handleAction(item.id, 'rejected')}
                  className="flex-1 py-3.5 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'success')}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Approve
                </button>
             </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <div className="py-20 text-center text-gray-300 font-bold">No pending withdrawals</div>}
    </div>
  );
}

function UsersList({ searchQuery }: { searchQuery: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(20));
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
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

  return (
    <div className="space-y-4">
      {users.map((u) => (
        <div key={u.uid} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                 <img src={u.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="text-left leading-tight">
                 <p className="text-sm font-black text-gray-800">{u.displayName}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bal: ৳{u.wallet.toFixed(2)}</p>
              </div>
           </div>
           <button 
            onClick={() => setSelectedUser(u)}
            className="p-3 bg-[#f1c40f]/10 text-[#f1c40f] rounded-2xl active:scale-95 transition-all"
           >
              <Settings size={18} />
           </button>
        </div>
      ))}

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
                  <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Adjust Balance</h3>
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-gray-400">Updating for: <span className="text-gray-800">{selectedUser.displayName}</span></p>
                     <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f1c40f] font-black">৳</div>
                        <input 
                          type="number"
                          placeholder="Amount (use - for negative)"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-full py-4 pl-10 pr-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#f1c40f]"
                        />
                     </div>
                     <div className="flex space-x-3">
                        <button onClick={() => setSelectedUser(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Close</button>
                        <button onClick={handleAdjustBalance} className="flex-1 py-4 bg-[#f1c40f] text-white rounded-2xl font-black uppercase text-[10px]">Update</button>
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
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxClaims, setMaxClaims] = useState('');

  const generateCode = async () => {
    if (!code || !amount || !maxClaims) return;
    try {
      const codeRef = doc(db, 'gift_codes', code.toUpperCase());
      await setDoc(codeRef, {
         code: code.toUpperCase(),
         amount: parseFloat(amount),
         maxClaims: parseInt(maxClaims),
         currentClaims: 0,
         createdAt: serverTimestamp()
      });
      toast.success('Code Generated!');
      setCode('');
      setAmount('');
      setMaxClaims('');
    } catch (err) {
      toast.error('Failed to create code');
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
       <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-center">Manage Gift Codes</h3>
       <div className="space-y-4">
          <input 
            type="text" 
            placeholder="CODE (e.g. MK25WIN)" 
            value={code} onChange={(e) => setCode(e.target.value)}
            className="w-full py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100 outline-none uppercase font-bold"
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
          />
          <input 
            type="number" 
            placeholder="Max Claims" 
            value={maxClaims} onChange={(e) => setMaxClaims(e.target.value)}
            className="w-full py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
          />
          <button 
            className="w-full py-4 bg-[#f1c40f] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-[#f1c40f]/20"
            onClick={generateCode}
          >
            Create Gift Code
          </button>
       </div>
    </div>
  );
}
