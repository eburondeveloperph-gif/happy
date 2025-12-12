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
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
      
      {/* 1. Remote Participant (Full Screen) */}
      {remoteUser ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Simulation of Remote Video Feed */}
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500 relative">
               {/* Ambient Background Glow when speaking */}
               {speakingUserId === remoteUser.id && (
                  <div className="absolute inset-0 bg-indigo-900/20 animate-pulse z-0" />
               )}
               
               <div className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center text-8xl bg-slate-700 border-8 transition-all duration-300 ${speakingUserId === remoteUser.id ? 'border-indigo-500 scale-105 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'border-slate-600'}`}>
                  {remoteUser.avatar}
               </div>
               
               <div className="relative z-10 mt-8 text-center">
                   <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">{remoteUser.name}</h2>
                   <p className="text-indigo-300 mt-2 font-medium bg-black/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                      Speaking {remoteUser.language}
                   </p>
               </div>
            </div>
        </div>
      ) : (
        <div className="text-slate-500 flex flex-col items-center">
           <div className="animate-pulse mb-4">Waiting for connection...</div>
        </div>
      )}

      {/* 2. Local User (Floating Messenger Style) */}
      <div className="absolute bottom-32 right-6 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-20 transition-all hover:scale-105 hover:border-white/20">
         {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted={true}
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-700">
                <span className="text-4xl">{currentUser.avatar}</span>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
             {!isAudioEnabled && (
                <div className="bg-red-500/90 p-1.5 rounded-full text-white shadow-sm">
                   <MicOff size={12} />
                </div>
             )}
          </div>
      </div>
    </div>
  );
};