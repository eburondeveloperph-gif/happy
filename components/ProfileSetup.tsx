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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <AudioWaveform className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Orbitz</h1>
        </div>

        <h2 className="text-xl font-semibold text-white mb-6 text-center">Join the conversation</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">Choose Avatar</label>
            <div className="flex gap-2 justify-center flex-wrap">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 text-2xl rounded-full flex items-center justify-center transition-all ${
                    avatar === emoji 
                      ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-500/30' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Primary Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {Object.values(Language).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            Start Messaging <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};