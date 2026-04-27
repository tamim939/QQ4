import { Share2, Copy, Trophy, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Promotion() {
  const { userData } = useAuth();
  const referLink = `https://qq4.com/ref/${userData?.referCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referLink);
    alert('Referral link copied!');
  };

  const stats = [
    { label: 'Total Commission', value: '৳0.00', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Direct Subordinates', value: '0', icon: Users, color: 'bg-blue-500' },
    { label: 'Team Deposits', value: '৳0', icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Invitations', value: '0', icon: Trophy, color: 'bg-theme-yellow' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-theme-red px-6 pt-12 pb-24 text-white text-center">
         <h2 className="text-2xl font-black italic mb-2 tracking-tight">Refer & Earn</h2>
         <p className="text-xs opacity-80 font-medium">Earn unlimited commission by inviting friends!</p>
      </div>

      <div className="px-4 -mt-16 space-y-4">
        {/* Refer Box */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-theme-yellow/20 text-center space-y-4">
           <div className="p-4 bg-yellow-50 rounded-2xl border border-dashed border-theme-yellow">
              <p className="text-[10px] font-black text-theme-yellow uppercase tracking-widest mb-2">Your Invitation Link</p>
              <p className="text-xs font-bold text-gray-600 break-all">{referLink}</p>
           </div>
           <div className="flex space-x-3">
              <button 
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-theme-yellow text-gray-800 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-md"
              >
                 <Copy size={18} />
                 <span>Copy Link</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 bg-theme-red text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-md">
                 <Share2 size={18} />
                 <span>Share</span>
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           {stats.map((s, i) => (
             <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-2">
                <div className={`${s.color} p-2 rounded-xl text-white shadow-sm mb-1`}>
                   <s.icon size={20} />
                </div>
                <p className="text-lg font-black text-gray-700">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{s.label}</p>
             </div>
           ))}
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <h3 className="font-black text-gray-800 mb-4 pb-2 border-b">Promotion Rules</h3>
           <ul className="space-y-4 text-xs font-medium text-gray-500 leading-relaxed">
              <li className="flex items-start space-x-3">
                 <div className="w-5 h-5 rounded-full bg-theme-yellow/20 text-theme-yellow flex items-center justify-center flex-shrink-0 font-bold">1</div>
                 <span>Share your referral link with friends through social media or directly.</span>
              </li>
              <li className="flex items-start space-x-3">
                 <div className="w-5 h-5 rounded-full bg-theme-yellow/20 text-theme-yellow flex items-center justify-center flex-shrink-0 font-bold">2</div>
                 <span>When your friends register and deposit, you get an instant ৳100 bonus!</span>
              </li>
              <li className="flex items-start space-x-3">
                 <div className="w-5 h-5 rounded-full bg-theme-yellow/20 text-theme-yellow flex items-center justify-center flex-shrink-0 font-bold">3</div>
                 <span>Earn lifetime commission on every bet your subordinates place.</span>
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
}
