import { 
  Download,
  Headphones,
  History,
  Check,
  ChevronRight,
  X,
  Copy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import toast from 'react-hot-toast';

type ViewState = 'wallet' | 'payment' | 'history';

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  account: string;
  txId: string;
  status: 'pending' | 'success' | 'rejected';
  timestamp: any;
}

export default function WalletPage() {
  const { userData, user } = useAuth();
  const [view, setView] = useState<ViewState>('wallet');
  const [selectedMethod, setSelectedMethod] = useState<'nagad' | 'bkash'>('bkash');
  const [selectedChannel, setSelectedChannel] = useState('CashPay-bKash');
  const [amount, setAmount] = useState('300');
  const [txnId, setTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      // Sort client side to avoid index requirement
      txs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setTransactions(txs);
    }, (error) => {
      console.error('Firestore Error:', error);
      // Don't throw here to avoid crashing the component
    });

    return () => unsubscribe();
  }, [user]);

  // removed the early return for !userData
  const walletBalance = userData?.wallet || 0;

  const methods = [
    { id: 'nagad', name: 'Nagad', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1024px-Nagad_Logo.svg.png', number: '01328848417' },
    { id: 'bkash', name: 'bKash', icon: 'https://seeklogo.com/images/B/bkash-logo-835789094A-seeklogo.com.png', number: '01328848417' }
  ];

  const channels = [
    'CashPay-bKash', 'GoPay-bKash', 'RolezPay-bKash', 'Lucky-bKash'
  ];

  const amounts = ['300', '500', '1K', '2K', '10K', '25K'];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDepositSubmit = async () => {
    if (!txnId.trim()) {
      toast.error('Please enter Transaction ID');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user?.uid,
        type: 'deposit',
        amount: parseFloat(amount),
        method: selectedMethod,
        account: methods.find(m => m.id === selectedMethod)?.number || '',
        txId: txnId,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      toast.success('Deposit submitted successfully');
      setView('wallet');
      setTxnId('');
    } catch (error) {
      toast.error('Failed to submit deposit');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const WalletView = () => (
    <div className="pb-28">
      {/* Page Title */}
      <div className="bg-white py-4 text-center">
         <h2 className="text-lg font-bold text-gray-800 tracking-tight">Wallet</h2>
      </div>

      {/* Balance Card Section */}
      <div className="px-4 py-2">
        <div className="bg-[#f1c40f] rounded-[30px] p-8 text-white text-center shadow-lg shadow-[#f1c40f]/20">
          <p className="text-[10px] font-medium opacity-90 mb-2">Total balance</p>
          <p className="text-4xl font-black mb-10 tracking-tight">৳ {walletBalance.toFixed(2)}</p>
          
          <div className="flex space-x-4">
            <button className="flex-1 bg-white text-[#f1c40f] py-3 rounded-xl text-sm font-black shadow-md">
              Deposit
            </button>
            <button className="flex-1 bg-white/30 text-white py-3 rounded-xl text-sm font-black">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Methods Section */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-[#f1c40f] rounded-full" />
            <h3 className="text-sm font-black text-gray-800">Deposit Methods</h3>
          </div>
          <button 
            onClick={() => setView('history')}
            className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold"
          >
            <History size={14} />
            <span>History</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {methods.map((m) => (
            <div 
              key={m.id}
              onClick={() => setSelectedMethod(m.id as any)}
              className={`p-4 bg-white rounded-2xl flex flex-col items-center space-y-2 border-2 transition-all relative ${
                selectedMethod === m.id ? 'border-[#f1c40f]' : 'border-gray-100'
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center p-2">
                <img src={m.icon} alt={m.name} className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-xs font-bold text-gray-700">{m.name}</p>
              {selectedMethod === m.id && (
                <div className="absolute top-2 right-2 text-[#f1c40f]">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Select Channel Section */}
      <div className="px-4 mt-8">
        <p className="text-xs font-bold text-gray-500 mb-4">Select Channel</p>
        <div className="grid grid-cols-2 gap-3">
          {channels.map((c) => (
            <button 
              key={c}
              onClick={() => setSelectedChannel(c)}
              className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                selectedChannel === c 
                  ? 'bg-[#f1c40f]/5 border-[#f1c40f] text-[#f1c40f]' 
                  : 'bg-gray-50 border-gray-100 text-gray-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Deposit Amount Section */}
      <div className="px-4 mt-8">
        <p className="text-xs font-bold text-gray-500 mb-4">Deposit Amount</p>
        <div className="grid grid-cols-3 gap-3">
          {amounts.map((a) => {
             const actualVal = a.includes('K') ? parseInt(a.replace('K', '')) * 1000 : parseInt(a);
             return (
               <button 
                 key={a}
                 onClick={() => setAmount(actualVal.toString())}
                 className={`py-4 rounded-xl text-xs font-bold border transition-all ${
                   amount === actualVal.toString()
                     ? 'bg-[#f1c40f]/5 border-[#f1c40f] text-[#f1c40f]' 
                     : 'bg-gray-50 border-gray-100 text-gray-400'
                 }`}
               >
                 ৳ {a}
               </button>
             );
          })}
        </div>

        {/* Custom Input */}
        <div className="mt-4 relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-[#f1c40f]">৳</div>
          <input 
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-12 text-lg font-black text-gray-800 outline-none focus:border-[#f1c40f] transition-all"
          />
          <button 
            onClick={() => setAmount('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-white"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="px-4 mt-10">
        <button 
          onClick={() => setView('payment')}
          className="w-full bg-[#f1c40f] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#f1c40f]/20 active:scale-95 transition-all"
        >
          Deposit
        </button>
      </div>
    </div>
  );

  const PaymentView = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <button onClick={() => setView('wallet')} className="text-gray-400">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Payment</h2>
          <div className="w-6" />
        </div>
        
        <div className="text-center py-2 text-[10px] text-gray-400 font-bold border-b border-gray-50">
           {new Date().toLocaleString()}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
           {/* Instruction Box */}
           <div className="bg-[#e91e63] rounded-2xl p-6 text-white text-sm space-y-4">
              <p className="font-bold leading-relaxed">
                অনুগ্রহ করে একই পরিমাণ স্থানান্তর করুন এবং ব্যর্থ এড়াতে সঠিক TxnID পূরণ করুন
              </p>
              <p className="text-xs opacity-90">
                এই {selectedMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্টে অর্থ প্রদান করতে <span className="bg-black/20 px-2 py-0.5 rounded font-black">সেন্ড মানি</span> ব্যবহার করুন
              </p>

              <div className="bg-white rounded-xl p-4 space-y-4 text-gray-800">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">ওয়ালেট</span>
                    <span className="flex items-center space-x-2 text-[#e91e63] font-black">
                       <img 
                         src={methods.find(m => m.id === selectedMethod)?.icon} 
                         className="w-5 h-5 object-contain" 
                         alt="" 
                       />
                       <span>{selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}</span>
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">সংখ্যা</span>
                    <div className="flex items-center space-x-2">
                       <span className="text-[#3498db] font-black text-lg">{methods.find(m => m.id === selectedMethod)?.number}</span>
                       <button 
                         onClick={() => copyToClipboard(methods.find(m => m.id === selectedMethod)?.number || '')}
                         className="text-[#3498db] p-1 active:scale-90 transition-transform"
                       >
                         <Copy size={16} />
                       </button>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">পরিমাণ</span>
                    <div className="flex items-center space-x-2">
                       <span className="text-[#2ecc71] font-black text-xl">{amount}</span>
                       <button 
                         onClick={() => copyToClipboard(amount)}
                         className="text-[#2ecc71] p-1 active:scale-90 transition-transform"
                       >
                         <Copy size={16} />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-2 pt-2">
                 <p className="text-xs font-bold">রিচার্জ সম্পূর্ণ করতে অনুগ্রহ করে লেনদেন আইডি লিখুন</p>
                 <input 
                   type="text" 
                   placeholder="Transaction ID"
                   value={txnId}
                   onChange={(e) => setTxnId(e.target.value)}
                   className="w-full bg-white rounded-lg py-3 px-4 text-gray-800 outline-none placeholder:text-gray-300 font-bold"
                 />
                 <button 
                   onClick={handleDepositSubmit}
                   disabled={isSubmitting}
                   className="w-full bg-[#f39c12] hover:bg-[#e67e22] text-white py-3 rounded-lg font-black mt-2 shadow-lg active:scale-95 transition-all text-sm disabled:opacity-50"
                 >
                   {isSubmitting ? 'Processing...' : 'জমা দিন'}
                 </button>
              </div>
           </div>

           {/* Legal/Explain Box */}
           <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-black text-blue-900 border-b border-gray-200 pb-2">ব্যাখ্যা:</h3>
              <div className="space-y-6 text-[11px] leading-relaxed text-gray-600">
                 <div className="flex space-x-3">
                    <span className="font-black text-blue-800">১.</span>
                    <div className="space-y-1">
                       <p className="font-black text-gray-800">ওয়ালেট জমা ব্যবহারকারীদের জন্য নির্দেশিকা</p>
                       <p>নির্দেশিকা ম্যাচিং প্রক্রিয়া সম্পন্ন হওয়ার পর এবং নির্ধারিত নিয়ন্ত্রিত ওয়ালেট অ্যাকাউন্ট প্রাপ্তির পর বিনিয়োগকারীদের অবশ্যই তাদের ব্যক্তিগত ওয়ালেট অ্যাকাউন্ট ব্যবহার করে অর্থ প্রেরণ করতে হবে এবং সেই অর্থ নির্দিষ্ট করা নিয়ন্ত্রিত ওয়ালেট অ্যাকাউন্টে জমা দিতে হবে।</p>
                    </div>
                 </div>
                 <div className="flex space-x-3">
                    <span className="font-black text-blue-800">২.</span>
                    <div className="space-y-1">
                       <p className="font-black text-gray-800">অর্থ প্রেরণ ও জমা নিশ্চিতকরণ প্রক্রিয়া</p>
                       <p>অর্থ প্রেরণ সম্পন্ন হওয়ার পর অবিলম্বে লেনদেন নম্বর জমা দিতে হবে, যাতে সিস্টেম তাৎক্ষণিকভাবে যাচাই করে জমা নিশ্চিত করতে পারে।</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );

  const HistoryView = () => (
    <div className="pb-28">
       <header className="bg-white px-4 py-4 flex items-center border-b border-gray-100">
          <button onClick={() => setView('wallet')} className="text-gray-400 mr-4">
             <ChevronRight size={24} className="rotate-180" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Deposit History</h2>
       </header>

       <div className="p-4 space-y-4">
          {transactions.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-gray-300 space-y-4">
               <History size={64} strokeWidth={1} />
               <p className="text-sm font-bold">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                         tx.type === 'deposit' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                       }`}>
                          {tx.type === 'deposit' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-800">Deposit via {tx.method}</p>
                          <p className="text-[10px] font-bold text-gray-400">
                             {tx.timestamp?.toDate().toLocaleString() || 'Pending...'}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-gray-800">৳{tx.amount.toFixed(2)}</p>
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                         tx.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                         tx.status === 'success' ? 'bg-green-50 text-green-600' :
                         'bg-red-50 text-red-600'
                       }`}>
                          {tx.status === 'pending' ? 'Pending' : 
                           tx.status === 'success' ? 'Approved' : 'Cancelled'}
                       </span>
                    </div>
                 </div>
                 
                 <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">TXID</span>
                    <span className="text-gray-800 font-mono">{tx.txId}</span>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-left">
      {/* Top Header - Always show except in payment modal overlay */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter uppercase">MK WIN 25</h1>
        <div className="flex space-x-4 text-gray-400">
          <Download size={20} strokeWidth={2.5} />
          <Headphones size={20} strokeWidth={2.5} />
        </div>
      </header>

      {view === 'wallet' && <WalletView />}
      {view === 'history' && <HistoryView />}
      
      <AnimatePresence>
        {view === 'payment' && <PaymentView />}
      </AnimatePresence>
    </div>
  );
}

