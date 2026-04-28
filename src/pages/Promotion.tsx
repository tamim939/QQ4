import { 
  Share2, 
  Copy, 
  Trophy, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Headphones, 
  ChevronRight,
  ClipboardList,
  History,
  FileText,
  PieChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Promotion() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('direct');
  const userNumericId = userData?.userNumericId || "........";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userNumericId);
    toast.success('Code copied!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-left">
      {/* Top Header */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-black italic text-[#f1c40f] tracking-tighter">MK WIN 25</h1>
        <div className="flex space-x-4 text-gray-400">
          <Download size={20} />
          <Headphones size={20} />
        </div>
      </header>

      {/* Agency Title & User Info */}
      <div className="bg-white py-4 px-6 flex items-center justify-between">
         <h2 className="text-lg font-bold text-gray-800 tracking-tight">Agency</h2>
         <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">UID: {userNumericId}</p>
         </div>
      </div>

      {/* Main Yellow Banner */}
      <div className="bg-[#f1c40f] mx-4 rounded-t-[30px] p-8 text-white text-center shadow-lg shadow-[#f1c40f]/20">
         <p className="text-4xl font-black mb-4">0.00</p>
         <div className="bg-white/40 inline-flex items-center px-6 py-2 rounded-full text-xs font-bold mb-2">
            Yesterday's total commission
         </div>
         <p className="text-[10px] font-medium opacity-90 italic">Upgrade the level to increase commission income</p>
      </div>

      {/* Tabs and Stats Grid */}
      <div className="mx-4 bg-white rounded-b-[30px] shadow-sm border border-gray-100 overflow-hidden mb-6">
         {/* Tabs */}
         <div className="flex border-b border-gray-100">
            <button 
               onClick={() => setActiveTab('direct')}
               className={`flex-1 py-4 text-xs font-bold transition-all relative ${activeTab === 'direct' ? 'text-[#f1c40f]' : 'text-gray-400'}`}
            >
               Direct subordinates
               {activeTab === 'direct' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f1c40f]" />}
            </button>
            <button 
               onClick={() => setActiveTab('team')}
               className={`flex-1 py-4 text-xs font-bold transition-all relative ${activeTab === 'team' ? 'text-[#f1c40f]' : 'text-gray-400'}`}
            >
               Team subordinates
               {activeTab === 'team' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f1c40f]" />}
            </button>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 p-6 gap-y-8 border-b border-gray-50">
            <div className="text-center">
               <p className="text-lg font-black text-gray-800">0</p>
               <p className="text-[10px] font-bold text-gray-400">Number of register</p>
            </div>
            <div className="text-center border-l border-gray-50">
               <p className="text-lg font-black text-emerald-500">0</p>
               <p className="text-[10px] font-bold text-gray-400">Deposit number</p>
            </div>
            <div className="text-center pt-2">
               <p className="text-lg font-black text-rose-500">0.00</p>
               <p className="text-[10px] font-bold text-gray-400">Deposit amount</p>
            </div>
            <div className="text-center border-l border-gray-50 pt-2">
               <p className="text-lg font-black text-[#2980b9]">0</p>
               <p className="text-[10px] font-bold text-gray-400">First deposits</p>
            </div>
         </div>

         {/* QR Button */}
         <div className="p-4">
            <button className="w-full bg-[#f1c40f] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#f1c40f]/20 active:scale-95 transition-all">
               Download QR Code
            </button>
         </div>
      </div>

      {/* Action List Section */}
      <div className="mx-4 space-y-4">
         {/* Copy Code */}
         <div className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
               <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                  <FileText size={18} />
               </div>
               <p className="text-sm font-bold text-gray-700">Copy invitation code</p>
            </div>
            <div className="flex items-center space-x-3">
               <span className="text-xs font-bold text-gray-400">{userNumericId}</span>
               <button onClick={copyToClipboard} className="text-gray-400">
                  <Copy size={18} />
               </button>
            </div>
         </div>

         {/* List Items */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 font-bold text-gray-700">
            <ListItem icon={Users} label="Subordinate data" iconBg="bg-yellow-50" iconColor="text-yellow-600" />
            <ListItem icon={DollarSign} label="Commission detail" iconBg="bg-orange-50" iconColor="text-orange-500" />
            <ListItem icon={History} label="Invitation rules" iconBg="bg-amber-50" iconColor="text-amber-600" />
         </div>

         {/* Promotion Data Box */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center justify-center space-x-2 mb-10">
               <div className="bg-yellow-400 p-1.5 rounded-lg text-white">
                  <PieChart size={18} />
               </div>
               <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-center">Promotion Data</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-y-12">
               <div className="text-center">
                  <p className="text-xl font-black text-gray-800">0.00</p>
                  <p className="text-[10px] font-bold text-gray-400">This Week</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-black text-gray-800">0.00</p>
                  <p className="text-[10px] font-bold text-gray-400">Total commission</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-black text-gray-800">0</p>
                  <p className="text-[10px] font-bold text-gray-400">Direct subordinate</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-black text-gray-800">0</p>
                  <p className="text-[10px] font-bold text-gray-400">Total subordinates</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ListItem({ icon: Icon, label, iconBg, iconColor }: { icon: any, label: string, iconBg: string, iconColor: string }) {
  return (
    <div className="flex items-center justify-between p-5 active:bg-gray-50 transition-colors cursor-pointer">
       <div className="flex items-center space-x-3">
          <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl`}>
             <Icon size={20} />
          </div>
          <span className="text-xs">{label}</span>
       </div>
       <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}
