import React, { useState } from 'react';
import { User, Group } from '../types';
import { Users, Search, MessageSquarePlus, Video, Trash2, Phone, Bell, Check } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  contacts: User[];
  groups: Group[];
  onJoinGroup: (group: Group) => void;
  onCreateGroup: (name: string, members: User[]) => void;
  onDeleteGroup: (groupId: string) => void;
  onDirectCall: (contact: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  contacts,
  groups,
  onJoinGroup,
  onCreateGroup,
  onDeleteGroup,
  onDirectCall
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    if (!newGroupName.trim() || selectedContacts.length === 0) return;
    const members = contacts.filter(c => selectedContacts.includes(c.id));
    onCreateGroup(newGroupName, [...members, currentUser]);
    setIsCreating(false);
    setNewGroupName('');
    setSelectedContacts([]);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden text-slate-100 font-light">
      {/* Sidebar - Contacts (Hidden on Mobile) */}
      <div className="w-80 bg-slate-900/50 border-r border-white/5 flex flex-col hidden md:flex backdrop-blur-sm">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
                <span className="text-4xl filter drop-shadow-lg">{currentUser.avatar}</span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <h2 className="font-medium text-white text-lg tracking-wide">{currentUser.name}</h2>
              <p className="text-xs text-indigo-300 uppercase tracking-widest mt-1">{currentUser.language}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-indigo-600/90 hover:bg-indigo-500 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
          >
            <MessageSquarePlus size={18} /> <span className="font-medium text-sm">New Group</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Contacts</h3>
             <Bell size={12} className="text-slate-600" />
          </div>
          <div className="space-y-1">
            {contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-full">{contact.avatar}</span>
                    <div>
                    <p className="text-sm font-medium text-slate-200">{contact.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{contact.language}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onDirectCall(contact)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-green-500 hover:text-white"
                    title="Start Call"
                >
                    <Phone size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />
        
        {/* Header - Stacks on mobile */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-10">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-light tracking-tight text-white">Chats</h1>
             {/* Mobile Only 'New' Button */}
             <button onClick={() => setIsCreating(true)} className="md:hidden p-2 bg-indigo-600 rounded-full text-white">
                <MessageSquarePlus size={20} />
             </button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:bg-white/10 focus:border-indigo-500/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-white/5 rounded-3xl mx-2">
              <MessageSquarePlus size={48} className="mb-4 opacity-30" />
              <p className="font-light">No active conversations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20 md:pb-0">
              {filteredGroups.map(group => (
                <div key={group.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 md:p-6 hover:bg-white/[0.04] transition-all group relative hover:shadow-2xl hover:shadow-indigo-500/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 shrink-0">
                        <Users size={22} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-white text-base md:text-lg tracking-wide truncate">{group.name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{group.members.length} participants</p>
                      </div>
                    </div>
                    <button 
                       onClick={() => onDeleteGroup(group.id)}
                       className="text-slate-600 hover:text-red-400 p-2 transition-all rounded-full hover:bg-white/5"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 md:mt-8">
                     <div className="flex -space-x-3 overflow-hidden">
                        {group.members.slice(0, 4).map((m, i) => (
                           <div key={i} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center text-sm md:text-lg shadow-lg shrink-0" title={m.name}>
                              {m.avatar}
                           </div>
                        ))}
                     </div>
                     <button 
                        onClick={() => onJoinGroup(group)}
                        className="bg-white/5 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/30 px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap"
                     >
                        <Video size={16} strokeWidth={2} /> <span className="hidden sm:inline">Join Call</span> <span className="sm:hidden">Join</span>
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Soft Modal for Create Group - Mobile Responsive */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl md:text-2xl font-light text-white mb-6">New Group Chat</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Project Alpha Team" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:bg-black/30 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Participants</label>
                <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-black/20 p-2 scrollbar-hide">
                   {contacts.map(contact => (
                      <div 
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-all rounded-lg mb-1 ${selectedContacts.includes(contact.id) ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedContacts.includes(contact.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                            {selectedContacts.includes(contact.id) && <Check size={12} className="text-white" />}
                         </div>
                         <span className="text-lg">{contact.avatar}</span>
                         <span className="text-sm text-slate-200">{contact.name}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newGroupName.trim() || selectedContacts.length === 0}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};