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
  Trophy,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  method: string;
  number?: string;
  account?: string;
  txId: string;
  status: 'pending' | 'success' | 'rejected';
  timestamp: any;
}

type ViewState = 'wallet' | 'payment' | 'history';
type WalletTab = 'deposit' | 'withdraw' | 'history';

// Sub-components moved outside to prevent re-creation on every render
const BindModal = ({ 
  onClose, 
  onSave, 
  tempBindMethod, 
  setTempBindMethod, 
  tempBindNumber, 
  setTempBindNumber, 
  isBinding 
}: any) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 overflow-y-auto">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6 my-auto"
    >
      <h2 className="text-xl font-black text-center text-gray-800 mb-8 tracking-widest uppercase">BIND WALLET</h2>
      
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
              type="tel" 
              placeholder="017xxxxxxxx"
              value={tempBindNumber}
              onChange={(e) => setTempBindNumber(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-black text-gray-800 outline-none focus:border-[#f1c40f] transition-all"
            />
         </div>

         <div className="flex space-x-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black uppercase text-sm"
            >
              CANCEL
            </button>
            <button 
              onClick={onSave}
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

const WalletView = ({ 
  walletBalance, 
  walletTab, 
  setWalletTab, 
  methods, 
  selectedMethod, 
  setSelectedMethod, 
  channels, 
  selectedChannel, 
  setSelectedChannel, 
  amounts, 
  amount, 
  setAmount, 
  setView, 
  setIsBindModalOpen, 
  userData, 
  withdrawAmount, 
  setWithdrawAmount, 
  loginPassword, 
  setLoginPassword 
}: any) => (
  <div className="pb-28 min-h-[calc(100vh-60px)] flex flex-col">
    <div className="bg-white py-4 text-center">
       <h2 className="text-lg font-bold text-gray-800 tracking-tight">Wallet</h2>
    </div>

    <div className="px-4 py-2 text-left">
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
          <button 
            onClick={() => setWalletTab('history')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
              walletTab === 'history' ? 'bg-white text-[#f1c40f]' : 'text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </div>

    {walletTab === 'deposit' && (
      <div className="text-left">
        <div className="px-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#f1c40f] rounded-full" />
              <h3 className="text-sm font-black text-gray-800">Deposit Methods</h3>
            </div>
            <button 
              onClick={() => setWalletTab('history')}
              className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold"
            >
              <History size={14} />
              <span>History</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {methods.map((m: any) => (
              <div 
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-4 bg-white rounded-2xl flex flex-col items-center space-y-2 border-2 transition-all relative cursor-pointer ${
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

        <div className="px-4 mt-8">
          <p className="text-xs font-bold text-gray-500 mb-4">Select Channel</p>
          <div className="grid grid-cols-2 gap-3">
            {channels.map((c: string) => (
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

        <div className="px-4 mt-8">
          <p className="text-xs font-bold text-gray-500 mb-4">Deposit Amount</p>
          <div className="grid grid-cols-3 gap-3">
            {amounts.map((a: string) => {
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

          <div className="mt-4 relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-[#f1c40f]">৳</div>
            <input 
              type="tel"
              inputMode="numeric"
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

        <div className="px-4 mt-10">
          <button 
            onClick={() => setView('payment')}
            className="w-full bg-[#f1c40f] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#f1c40f]/20 active:scale-95 transition-all"
          >
            Deposit
          </button>
        </div>
      </div>
    )}

    {walletTab === 'withdraw' && (
      <div className="text-left">
        <div className="px-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#f1c40f] rounded-full" />
              <h3 className="text-sm font-black text-gray-800">Withdraw Info</h3>
            </div>
            <button 
              onClick={() => setWalletTab('history')}
              className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold"
            >
              <History size={14} />
              <span>History</span>
            </button>
          </div>

          <button 
            onClick={() => setIsBindModalOpen(true)}
            className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-[#f1c40f]/10 rounded-2xl flex items-center justify-center text-[#f1c40f]">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-800">
                  {userData?.boundWallet ? `${userData.boundWallet.method} - ${userData.boundWallet.number}` : 'Select Wallet'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 text-left">
                  {userData?.boundWallet ? 'Tap to change account' : 'Tap to bind account'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>

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

        <div className="px-4 mt-8 space-y-4">
           <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#f1c40f] font-black text-lg">৳</div>
              <input 
                type="tel"
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
             className={`w-full py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-95 transition-all mt-4 ${
               isSubmitting ? 'bg-gray-200 text-gray-400' : 'bg-[#f1c40f] text-white shadow-[#f1c40f]/20'
             }`}
             disabled={isSubmitting}
             onClick={handleWithdrawSubmit}
           >
             {isSubmitting ? 'Processing...' : 'Withdraw'}
           </button>
        </div>
      </div>
    )}

    {walletTab === 'history' && (
       <div className="p-4 space-y-4 text-left">
          {userData?.transactions?.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-gray-300 space-y-4">
               <History size={64} strokeWidth={1} />
               <p className="text-sm font-bold">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                         tx.type === 'deposit' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                       }`}>
                          {tx.type === 'deposit' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-gray-800 capitalize">{tx.type} via {tx.method}</p>
                          <p className="text-[10px] font-bold text-gray-400">
                             {tx.timestamp?.toDate().toLocaleString() || 'Processing...'}
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
                            tx.status === 'success' ? 'Completed' : 'Cancelled'}
                        </span>
                    </div>
                 </div>
                 <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">TRANSACTION ID</span>
                    <span className="text-gray-800 font-mono tracking-tighter">{tx.txId}</span>
                 </div>
              </div>
            ))
          )}
       </div>
    )}
  </div>
);

const HistoryView = ({ transactions, setView }: any) => (
  <div className="pb-28">
     <header className="bg-white px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => setView('wallet')} className="text-gray-400 mr-4 active:scale-90 transition-all p-2">
           <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">History</h2>
     </header>

     <div className="p-4 space-y-4 text-left">
        {transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-gray-300 space-y-4">
             <History size={64} strokeWidth={1} />
             <p className="text-sm font-bold">No transactions yet</p>
          </div>
        ) : (
          transactions.map((tx: Transaction) => (
            <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                       tx.type === 'deposit' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                     }`}>
                        {tx.type === 'deposit' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-black text-gray-800 capitalize">{tx.type} via {tx.method}</p>
                        <p className="text-[10px] font-bold text-gray-400">
                           {tx.timestamp?.toDate().toLocaleString() || 'Processing...'}
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
                          tx.status === 'success' ? 'Completed' : 'Cancelled'}
                      </span>
                  </div>
               </div>
               
               <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">TRANSACTION ID</span>
                  <span className="text-gray-800 font-mono tracking-tighter">{tx.txId}</span>
               </div>
            </div>
          ))
        )}
     </div>
  </div>
);

const PaymentView = ({ 
  setView, 
  selectedMethod, 
  amount, 
  txnId, 
  setTxnId, 
  handleDepositSubmit, 
  isSubmitting, 
  methods 
}: any) => {
  const methodData = methods.find((m: any) => m.id === selectedMethod);
  const now = new Date();
  const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  return (
    <div className="fixed inset-0 bg-[#f7f8fa] z-[60] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex flex-col items-center border-b border-gray-100 relative">
        <button 
          onClick={() => setView('wallet')}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 active:scale-90 transition-all font-black"
        >
          <X size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">Payment</h2>
        <p className="text-[10px] font-bold text-gray-300 mt-0.5">{formattedDate}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar text-left">
        {/* Pink Main Container */}
        <div className="bg-[#e91e63] rounded-[24px] p-6 space-y-6 shadow-xl shadow-gray-200">
           {/* Alerts in Bengali */}
           <div className="space-y-1">
              <p className="text-[13px] font-black text-white leading-tight">অনুগ্রহ করে একই পরিমাণ স্থানান্তর করুন এবং ব্যর্থ এড়াতে সঠিক TxnID পূরণ করুন</p>
              <div className="flex items-center space-x-2 mt-4">
                 <p className="text-[13px] font-black text-white">এই বিকাশ অ্যাকাউন্টে অর্থ প্রদান করতে</p>
                 <span className="bg-[#b0003a] text-white px-3 py-1 rounded-md text-[11px] font-black">সেন্ট মানি</span>
              </div>
              <p className="text-[13px] font-black text-white">ব্যবহার করুন</p>
           </div>

           {/* Inner Details Card */}
           <div className="bg-white rounded-2xl p-6 space-y-5">
              <div className="flex justify-between items-center">
                 <p className="text-sm font-black text-gray-800">ওয়ালেট</p>
                 <div className="flex items-center space-x-1">
                    <img src={methodData?.icon} className="w-5 h-5 object-contain" alt="icon" />
                    <span className="text-sm font-black text-[#e91e63]">{selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center">
                 <p className="text-sm font-black text-gray-800">সংখ্যা</p>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-blue-500">{methodData?.number}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(methodData?.number || '');
                        toast.success('Number copied!');
                      }}
                      className="text-blue-500 bg-blue-50 p-1 rounded-md"
                    >
                       <Copy size={16} />
                    </button>
                 </div>
              </div>

              <div className="flex justify-between items-center">
                 <p className="text-sm font-black text-gray-800">পরিমাণ</p>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-emerald-500">{amount}</span>
                    <button 
                       onClick={() => {
                        navigator.clipboard.writeText(amount.toString());
                        toast.success('Amount copied!');
                      }}
                      className="text-emerald-500 bg-emerald-50 p-1 rounded-md"
                    >
                       <Copy size={16} />
                    </button>
                 </div>
              </div>
           </div>

           {/* Input Section */}
           <div className="space-y-4">
              <p className="text-[13px] font-black text-white text-center">রিচার্জ সম্পূর্ণ করতে অনুগ্রহ করে লেনদেন আইডি লিখুন</p>
              <input 
                type="text"
                placeholder="Transaction ID"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-5 px-6 font-bold text-gray-800 outline-none focus:border-[#f1c40f] placeholder:text-gray-300"
              />
              <button 
                onClick={handleDepositSubmit}
                disabled={!txnId || isSubmitting}
                className="w-full bg-[#f4511e] text-white py-5 rounded-[20px] font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'জমা দিন'}
              </button>
           </div>
        </div>

        {/* Explanation Section */}
        <div className="mt-8 space-y-6 px-2">
           <h3 className="text-blue-700 font-black text-lg">ব্যাখ্যা:</h3>
           
           <div className="flex space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-1">১.</div>
              <div className="space-y-2">
                 <p className="text-[15px] font-black text-gray-700">ওয়ালেট জমা ব্যবহারকারীদের জন্য নির্দেশিকা</p>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed">
                   নির্দেশিকা ম্যাচিং প্রক্রিয়া সম্পন্ন হওয়ার পর এবং নির্ধারিত নিয়ন্ত্রিত ওয়ালেট অ্যাকাউন্ট প্রাপ্তির পর বিনিয়োগকারীদের অবশ্যই তাদের ব্যক্তিগত ওয়ালেট অ্যাকাউন্ট ব্যবহার করে অর্থ প্রেরণ করতে হবে এবং সেই অর্থ নির্দিষ্ট করা নিয়মনীতির অনুযায়ী করতে হবে।
                 </p>
              </div>
           </div>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
};

export default function WalletPage({ initialTab = 'deposit', initialView = 'wallet' }: { initialTab?: WalletTab, initialView?: ViewState }) {
  const { userData, user } = useAuth();
  const [view, setView] = useState<ViewState>(initialView);
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'nagad' | 'bkash'>('bkash');
  const [selectedChannel, setSelectedChannel] = useState('CashPay-bKash');
  const [amount, setAmount] = useState('300');
  const [txnId, setTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletTab, setWalletTab] = useState<WalletTab>(initialTab);

  useEffect(() => {
    setWalletTab(initialTab);
    setView(initialView);
  }, [initialTab, initialView]);

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
      txs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setTransactions(txs);
    });
    return () => unsubscribe();
  }, [user]);

  const walletBalance = userData?.wallet || 0;

  const methods = [
    { id: 'nagad', name: 'Nagad', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1024px-Nagad_Logo.svg.png', number: '01328848417' },
    { id: 'bkash', name: 'bKash', icon: 'https://seeklogo.com/images/B/bkash-logo-835789094A-seeklogo.com.png', number: '01328848417' }
  ];

  const channels = ['CashPay-bKash', 'GoPay-bKash', 'RolezPay-bKash', 'Lucky-bKash'];
  const amounts = ['300', '500', '1K', '2K', '10K', '25K'];

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 500) {
      toast.error('Minimum withdrawal is 500');
      return;
    }
    if (!loginPassword) {
      toast.error('Please enter login password');
      return;
    }
    if (!userData?.boundWallet) {
      toast.error('Please bind your wallet first');
      return;
    }
    if (parseFloat(withdrawAmount) > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      // Deduct balance immediately
      await updateDoc(doc(db, 'users', user?.uid!), {
        wallet: increment(-parseFloat(withdrawAmount))
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user?.uid,
        type: 'withdraw',
        amount: parseFloat(withdrawAmount),
        method: userData.boundWallet.method,
        number: userData.boundWallet.number,
        status: 'pending',
        timestamp: serverTimestamp(),
        txId: 'W' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });

      toast.success('Withdrawal request submitted!');
      setWalletTab('history');
      setView('wallet');
      setWithdrawAmount('');
      setLoginPassword('');
    } catch (error) {
      toast.error('Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
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
      toast.success('Submitted successfully!');
      setWalletTab('history');
      setView('wallet');
      setTxnId('');
      setAmount('');
    } catch (error) {
      toast.error('Failed to submit deposit');
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

  return (
    <div className="min-h-screen bg-gray-50 text-left font-sans">
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter uppercase">MK WIN 25</h1>
        <div className="flex space-x-4 text-gray-400">
          <Download size={20} strokeWidth={2.5} />
          <Headphones size={20} strokeWidth={2.5} />
        </div>
      </header>

      {view === 'wallet' && (
        <WalletView 
          walletBalance={walletBalance}
          walletTab={walletTab}
          setWalletTab={setWalletTab}
          methods={methods}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          channels={channels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          amounts={amounts}
          amount={amount}
          setAmount={setAmount}
          setView={setView}
          setIsBindModalOpen={setIsBindModalOpen}
          userData={userData}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
        />
      )}

      {view === 'history' && (
        <HistoryView transactions={transactions} setView={setView} />
      )}
      
      <AnimatePresence>
        {view === 'payment' && (
          <PaymentView 
            setView={setView}
            selectedMethod={selectedMethod}
            amount={amount}
            txnId={txnId}
            setTxnId={setTxnId}
            handleDepositSubmit={handleDepositSubmit}
            isSubmitting={isSubmitting}
            success={success}
            methods={methods}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBindModalOpen && (
          <BindModal 
            onClose={() => setIsBindModalOpen(false)}
            onSave={handleBindWallet}
            tempBindMethod={tempBindMethod}
            setTempBindMethod={setTempBindMethod}
            tempBindNumber={tempBindNumber}
            setTempBindNumber={setTempBindNumber}
            isBinding={isBinding}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-20 right-4 z-[55]">
        <button className="w-14 h-14 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#f1c40f]/40 active:scale-90 transition-all border-4 border-white">
          <Headphones size={28} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
