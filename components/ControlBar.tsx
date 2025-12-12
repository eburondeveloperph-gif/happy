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
    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 pl-3 pr-3 shadow-2xl flex items-center gap-3 pointer-events-auto transition-all duration-500 hover:bg-black/50 hover:border-white/20 hover:scale-[1.01] hover:shadow-indigo-500/10">
          
          {/* Language Selector */}
          <div className="relative group">
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300">
                <Globe size={20} strokeWidth={1.5} />
             </button>
             {/* Popup Menu */}
             <div className="absolute bottom-full left-0 mb-4 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden hidden group-hover:block animate-in slide-in-from-bottom-2 fade-in duration-200 origin-bottom-left">
                 <div className="p-4 border-b border-white/5 bg-white/5">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Incoming Audio Language</p>
                    <p className="text-[10px] text-slate-400 mt-1">Select the language you want to hear.</p>
                 </div>
                 <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                    {Object.values(Language).map((lang) => (
                        <button 
                            key={lang} 
                            onClick={() => onMyLanguageChange(lang)}
                            className={`w-full text-left px-4 py-3 text-sm rounded-2xl hover:bg-white/10 transition-all ${myLanguage === lang ? 'text-white bg-indigo-600/20 font-medium' : 'text-slate-300 font-light'}`}
                        >
                            {lang}
                        </button>
                    ))}
                 </div>
             </div>
          </div>
          
           {/* History Button */}
          <button
            onClick={onToggleHistory}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
            title="View History"
          >
            <History size={20} strokeWidth={1.5} />
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Visualizer (Center piece) */}
          <div className="w-32 h-12 bg-black/20 rounded-full flex items-center justify-center border border-white/5 overflow-hidden px-2 relative group">
             {/* Glow effect behind visualizer */}
             <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isMicOn ? 'bg-indigo-500 blur-xl' : ''}`}></div>
             
             {localStream && isMicOn ? (
                 <div className="relative z-10 opacity-80">
                    <AudioVisualizer stream={localStream} isActive={isMicOn} color={isTranslating ? '#c4b5fd' : '#818cf8'} />
                 </div>
             ) : (
                 <div className="text-[10px] text-slate-500 uppercase font-medium tracking-widest relative z-10">Muted</div>
             )}
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Mic */}
          <button
            onClick={onToggleMic}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
              isMicOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isMicOn ? <Mic size={22} strokeWidth={1.5} /> : <MicOff size={22} strokeWidth={1.5} />}
          </button>

          {/* Video */}
          <button
            onClick={onToggleVideo}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
              isVideoOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isVideoOn ? <Video size={22} strokeWidth={1.5} /> : <VideoOff size={22} strokeWidth={1.5} />}
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 transition-all duration-300 ml-2 hover:scale-105"
          >
            <PhoneOff size={24} strokeWidth={1.5} />
          </button>
        </div>
    </div>
  );
};