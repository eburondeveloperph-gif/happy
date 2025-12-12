import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoStage } from './components/VideoStage';
import { ControlBar } from './components/ControlBar';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { CallHistory } from './components/CallHistory';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { Language, ChatMessage, User, Group, MessageStatus } from './types';
import { getSpeechRecognitionLanguage } from './utils/languageUtils';
import { translateAndSpeak, translateText, generateConversationReply } from './services/geminiService';
import { decodeBase64, decodeAudioData } from './services/audioUtils';
import { audioQueue } from './services/audioQueue';
import { ArrowLeft, AudioWaveform } from 'lucide-react';

// Mock Contacts Data
const MOCK_CONTACTS: User[] = [
  { id: 'u2', name: 'Alice', avatar: '👩‍🎨', language: Language.SPANISH },
  { id: 'u3', name: 'Bob', avatar: '👨‍🚀', language: Language.FRENCH },
  { id: 'u4', name: 'Kenji', avatar: '🧑‍🍳', language: Language.JAPANESE },
  { id: 'u5', name: 'Marta', avatar: '👩‍⚖️', language: Language.GERMAN },
  { id: 'u6', name: 'Wang', avatar: '👨‍🔬', language: Language.CHINESE_MANDARIN },
  { id: 'u7', name: 'Maria', avatar: '👩‍🏫', language: Language.TAGALOG },
  { id: 'u8', name: 'Lina', avatar: '👩‍⚕️', language: Language.CEBUANO },
  { id: 'u9', name: 'Raj', avatar: '👨‍💻', language: Language.HINDI },
];

export default function App() {
  // Navigation State
  const [view, setView] = useState<'profile' | 'dashboard' | 'call'>('profile');
  const [showHistory, setShowHistory] = useState(false);
  
  // Data State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // Call State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speakingUserId, setSpeakingUserId] = useState<string | null>(null);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Helpers
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const participants = activeGroup ? activeGroup.members.filter(m => m.id !== currentUser?.id) : [];

  // Initialize Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioQueue.setAudioContext(audioCtxRef.current);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // --- Profile & Dashboard Handlers ---

  const handleProfileComplete = (user: User) => {
    setCurrentUser(user);
    const demoGroup: Group = {
      id: 'g1',
      name: 'Global Team Meeting',
      members: [user, MOCK_CONTACTS[0]],
      messages: [],
      lastActive: Date.now()
    };
    setGroups([demoGroup]);
    setView('dashboard');
  };

  const handleCreateGroup = (name: string, members: User[]) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      members,
      messages: [],
      lastActive: Date.now()
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const handleJoinGroup = (group: Group) => {
    setActiveGroupId(group.id);
    setView('call');
    setShowHistory(false); // Reset history view on join
    startCamera();
  };

  const handleDirectCall = (contact: User) => {
    if (!currentUser) return;
    const existingGroup = groups.find(g => 
        g.members.length === 2 && 
        g.members.some(m => m.id === contact.id) && 
        g.members.some(m => m.id === currentUser.id)
    );

    if (existingGroup) {
        handleJoinGroup(existingGroup);
    } else {
        const newGroup: Group = {
            id: Date.now().toString(),
            name: contact.name, 
            members: [currentUser, contact],
            messages: [],
            lastActive: Date.now()
        };
        setGroups(prev => [newGroup, ...prev]);
        setActiveGroupId(newGroup.id);
        setView('call');
        startCamera();
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    audioQueue.clear();
    setView('dashboard');
    setActiveGroupId(null);
    setShowHistory(false);
  };

  const handleMyLanguageChange = (lang: Language) => {
      if (currentUser) {
          setCurrentUser({ ...currentUser, language: lang });
      }
  };

  // --- Media & Call Logic ---

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        }
      });
      setLocalStream(stream);
    } catch (err) {
      console.error("Error accessing media devices", err);
    }
  };

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = isVideoOn);
      localStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
    }
  }, [isVideoOn, isMicOn, localStream]);

  // --- Message Handling & Translation ---

  const updateGroupMessages = useCallback((groupId: string, message: ChatMessage) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        messages: [...g.messages, message],
        lastActive: Date.now()
      };
    }));
  }, []);

  const updateMessageStatus = useCallback((groupId: string, messageId: string, status: MessageStatus) => {
    setGroups(prev => prev.map(g => {
        if(g.id !== groupId) return g;
        return {
            ...g,
            messages: g.messages.map(m => m.id === messageId ? {...m, status} : m)
        }
    }))
  }, []);

  // 1. Handle MY Speech
  const handleFinalTranscript = useCallback(async (text: string) => {
    if (!text.trim() || !activeGroupId || !currentUser) return;
    
    // VISUAL: Show that I am speaking
    setSpeakingUserId(currentUser.id);
    
    const messageId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: messageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: text,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // Log to history
    updateGroupMessages(activeGroupId, newMessage);
    setTimeout(() => updateMessageStatus(activeGroupId, messageId, 'sent'), 500);

    try {
      const targetUser = participants[0]; // 1:1 assumption
      if (targetUser && targetUser.language !== currentUser.language) {
         const translatedForThem = await translateText(text, targetUser.language);
         if (translatedForThem) {
             setGroups(prev => prev.map(g => {
                 if (g.id !== activeGroupId) return g;
                 return {
                     ...g,
                     messages: g.messages.map(m => m.id === messageId ? { ...m, translatedText: translatedForThem } : m)
                 };
             }));
         }
      }

      // Trigger Reply
      triggerRemoteReply(text, activeGroupId);

    } catch (err) {
      console.error("Processing error", err);
    } finally {
      setTimeout(() => setSpeakingUserId(null), 1500);
    }
  }, [activeGroupId, currentUser, participants, updateGroupMessages, updateMessageStatus]);


  // 2. Handle THEIR Speech (Simulation)
  const triggerRemoteReply = async (userText: string, groupId: string) => {
      const targetUser = participants[0];
      if (!currentUser || !targetUser) return;

      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsTranslating(true);
      setSpeakingUserId(targetUser.id);

      try {
          // A. Generate Reply
          const remoteReplyText = await generateConversationReply(userText, targetUser.name, targetUser.language);
          
          if (remoteReplyText) {
              const replyId = Date.now().toString();
              const replyMessage: ChatMessage = {
                  id: replyId,
                  senderId: targetUser.id,
                  senderName: targetUser.name,
                  text: remoteReplyText,
                  timestamp: Date.now(),
                  status: 'delivered'
              };
              
              updateGroupMessages(groupId, replyMessage);

              // B. Translate & Speak
              const result = await translateAndSpeak(remoteReplyText, currentUser.language, true);

              if (result) {
                  setGroups(prev => prev.map(g => {
                      if (g.id !== groupId) return g;
                      return {
                          ...g,
                          messages: g.messages.map(m => m.id === replyId ? { ...m, translatedText: result.translatedText } : m)
                      };
                  }));

                  if (result.audioData) {
                      initAudio();
                      if (audioCtxRef.current) {
                          const rawBytes = decodeBase64(result.audioData);
                          const audioBuffer = await decodeAudioData(rawBytes, audioCtxRef.current);
                          audioQueue.enqueue(audioBuffer);
                      }
                  }
              }
          }
      } catch (e) {
          console.error("Remote reply error", e);
      } finally {
          setIsTranslating(false);
          setTimeout(() => setSpeakingUserId(null), 1000);
      }
  };

  const { 
    isListening, 
    startListening, 
    stopListening, 
  } = useSpeechRecognition(
    currentUser ? getSpeechRecognitionLanguage(currentUser.language) : 'en-US', 
    handleFinalTranscript
  );

  useEffect(() => {
    if (view === 'call' && isMicOn) {
      startListening();
    } else {
      stopListening();
    }
  }, [view, isMicOn, startListening, stopListening]);


  // --- Render Views ---

  if (view === 'profile') {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (view === 'dashboard' && currentUser) {
    return (
      <Dashboard 
        currentUser={currentUser}
        contacts={MOCK_CONTACTS}
        groups={groups}
        onJoinGroup={handleJoinGroup}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
        onDirectCall={handleDirectCall}
      />
    );
  }

  // --- Call View ---
  if (!currentUser || !activeGroup) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden" onClick={initAudio}>
      
      {/* Sleek Header (Floating) */}
      <header className="absolute top-0 left-0 right-0 h-24 flex items-start pt-6 justify-between px-6 z-40 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <button onClick={handleEndCall} className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-full transition-colors text-white border border-white/5">
             <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-light tracking-tight text-white drop-shadow-md">{activeGroup.name}</h1>
                 {isListening && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />}
             </div>
             <p className="text-xs text-white/60 font-light tracking-wide">
                 Orbitz Secure Audio • {participants.length === 1 ? participants[0].language : 'Conference'}
             </p>
          </div>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-xl rounded-full border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
           <AudioWaveform className="w-4 h-4 text-indigo-300" />
           <span className="text-xs font-medium text-indigo-100 uppercase tracking-widest">Live</span>
        </div>
      </header>

      {/* Main Content Area - Clean, Full Screen */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-950">
        <VideoStage 
          localStream={localStream}
          isVideoEnabled={isVideoOn}
          isAudioEnabled={isMicOn}
          currentUser={currentUser}
          participants={participants}
          speakingUserId={speakingUserId}
        />
        
        {/* History Modal Overlay */}
        {showHistory && (
            <CallHistory 
                group={activeGroup} 
                currentUser={currentUser} 
                onClose={() => setShowHistory(false)} 
            />
        )}
      </div>

      {/* Controls */}
      <ControlBar 
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        isTranslating={isTranslating}
        onToggleMic={() => setIsMicOn(!isMicOn)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onEndCall={handleEndCall}
        myLanguage={currentUser.language}
        onMyLanguageChange={handleMyLanguageChange}
        localStream={localStream}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />
    </div>
  );
}