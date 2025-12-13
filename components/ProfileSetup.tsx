import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User as UserIcon, Loader2, Globe, Sparkles } from 'lucide-react';
import { Language, User } from '../types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ProfileSetupProps {
  onComplete: (user: User) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
            }
          }
        });
        if (error) throw error;
        if (data.user) {
             setMessage("Account created! Please check your email to confirm.");
        }
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
      else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Password reset link sent to your email.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans ambient-wave relative overflow-hidden">
      
      {/* LEFT SIDE - AUTH FORM (Glass Panel) */}
      <div className="w-full md:w-[480px] lg:w-[550px] flex flex-col justify-center px-8 sm:px-12 md:px-16 border-r border-white/5 bg-black/40 backdrop-blur-2xl relative z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
         
         <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <Globe size={20} className="text-indigo-400" />
                </div>
                <span className="text-2xl font-bold tracking-tighter text-white">Orbit</span>
            </div>
            <h1 className="text-5xl font-light text-white tracking-tighter mb-4 text-glow">
                {mode === 'signin' && 'Welcome back'}
                {mode === 'signup' && 'Create account'}
                {mode === 'forgot_password' && 'Reset Password'}
            </h1>
            <p className="text-zinc-400 font-light leading-relaxed">
                {mode === 'signin' && 'Enter your coordinates to access your workspace.'}
                {mode === 'signup' && 'Initialize your profile for the orbit network.'}
                {mode === 'forgot_password' && 'Enter your comms ID to receive a reset link.'}
            </p>
         </div>

         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             
             <form onSubmit={handleAuth} className="space-y-5">
                 
                 {mode === 'signup' && (
                    <div className="group">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-4 text-zinc-500 w-4 h-4 transition-colors group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-black/40 text-white rounded-2xl pl-10 pr-4 py-4 border border-white/10 focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-zinc-700 font-light text-sm"
                                required
                            />
                        </div>
                    </div>
                 )}

                 <div className="group">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-zinc-500 w-4 h-4 transition-colors group-focus-within:text-indigo-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full bg-black/40 text-white rounded-2xl pl-10 pr-4 py-4 border border-white/10 focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-zinc-700 font-light text-sm"
                            required
                        />
                    </div>
                 </div>

                 {mode !== 'forgot_password' && (
                    <div className="group">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-zinc-500 w-4 h-4 transition-colors group-focus-within:text-indigo-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/40 text-white rounded-2xl pl-10 pr-4 py-4 border border-white/10 focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-zinc-700 font-light text-sm"
                                required
                            />
                        </div>
                    </div>
                 )}

                 {error && (
                     <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center backdrop-blur-md">
                         {error}
                     </div>
                 )}
                 {message && (
                     <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center backdrop-blur-md">
                         {message}
                     </div>
                 )}

                 {mode === 'signin' && (
                     <div className="flex justify-end">
                         <button type="button" onClick={() => setMode('forgot_password')} className="text-xs text-zinc-400 hover:text-white transition-colors">
                             Forgot password?
                         </button>
                     </div>
                 )}

                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] mt-4 border border-indigo-500/50"
                 >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            {mode === 'signin' && 'Initialize Session'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'forgot_password' && 'Send Reset Link'}
                            {mode !== 'forgot_password' && <ArrowRight size={16} />}
                        </>
                    )}
                 </button>
             </form>
         </div>

         <div className="mt-12 text-center text-sm text-zinc-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
             {mode === 'signin' ? (
                 <>
                    New to Orbit?{' '}
                    <button onClick={() => setMode('signup')} className="text-white font-medium hover:underline decoration-indigo-500 underline-offset-4">
                        Sign up
                    </button>
                 </>
             ) : (
                 <>
                    Already initialized?{' '}
                    <button onClick={() => setMode('signin')} className="text-white font-medium hover:underline decoration-indigo-500 underline-offset-4">
                        Sign in
                    </button>
                 </>
             )}
         </div>
      </div>

      {/* RIGHT SIDE - VISUALS */}
      <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden">
          {/* Subtle grid pattern or stars could be added here */}
          <div className="relative z-10 p-12 max-w-2xl text-center">
              <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(255,255,255,0.05)] animate-bounce duration-[4000ms]">
                   <Globe size={48} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              </div>

              <h2 className="text-6xl lg:text-8xl font-light text-white tracking-tighter mb-8 leading-tight text-glow">
                  Deep Space <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 font-normal">Connection</span>
              </h2>
              
              <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-lg mx-auto mb-12">
                  High-fidelity AI voice translation powered by Eburon AI. 
                  Seamless communication across the event horizon.
              </p>

              {/* Decorative Features Grid */}
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto text-left opacity-80">
                  <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-3 text-indigo-400">
                          <Sparkles size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Voice Mirror</span>
                      </div>
                      <p className="text-sm text-zinc-300 font-light">Prosody & Emotion Transfer</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
                       <div className="flex items-center gap-3 mb-3 text-indigo-400">
                          <Globe size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Universal</span>
                      </div>
                      <p className="text-sm text-zinc-300 font-light">Real-time Translation</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};