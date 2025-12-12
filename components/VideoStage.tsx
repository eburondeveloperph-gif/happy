import React, { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';
import { User } from '../types';

interface VideoStageProps {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  currentUser: User;
  participants: User[]; // Remote participants
  speakingUserId?: string;
}

export const VideoStage: React.FC<VideoStageProps> = ({ 
  localStream, 
  isVideoEnabled, 
  isAudioEnabled, 
  currentUser,
  participants,
  speakingUserId
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // For 1:1, we assume the first participant is the main "remote" user
  const remoteUser = participants[0];

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      
      {/* 1. Remote Participant (Full Screen) */}
      {remoteUser ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700">
            {/* Simulation of Remote Video Feed */}
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-500 relative">
               
               {/* Soft Ambient Glow when speaking */}
               <div className={`absolute inset-0 bg-indigo-500/10 transition-opacity duration-1000 ${speakingUserId === remoteUser.id ? 'opacity-100' : 'opacity-0'}`} />
               
               {/* Avatar Container */}
               <div className="relative z-10 flex flex-col items-center gap-8">
                   <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-8xl md:text-9xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 ${speakingUserId === remoteUser.id ? 'scale-110 shadow-indigo-500/20 border-indigo-500/30' : 'scale-100'}`}>
                      {/* Inner Glow */}
                      {speakingUserId === remoteUser.id && (
                          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
                      )}
                      <span className="relative z-10 drop-shadow-2xl filter">{remoteUser.avatar}</span>
                   </div>
                   
                   <div className="text-center">
                       <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight drop-shadow-xl">{remoteUser.name}</h2>
                       <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border transition-all duration-500 ${speakingUserId === remoteUser.id ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${speakingUserId === remoteUser.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span className="text-xs font-medium tracking-wide uppercase">{remoteUser.language}</span>
                       </div>
                   </div>
               </div>
            </div>
        </div>
      ) : (
        <div className="text-slate-500 flex flex-col items-center">
           <div className="animate-pulse mb-4 font-light tracking-widest uppercase text-xs">Waiting for connection...</div>
        </div>
      )}

      {/* 2. Local User (Floating Soft Card) */}
      <div className="absolute top-6 right-6 w-32 md:w-40 aspect-[3/4] bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-20 transition-all duration-500 hover:scale-105 hover:border-white/30 group">
         {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted={true}
              playsInline
              className="w-full h-full object-cover scale-x-[-1] opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                <span className="text-4xl filter drop-shadow-lg">{currentUser.avatar}</span>
            </div>
          )}
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
             {!isAudioEnabled && (
                <div className="bg-red-500/80 backdrop-blur-sm p-2 rounded-full text-white shadow-lg">
                   <MicOff size={14} />
                </div>
             )}
          </div>
      </div>
    </div>
  );
};