import React, { useEffect, useRef, useState } from 'react';
import { MicOff, Move } from 'lucide-react';
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

  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Pointer Events for Dragging (Works for Touch & Mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    // Calculate offset based on current translate position
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling on mobile
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // For 1:1, we assume the first participant is the main "remote" user
  const remoteUser = participants[0];

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      
      {/* 1. Remote Participant (Full Screen / Centered) */}
      {remoteUser ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 pointer-events-none">
            {/* Simulation of Remote Video Feed */}
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-500 relative">
               
               {/* Soft Ambient Glow when speaking */}
               <div className={`absolute inset-0 bg-indigo-500/10 transition-opacity duration-1000 ${speakingUserId === remoteUser.id ? 'opacity-100' : 'opacity-0'}`} />
               
               {/* Avatar Container */}
               <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 transition-all duration-500">
                   <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-6xl sm:text-8xl md:text-9xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 ${speakingUserId === remoteUser.id ? 'scale-110 shadow-indigo-500/20 border-indigo-500/30' : 'scale-100'}`}>
                      {/* Inner Glow */}
                      {speakingUserId === remoteUser.id && (
                          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
                      )}
                      <span className="relative z-10 drop-shadow-2xl filter">{remoteUser.avatar}</span>
                   </div>
                   
                   <div className="text-center px-4">
                       <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight drop-shadow-xl">{remoteUser.name}</h2>
                       <div className={`mt-3 md:mt-4 inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-md border transition-all duration-500 ${speakingUserId === remoteUser.id ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${speakingUserId === remoteUser.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span className="text-[10px] sm:text-xs font-medium tracking-wide uppercase">{remoteUser.language}</span>
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

      {/* 2. Local User (Draggable Floating Card) */}
      <div 
        className="absolute z-30 touch-none"
        style={{ 
            // Initial position: Bottom-Right, offset by drag
            bottom: '6rem', 
            right: '1rem',
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={`w-28 sm:w-32 md:w-40 aspect-[3/4] bg-black/40 backdrop-blur-xl rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200 hover:border-white/30 group ${isDragging ? 'scale-105 ring-2 ring-indigo-500/50' : ''}`}>
            {localStream && isVideoEnabled ? (
                <video
                ref={localVideoRef}
                autoPlay
                muted={true}
                playsInline
                className="w-full h-full object-cover scale-x-[-1] opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 pointer-events-none">
                    <span className="text-3xl md:text-4xl filter drop-shadow-lg">{currentUser.avatar}</span>
                </div>
            )}
            
            {/* Status Icons */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none gap-1">
                {!isAudioEnabled && (
                    <div className="bg-red-500/80 backdrop-blur-sm p-1.5 rounded-full text-white shadow-lg">
                        <MicOff size={12} />
                    </div>
                )}
            </div>

            {/* Drag Handle Indicator (Visible on hover/active) */}
            <div className="absolute top-2 right-2 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Move size={12} className="text-white/70" />
            </div>
        </div>
      </div>
    </div>
  );
};