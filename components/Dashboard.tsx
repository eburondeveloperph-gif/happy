import React, { useState } from 'react';
import { User, Group } from '../types';
import { Users, Search, MessageSquarePlus, Video, Trash2, Phone } from 'lucide-react';

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
    // Add current user to group automatically
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
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Sidebar - Contacts */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div>
              <h2 className="font-bold text-white">{currentUser.name}</h2>
              <p className="text-xs text-slate-400">{currentUser.language}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquarePlus size={18} /> New Group Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contacts</h3>
          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-3">
                    <span className="text-xl bg-slate-800 w-10 h-10 flex items-center justify-center rounded-full">{contact.avatar}</span>
                    <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-slate-400">{contact.language}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onDirectCall(contact)}
                    className="p-2 bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-500"
                    title="Start Call"
                >
                    <Phone size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Groups List */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">Chats</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <MessageSquarePlus size={48} className="mb-4 opacity-50" />
              <p>No active conversations.</p>
              <p className="text-sm">Create a group to start bridging languages!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGroups.map(group => (
                <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{group.name}</h3>
                        <p className="text-xs text-slate-400">{group.members.length} participants</p>
                      </div>
                    </div>
                    <button 
                       onClick={() => onDeleteGroup(group.id)}
                       className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                     <div className="flex -space-x-2">
                        {group.members.slice(0, 4).map((m, i) => (
                           <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-sm" title={m.name}>
                              {m.avatar}
                           </div>
                        ))}
                        {group.members.length > 4 && (
                           <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
                              +{group.members.length - 4}
                           </div>
                        )}
                     </div>
                     <button 
                        onClick={() => onJoinGroup(group)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                     >
                        <Video size={16} /> Join Call
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">New Group Chat</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Project Alpha Team" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Select Participants</label>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950">
                   {contacts.map(contact => (
                      <div 
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedContacts.includes(contact.id) ? 'bg-blue-900/30' : 'hover:bg-slate-900'}`}
                      >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedContacts.includes(contact.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                            {selectedContacts.includes(contact.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                         </div>
                         <span className="text-lg">{contact.avatar}</span>
                         <span className="text-sm text-white">{contact.name}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newGroupName.trim() || selectedContacts.length === 0}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};