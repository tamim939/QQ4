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
  AlertCircle,
  Wallet,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import toast from 'react-hot-toast';

type ViewState = 'wallet' | 'payment' | 'history';
type WalletTab = 'deposit' | 'withdraw';

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
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'nagad' | 'bkash'>('bkash');
  const [selectedChannel, setSelectedChannel] = useState('CashPay-bKash');
  const [amount, setAmount] = useState('300');
  const [txnId, setTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletTab, setWalletTab] = useState<WalletTab>('deposit');
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [tempBindMethod, setTempBindMethod] = useState<'Nagad' | 'BKASH'>('BKASH');
  const [tempBindNumber, setTempBindNumber] = useState('');
  const [isBinding, setIsBinding] = useState(false);

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
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setView('history');
        setTxnId('');
        setAmount('');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to submit deposit');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBindWallet = async () => {
    if (!tempBindNumber || tempBindNumber.length < 11) {
      toast.error('Please enter valid number');
      return;
    }
    if (!user) return;

    setIsBinding(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        boundWallet: {
          method: tempBindMethod,
          number: tempBindNumber
        }
      });
      toast.success('Wallet binded successfully');
      setIsBindModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsBinding(false);
    }
  };

  const BindModal = () => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6"
      >
        <h3 className="text-xl font-black text-center text-gray-800 mb-8 tracking-widest uppercase">BIND WALLET</h3>
        
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setTempBindMethod('BKASH')}
            className={`flex-1 aspect-square rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all relative ${
              tempBindMethod === 'BKASH' ? 'border-[#f1c40f] bg-[#f1c40f]/5' : 'border-gray-100'
            }`}
          >
            <img src="https://seeklogo.com/images/B/bkash-logo-835789094A-seeklogo.com.png" className="w-12 h-12 object-contain mb-2" alt="bkash" />
            <span className="text-[10px] font-black uppercase text-gray-400">BKASH</span>
            {tempBindMethod === 'BKASH' && (
              <div className="absolute top-2 right-2 text-[#f1c40f]">
                <Check size={16} strokeWidth={4} />
              </div>
            )}
          </button>
          <button 
            onClick={() => setTempBindMethod('Nagad')}
            className={`flex-1 aspect-square rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all relative ${
              tempBindMethod === 'Nagad' ? 'border-[#f1c40f] bg-[#f1c40f]/5' : 'border-gray-100'
            }`}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1024px-Nagad_Logo.svg.png" className="w-12 h-12 object-contain mb-2" alt="nagad" />
            <span className="text-[10px] font-black uppercase text-gray-400">NAGAD</span>
            {tempBindMethod === 'Nagad' && (
              <div className="absolute top-2 right-2 text-[#f1c40f]">
                <Check size={16} strokeWidth={4} />
              </div>
            )}
          </button>
        </div>

        <div className="space-y-4">
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">WALLET NUMBER</label>
              <input 
                type="text" 
                placeholder="017xxxxxxxx"
                value={tempBindNumber}
                onChange={(e) => setTempBindNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-black text-gray-800 outline-none focus:border-[#f1c40f] transition-all"
              />
           </div>

           <div className="flex space-x-4 pt-4">
              <button 
                onClick={() => setIsBindModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black uppercase text-sm"
              >
                CANCEL
              </button>
              <button 
                onClick={handleBindWallet}
                disabled={isBinding}
                className="flex-1 bg-[#f1c40f] text-white py-4 rounded-[20px] font-black uppercase text-sm shadow-xl shadow-[#f1c40f]/20"
              >
                {isBinding ? '...' : 'SAVE'}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );

  const WalletView = () => (
    <div className="pb-28 min-h-[calc(100vh-60px)] flex flex-col">
      {/* Page Title */}
      <div className="bg-white py-4 text-center">
         <h2 className="text-lg font-bold text-gray-800 tracking-tight">Wallet</h2>
      </div>

      {/* Balance Card Section */}
      <div className="px-4 py-2">
        <div className="bg-[#f1c40f] rounded-[30px] p-8 text-white text-center shadow-lg shadow-[#f1c40f]/20">
          <p className="text-[10px] font-medium opacity-90 mb-2">Total balance</p>
          <p className="text-4xl font-black mb-10 tracking-tight">৳ {walletBalance.toFixed(2)}</p>
          
          <div className="flex bg-black/10 p-1 rounded-xl">
            <button 
              onClick={() => setWalletTab('deposit')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                walletTab === 'deposit' ? 'bg-white text-[#f1c40f]' : 'text-white'
              }`}
            >
              Deposit
            </button>
            <button 
              onClick={() => setWalletTab('withdraw')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                walletTab === 'withdraw' ? 'bg-white text-[#f1c40f]' : 'text-white'
              }`}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {walletTab === 'deposit' ? (
        <>
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
        </>
      ) : (
        <>
          {/* Withdraw Section */}
          <div className="px-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-[#f1c40f] rounded-full" />
                <h3 className="text-sm font-black text-gray-800">Withdraw Info</h3>
              </div>
              <button 
                onClick={() => setView('history')}
                className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold"
              >
                <History size={14} />
                <span>History</span>
              </button>
            </div>

            {/* Select Wallet / Bind Button */}
            <button 
              onClick={() => setIsBindModalOpen(true)}
              className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#f1c40f]/10 rounded-2xl flex items-center justify-center text-[#f1c40f]">
                  <Wallet size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-gray-800">
                    {userData?.boundWallet ? `${userData.boundWallet.method} - ${userData.boundWallet.number}` : 'Select Wallet'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {userData?.boundWallet ? 'Tap to change account' : 'Tap to bind account'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </div>

          {/* Wager Requirement Section */}
          <div className="px-4 mt-8">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Wager Requirement</p>
                   <span className="text-[10px] font-black text-rose-500 uppercase">Pending</span>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    className="h-full bg-rose-500" 
                   />
                </div>
                
                <p className="text-[10px] font-bold text-gray-400">Needed: <span className="text-gray-800 font-black">৳120.00</span></p>
             </div>
          </div>

          {/* Withdraw Amount Section */}
          <div className="px-4 mt-8 space-y-4">
             <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#f1c40f] font-black text-lg">৳</div>
                <input 
                  type="text"
                  placeholder="Withdraw Amount (Min 500)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-5 pl-12 pr-6 font-black text-gray-800 outline-none focus:border-[#f1c40f] transition-all shadow-sm"
                />
             </div>

             <div className="relative">
                <input 
                  type="password"
                  placeholder="Login Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-6 font-black text-gray-800 outline-none focus:border-[#f1c40f] transition-all shadow-sm"
                />
             </div>

             <button 
               className="w-full bg-[#f1c40f] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#f1c40f]/20 active:scale-95 transition-all mt-4"
               onClick={() => {
                 if (!userData?.boundWallet) {
                   toast.error('Please bind your wallet first');
                   return;
                 }
                 toast.error('Withdrawals are currently disabled for your account level');
               }}
             >
               Withdraw
             </button>
          </div>
        </>
      )}
    </div>
  );

  const PaymentView = () => (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[70] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-24 h-24 bg-[#2ecc71] rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-green-200"
            >
              <Check size={48} strokeWidth={4} />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-gray-800 mb-2"
            >
              Submission Success!
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-bold text-gray-400"
            >
              Your deposit request is being processed. It will be added to your balance after admin verification.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white shadow-sm">
        <button onClick={() => setView('wallet')} className="text-gray-400 p-2">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Payment</h2>
        <div className="w-10" />
      </div>
      
      <div className="text-center py-2 text-[10px] text-gray-400 font-bold border-b border-gray-50 flex items-center justify-center space-x-2">
         <Clock size={12} />
         <span>{new Date().toLocaleString()}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-10">
         {/* Instruction Box */}
         <div className="bg-[#e91e63] rounded-3xl p-6 text-white text-sm space-y-5 shadow-lg shadow-pink-100">
            <p className="font-bold leading-relaxed text-[15px]">
              অনুগ্রহ করে একই পরিমাণ স্থানান্তর করুন এবং ব্যর্থ এড়াতে সঠিক TxnID পূরণ করুন
            </p>
            <p className="text-xs opacity-90 border-l-2 border-white/30 pl-3">
              এই {selectedMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্টে অর্থ প্রদান করতে <span className="bg-black/20 px-2 py-0.5 rounded font-black">সেন্ড মানি</span> ব্যবহার করুন
            </p>

            <div className="bg-white rounded-2xl p-5 space-y-5 text-gray-800 shadow-inner">
               <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">ওয়ালেট</span>
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
                  <div className="space-y-1">
                     <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">রিসিভার নম্বর</span>
                     <p className="text-lg font-black text-gray-800">{methods.find(m => m.id === selectedMethod)?.number}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(methods.find(m => m.id === selectedMethod)?.number || '')}
                    className="bg-[#f1c40f]/10 p-3 rounded-xl text-[#f1c40f] active:scale-95 transition-all"
                  >
                    <Copy size={20} />
                  </button>
               </div>

               <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <div className="space-y-1">
                     <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">টাকার পরিমাণ</span>
                     <p className="text-lg font-black text-gray-800">৳ {amount}.00</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(amount)}
                    className="bg-[#f1c40f]/10 p-3 rounded-xl text-[#f1c40f] active:scale-95 transition-all"
                  >
                    <Copy size={20} />
                  </button>
               </div>
            </div>
         </div>

         <div className="bg-gray-50 rounded-3xl p-6 space-y-4 shadow-sm border border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Enter Transaction ID</label>
              <div className="relative">
                 <input 
                   type="text"
                   placeholder="8 বা 10 সংখ্যার TxnID"
                   className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-6 font-black text-gray-800 focus:border-[#f1c40f] outline-none transition-all shadow-sm"
                   value={txnId}
                   onChange={(e) => setTxnId(e.target.value)}
                 />
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                    <History size={20} />
                 </div>
              </div>
            </div>

            <button 
              disabled={!txnId || isSubmitting}
              onClick={handleDepositSubmit}
              className="w-full bg-[#f1c40f] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#f1c40f]/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'জমা দিন'
              )}
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 border-b border-gray-50 pb-3">ব্যাখ্যা:</h3>
            <div className="space-y-4 text-[11px] leading-relaxed text-gray-500">
               <div className="flex space-x-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-black text-[10px]">১</span>
                  <p>নির্দেশিকা ম্যাচিং প্রক্রিয়া সম্পন্ন হওয়ার পর এবং নির্ধারিত নিয়ন্ত্রিত অ্যাকাউন্ট প্রাপ্তির পর ব্যক্তিগত ওয়ালেট ব্যবহার করে অর্থ প্রেরণ করতে হবে।</p>
               </div>
               <div className="flex space-x-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-black text-[10px]">২</span>
                  <p>অর্থ প্রেরণ সম্পন্ন হওয়ার পর অবিলম্বে লেনদেন নম্বর জমা দিতে হবে, যাতে সিস্টেম যাচাই করে জমা নিশ্চিত করতে পারে।</p>
               </div>
            </div>
         </div>

         <div className="text-center space-y-2 pb-6">
            <p className="text-[10px] font-bold text-gray-400">ধন্যবাদ আমাদের সাথে থাকার জন্য!</p>
            <div className="flex justify-center space-x-4 grayscale opacity-30 mt-4">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1024px-Nagad_Logo.svg.png" className="h-4 object-contain" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BKash_Logo.svg/1200px-BKash_Logo.svg.png" className="h-4 object-contain" />
            </div>
         </div>
      </div>
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
                       <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                         tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                         tx.status === 'success' ? 'bg-green-100 text-green-700' :
                         'bg-red-100 text-red-700'
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

      <AnimatePresence>
        {isBindModalOpen && <BindModal />}
      </AnimatePresence>

      {/* Floating Customer Support */}
      <button className="fixed right-6 bottom-24 w-14 h-14 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-2xl z-40 border-4 border-white active:scale-90 transition-all">
        <Headphones size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}

