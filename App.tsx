import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoStage } from './components/VideoStage';
import { ControlBar } from './components/ControlBar';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { Language, ChatMessage, User, Group, MessageStatus } from './types';
import { getSpeechRecognitionLanguage } from './utils/languageUtils';
import { translateAndSpeak, translateText, generateConversationReply } from './services/geminiService';
import { decodeBase64, decodeAudioData } from './services/audioUtils';
import { audioQueue } from './services/audioQueue';
import { MessageSquare, Sparkles, ArrowLeft, Check, CheckCheck } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  const handleMyLanguageChange = (lang: Language) => {
      if (currentUser) {
          setCurrentUser({ ...currentUser, language: lang });
      }
  };

  // --- Media & Call Logic ---

  const startCamera = async () => {
    try {
      // Voice Focus: Advanced Audio Constraints
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
    
    updateGroupMessages(activeGroupId, newMessage);
    
    // DELAYS: Simulate network
    setTimeout(() => updateMessageStatus(activeGroupId, messageId, 'sent'), 500);
    setTimeout(() => updateMessageStatus(activeGroupId, messageId, 'delivered'), 1000);

    // LOGIC: I speak -> Translate to Target Language for Visuals -> NO AUDIO for me.
    // The "Other Person" logic is simulated below.
    try {
      const targetUser = participants[0]; // 1:1 assumption
      if (targetUser && targetUser.language !== currentUser.language) {
         // Translate my text to THEIR language just for the record/visuals (if we were showing their view)
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

      // TRIGGER REMOTE REPLY (Simulation of 1:1 conversation)
      // This is what generates the audio I WILL hear.
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

      // Wait a bit to simulate thinking/network
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsTranslating(true);
      setSpeakingUserId(targetUser.id); // Visual indicator on their video

      try {
          // A. Generate Reply in THEIR language
          const remoteReplyText = await generateConversationReply(userText, targetUser.name, targetUser.language);
          
          if (remoteReplyText) {
              const replyId = Date.now().toString();
              const replyMessage: ChatMessage = {
                  id: replyId,
                  senderId: targetUser.id,
                  senderName: targetUser.name,
                  text: remoteReplyText, // This is in Spanish/French etc.
                  timestamp: Date.now(),
                  status: 'delivered'
              };
              
              updateGroupMessages(groupId, replyMessage);

              // B. Translate Reply to MY language AND Generate Audio
              const result = await translateAndSpeak(remoteReplyText, currentUser.language, true);

              if (result) {
                  // Update UI with translation
                  setGroups(prev => prev.map(g => {
                      if (g.id !== groupId) return g;
                      return {
                          ...g,
                          messages: g.messages.map(m => m.id === replyId ? { ...m, translatedText: result.translatedText } : m)
                      };
                  }));

                  // C. PLAY AUDIO (Queue) - This is the ONLY audio I hear
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

  // Use dynamic language for Speech Recognition
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript: interimTranscript 
  } = useSpeechRecognition(
    currentUser ? getSpeechRecognitionLanguage(currentUser.language) : 'en-US', 
    handleFinalTranscript
  );

  // Mic Logic
  useEffect(() => {
    if (view === 'call' && isMicOn) {
      startListening();
    } else {
      stopListening();
    }
  }, [view, isMicOn, startListening, stopListening]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroup?.messages, interimTranscript]);


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
      
      {/* Messenger Header */}
      <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <button onClick={handleEndCall} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full transition-colors text-white">
             <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col shadow-sm">
             <h1 className="text-lg font-bold tracking-tight text-white drop-shadow-md">{activeGroup.name}</h1>
             <div className="flex items-center gap-2 text-xs text-white/80 drop-shadow-md">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 {participants.length === 1 ? participants[0].language : 'Group Call'}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Fullscreen Style */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Stage (Remote) */}
        <div className="flex-1 bg-slate-900 relative">
            <VideoStage 
              localStream={localStream}
              isVideoEnabled={isVideoOn}
              isAudioEnabled={isMicOn}
              currentUser={currentUser}
              participants={participants}
              speakingUserId={speakingUserId}
            />
            
            {/* Overlay Transcript (Subtitles style) */}
            <div className="absolute bottom-32 left-0 right-0 px-6 flex flex-col items-center gap-2 z-10 pointer-events-none">
                {/* Remote Speaking Indicator & Text */}
                {speakingUserId && speakingUserId !== currentUser.id && (
                     <div className="max-w-2xl w-full">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs border border-white/20 shadow-lg">
                              {participants[0]?.avatar}
                           </div>
                           <span className="text-xs font-bold text-white/80 shadow-black drop-shadow-md">{participants[0]?.name}</span>
                        </div>
                        {activeGroup.messages.length > 0 && activeGroup.messages[activeGroup.messages.length - 1].senderId !== currentUser.id && (
                             <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shadow-xl">
                                  <p className="text-lg font-medium text-white">
                                      {activeGroup.messages[activeGroup.messages.length - 1].translatedText || activeGroup.messages[activeGroup.messages.length - 1].text}
                                  </p>
                                  {activeGroup.messages[activeGroup.messages.length - 1].translatedText && (
                                     <p className="text-xs text-white/50 mt-1">
                                        (Original: {activeGroup.messages[activeGroup.messages.length - 1].text})
                                     </p>
                                  )}
                             </div>
                        )}
                     </div>
                )}
                
                {/* My Live Transcript */}
                {isListening && interimTranscript && (
                    <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-indigo-500/30 text-indigo-200 text-lg font-medium shadow-xl">
                         {interimTranscript}...
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar (Hidden on Mobile/Messenger Style, strictly speaking, but keeping visible for desktop history) */}
        {/* We can hide this for a cleaner "Messenger Call" look, or make it toggleable. 
            For this request "Make UI like messenger call", full screen video is key. 
            I will hide the sidebar to maximize the view, relying on the overlay subtitles. */}
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
      />
    </div>
  );
}