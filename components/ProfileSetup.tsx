import React, { useState } from 'react';
import { User as UserIcon, ArrowRight, AudioWaveform } from 'lucide-react';
import { Language, User } from '../types';

interface ProfileSetupProps {
  onComplete: (user: User) => void;
}

const AVATARS = ['👨‍💻', '👩‍💻', '🐯', '🐼', '🦊', '👽', '🤖', '🤠'];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      avatar,
      language
    };
    onComplete(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#312e81_0%,_#0f172a_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-500/30">
              <AudioWaveform className="text-indigo-400 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-light text-white tracking-tight">Orbitz</h1>
            <p className="text-slate-400 text-sm">Universal Translation Messenger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Choose Avatar</label>
            <div className="flex gap-3 justify-center flex-wrap">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 text-2xl rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    avatar === emoji 
                      ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-500/40 rotate-3' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-black/20 text-white rounded-2xl pl-12 pr-4 py-3 border border-white/10 focus:border-indigo-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">I speak</label>
            <div className="relative">
                <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-black/20 text-white rounded-2xl px-5 py-3 border border-white/10 focus:border-indigo-500/50 focus:bg-black/40 outline-none transition-all appearance-none cursor-pointer hover:bg-white/5"
                >
                {Object.values(Language).map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
                ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/25 mt-4 group"
          >
            Start Messaging <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};