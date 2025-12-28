
import React, { useState } from 'react';
import Button from './Button';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onLogin(input.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative Orbs for Login Page specifically */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card w-full max-w-md rounded-[32px] p-10 md:p-12 relative z-10 border-white/5 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] rotate-6 mx-auto mb-6 transition-transform hover:rotate-12 duration-500">
            <i className="fa-solid fa-cube text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black lumina-text tracking-tighter uppercase italic mb-2">
            TagTracer
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Neural Entry Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">User Identifier</label>
            <div className="relative group search-glow rounded-2xl transition-all">
              <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors"></i>
              <input
                type="text"
                required
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your username..."
                className="w-full pl-14 pr-6 py-4 bg-slate-950/40 border border-slate-800 rounded-2xl focus:outline-none text-white text-base placeholder-slate-700 transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
          >
            Access Dashboard
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
            Secure biometric bypass inactive.<br/>Please proceed with manual identification.
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] pointer-events-none">
        Lumina OS v2.5.0
      </div>
    </div>
  );
};

export default LoginPage;
