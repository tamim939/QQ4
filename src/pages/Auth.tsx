import { useState } from 'react';
import { Lock, Eye, EyeOff, ChevronLeft, Gem, Smartphone, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    confirmPassword: '',
    referCode: '829542'
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = `${formData.mobile}@guruwin.app`; // Virtual email for simplicity in this demo environment

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await createUserWithEmailAndPassword(auth, email, formData.password);
      } else {
        await signInWithEmailAndPassword(auth, email, formData.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1c40f] flex flex-col pt-4">
      {/* Top Bar */}
      <div className="px-4 flex items-center justify-between text-white">
        <button onClick={() => window.history.back()} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <button className="bg-[#f1c40f]/20 backdrop-blur-md px-3 py-1 rounded flex items-center space-x-1 border border-white/20">
           <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-cover rounded-sm" alt="US Flag" />
           <span className="text-[10px] font-black uppercase text-white">EN</span>
        </button>
      </div>

      {/* Header Logo Section */}
      <div className="flex flex-col items-center mt-6 mb-10 px-6 text-center">
        <div className="flex items-center space-x-2 text-white mb-2">
           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Gem size={28} className="text-[#f1c40f] fill-[#f1c40f]/20" />
           </div>
           <h1 className="text-4xl font-black italic tracking-widest drop-shadow-sm">QQ4</h1>
        </div>
        <h2 className="text-white text-3xl font-black italic tracking-tight mb-1">
          {mode === 'signup' ? 'Register' : 'Log in'}
        </h2>
        <p className="text-white/90 text-[11px] font-bold tracking-wide">
          {mode === 'signup' ? 'Please register by phone number' : 'Please log in with your phone number'}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="flex-1 bg-[#f9fafc] rounded-t-[40px] px-6 pt-10 pb-12 shadow-inner">
        {/* Tab Switcher - Single Tab as per image */}
        <div className="flex justify-center border-b border-gray-100 mb-8 mx-auto w-fit">
          <div className="pb-4 text-[13px] font-black flex items-center space-x-2 border-b-2 border-[#f1c40f] text-[#f1c40f] px-10">
            <Smartphone size={16} />
            <span>{mode === 'signup' ? 'Register' : 'Phone number'}</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 text-left">
          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 ml-1">Phone number</label>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1 px-3 bg-white rounded-xl border border-gray-100 text-gray-600 shadow-sm">
                <span className="text-sm font-black">+880</span>
                <ChevronDown size={14} className="opacity-40" />
              </div>
              <input
                type="tel"
                placeholder="Phone number"
                className="flex-1 px-4 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#f1c40f] transition-all outline-none text-sm placeholder:text-gray-300 shadow-sm"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 ml-1">
              {mode === 'signup' ? 'Set password' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#f1c40f] transition-all outline-none text-sm placeholder:text-gray-300 shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 active:scale-90 transition-all"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1">Confirm password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full px-4 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#f1c40f] transition-all outline-none text-sm placeholder:text-gray-300 shadow-sm"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Invite Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1">Invite code</label>
                <input
                  type="text"
                  placeholder="Invite Code (Optional)"
                  className="w-full px-4 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#f1c40f] transition-all outline-none text-sm placeholder:text-gray-300 shadow-sm"
                  value={formData.referCode}
                  onChange={(e) => setFormData({...formData, referCode: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 ml-1 pt-1">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 rounded-full border-gray-300 text-[#f1c40f] focus:ring-[#f1c40f]" 
                />
                <p>I read and agree <span className="text-[#f1c40f] font-black">【Privacy Agreement】</span></p>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 ml-1 pt-1">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 rounded-full border-gray-300 text-[#f1c40f] focus:ring-[#f1c40f]" 
              />
              <span>Remember password</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center font-bold">{error}</p>
          )}

          {/* Buttons */}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#f1c40f] text-white font-black rounded-full shadow-lg shadow-[#f1c40f]/20 active:scale-95 transition-all text-[16px] italic disabled:opacity-50"
            >
              {loading ? 'Processing...' : (mode === 'signup' ? 'Register' : 'Log in')}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError('');
              }}
              className="w-full py-4 bg-white border border-[#f1c40f] text-[#f1c40f] font-black rounded-full active:scale-95 transition-all text-[16px] italic"
            >
               {mode === 'signup' ? 'Log in' : 'Register'}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-12 flex justify-between px-6">
           <button className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <Lock size={20} className="text-[#f1c40f]" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">Forgot password</span>
           </button>
           <button className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <Headphones size={20} className="text-[#f1c40f]" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">Customer Service</span>
           </button>
        </div>
      </div>
      
      {/* Floating Chat Icon */}
      <div className="fixed bottom-10 right-6 z-50">
        <button className="w-12 h-12 bg-[#f1c40f] rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white active:scale-90 transition-all">
          <Headphones size={24} />
        </button>
      </div>
    </div>
  );
}

function Headphones({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}

