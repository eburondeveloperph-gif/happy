import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Globe, History } from 'lucide-react';
import { Language } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface ControlBarProps {
  isMicOn: boolean;
  isVideoOn: boolean;
  isTranslating: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  myLanguage: Language;
  onMyLanguageChange: (lang: Language) => void;
  localStream: MediaStream | null;
  onToggleHistory: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMicOn,
  isVideoOn,
  isTranslating,
  onToggleMic,
  onToggleVideo,
  onEndCall,
  myLanguage,
  onMyLanguageChange,
  localStream,
  onToggleHistory
}) => {
  return (
    <div className="absolute bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
        {/* Main Floating Dock */}
        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-full px-4 py-3 sm:py-2 shadow-2xl pointer-events-auto w-full max-w-sm sm:max-w-lg">
          
          {/* Mobile: Strict 5-Col Grid for perfect alignment. Desktop: Flex */}
          <div className="grid grid-cols-5 gap-2 items-center justify-items-center sm:flex sm:justify-between sm:gap-4">
            
            {/* 1. History (Preserved) */}
            <button
              onClick={onToggleHistory}
              className="w-12 h-12 flex items-center justify-center rounded-2xl sm:rounded-full bg-white/5 hover:bg-white/10 text-slate-200 transition-all active:scale-95 border border-transparent hover:border-white/5"
              title="View History"
            >
              <History size={20} strokeWidth={2} />
            </button>

            {/* 2. Language */}
            <div className="relative group flex justify-center w-full">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl sm:rounded-full bg-white/5 hover:bg-white/10 text-slate-200 transition-all active:scale-95 border border-transparent hover:border-white/5">
                  <Globe size={20} strokeWidth={2} />
              </button>
              
              {/* Popup Menu */}
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-64 max-w-[80vw] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden hidden group-hover:block animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                  <div className="p-3 border-b border-white/5 bg-white/5">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center sm:text-left">Incoming Language</p>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1 scrollbar-hide">
                      {Object.values(Language).map((lang) => (
                          <button 
                              key={lang} 
                              onClick={() => onMyLanguageChange(lang)}
                              className={`w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-white/10 transition-all ${myLanguage === lang ? 'text-white bg-indigo-600/30 font-medium' : 'text-slate-300 font-light'}`}
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
              </div>
            </div>

            {/* 3. Mic */}
            <button
              onClick={onToggleMic}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl sm:rounded-full transition-all duration-300 active:scale-95 ${
                isMicOn 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-transparent hover:border-white/5' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
            >
              {isMicOn ? <Mic size={20} strokeWidth={2} /> : <MicOff size={20} strokeWidth={2} />}
            </button>

            {/* 4. Video */}
            <button
              onClick={onToggleVideo}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl sm:rounded-full transition-all duration-300 active:scale-95 ${
                isVideoOn 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-transparent hover:border-white/5' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
            >
              {isVideoOn ? <Video size={20} strokeWidth={2} /> : <VideoOff size={20} strokeWidth={2} />}
            </button>

            {/* 5. End Call */}
            <button
              onClick={onEndCall}
              className="w-12 h-12 flex items-center justify-center rounded-2xl sm:rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
            >
              <PhoneOff size={22} strokeWidth={2} fill="currentColor" />
            </button>

            {/* Visualizer (Desktop Only) */}
            <div className="hidden sm:flex w-24 md:w-32 h-10 sm:h-12 bg-black/20 rounded-full items-center justify-center border border-white/5 overflow-hidden px-2 relative ml-2">
                  <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isMicOn ? 'bg-indigo-500 blur-lg' : ''}`}></div>
                  {localStream && isMicOn ? (
                      <div className="relative z-10 opacity-90 scale-75 sm:scale-100">
                        <AudioVisualizer stream={localStream} isActive={isMicOn} color={isTranslating ? '#c4b5fd' : '#818cf8'} />
                      </div>
                  ) : (
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest relative z-10">Muted</div>
                  )}
            </div>

          </div>
        </div>
    </div>
  );
};