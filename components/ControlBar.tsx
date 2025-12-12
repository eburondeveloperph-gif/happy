import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Globe } from 'lucide-react';
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
  localStream
}) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-4 pointer-events-auto">
          
          {/* Language Selector */}
          <div className="relative group">
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                <Globe size={20} />
             </button>
             {/* Popup Menu */}
             <div className="absolute bottom-full left-0 mb-3 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block">
                 <div className="p-3 bg-slate-800/50 border-b border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase">I want to hear:</p>
                 </div>
                 <div className="max-h-60 overflow-y-auto p-1 scrollbar-hide">
                    {Object.values(Language).map((lang) => (
                        <button 
                            key={lang} 
                            onClick={() => onMyLanguageChange(lang)}
                            className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors ${myLanguage === lang ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                        >
                            {lang}
                        </button>
                    ))}
                 </div>
             </div>
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Mic */}
          <button
            onClick={onToggleMic}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMicOn 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-white text-black'
            }`}
          >
            {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          {/* Visualizer (Center piece) */}
          <div className="w-32 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden">
             {localStream && isMicOn ? (
                 <AudioVisualizer stream={localStream} isActive={isMicOn} color={isTranslating ? '#a78bfa' : '#4ade80'} />
             ) : (
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Muted</div>
             )}
          </div>

          {/* Video */}
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              isVideoOn 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-white text-black'
            }`}
          >
            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all duration-200"
          >
            <PhoneOff size={22} />
          </button>
        </div>
    </div>
  );
};