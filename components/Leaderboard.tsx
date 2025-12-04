
import React, { useState, useEffect, useMemo } from 'react';
import { Friend } from '../types';
import { X, Trophy, Moon, Sun, Zap, UserPlus } from 'lucide-react';
import { generateGlobalLeaderboard } from '../services/dataService';
import InviteFriendModal from './InviteFriendModal';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  currentUser: Friend | null;
  onOpenLogin?: () => void;
}

type Tab = 'friends' | 'global';
type Metric = 'owl' | 'early';

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, friends, currentUser, onOpenLogin = () => {} }) => {
  // Default to 'global' if user is not logged in
  const [activeTab, setActiveTab] = useState<Tab>(currentUser ? 'friends' : 'global');
  const [metric, setMetric] = useState<Metric>('owl');
  const [globalData, setGlobalData] = useState<Friend[]>([]);
  const [localFriends, setLocalFriends] = useState<Friend[]>(friends);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Update activeTab when user logs in
  React.useEffect(() => {
    if (currentUser && activeTab === 'global') {
      setActiveTab('friends');
    } else if (!currentUser) {
      setActiveTab('global');
    }
  }, [currentUser]);

  useEffect(() => {
    setGlobalData(generateGlobalLeaderboard());
  }, []);

  useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  const handleAddFriend = () => {
    // Invite friends requires login, but user should already be logged in to see leaderboard
    setIsInviteModalOpen(true);
  };

  const getMinutesFromMidnight = (timeStr?: string) => {
    if (!timeStr) return -1;
    const [h, m] = timeStr.split(':').map(Number);
    if (h < 12) return (h + 24) * 60 + m;
    return h * 60 + m;
  };

  const getMinutesFromMidnightForWake = (timeStr?: string) => {
    if (!timeStr) return -1;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m; // 直接返回分钟数，不需要+24，因为起床时间通常是早上
  };

  const sortedList = useMemo(() => {
    const baseList = activeTab === 'friends' ? localFriends : globalData;
    const combined = currentUser ? [...baseList, currentUser] : baseList;
    
    return combined.sort((a, b) => {
      if (metric === 'owl') {
         const timeA = getMinutesFromMidnight(a.bedTime);
         const timeB = getMinutesFromMidnight(b.bedTime);
         if (timeA === -1) return 1;
         if (timeB === -1) return -1;
         return timeB - timeA; // 越晚睡觉排名越高
      } else { // early
         const timeA = getMinutesFromMidnightForWake(a.wakeTime);
         const timeB = getMinutesFromMidnightForWake(b.wakeTime);
         if (timeA === -1) return 1;
         if (timeB === -1) return -1;
         return timeA - timeB; // 越早起床排名越高
      }
    });
  }, [activeTab, metric, localFriends, globalData, currentUser]);

  const myRankIndex = currentUser ? sortedList.findIndex(f => f.isCurrentUser) : -1;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : 0;

  let myDisplayValue = '';
  if (currentUser) {
    if (metric === 'owl') {
       myDisplayValue = currentUser.bedTime || '--:--';
    } else { // early
       myDisplayValue = currentUser.wakeTime || '--:--';
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Panel (Full width on mobile, 96 on desktop) */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-space-800/95 border-l border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-out backdrop-blur-xl flex flex-col will-change-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent shrink-0 pt-safe-top">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 text-blue-100">
               <Trophy size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
               <h2 className="text-lg font-bold tracking-wide">Sleep Circle</h2>
             </div>
             <div className="flex items-center gap-2">
               {/* Invite Friends Button (only show if logged in) */}
               {currentUser && (
                 <button
                   onClick={handleAddFriend}
                   className="p-2 -m-2 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] hover:from-[#1E40AF] hover:to-[#6D28D9] text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-[#1D4ED8]/30 relative overflow-hidden group"
                   title="Invite Friends"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                   <UserPlus size={18} className="relative z-10" />
                   <span className="relative z-10 text-xs font-medium hidden md:inline">Invite</span>
                   <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(250,204,21,0.8)]"></div>
                 </button>
               )}
               <button 
                 onClick={onClose}
                 className="p-2 -m-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                 aria-label="Close"
               >
                 <X size={20} />
               </button>
             </div>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-black/40 p-1 rounded-lg mb-3 border border-white/5">
            <button 
              onClick={() => setMetric('owl')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${metric === 'owl' ? 'bg-[#7C3AED] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
            >
              <Moon size={14} /> Night Owl
            </button>
            <button 
              onClick={() => setMetric('early')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${metric === 'early' ? 'bg-[#F59E0B] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
            >
              <Sun size={14} /> Early Bird
            </button>
          </div>

          {/* Scope Tabs */}
          <div className="flex gap-4 px-2 border-b border-white/5">
             {currentUser ? (
               <>
                 <button 
                   onClick={() => setActiveTab('friends')}
                   className={`pb-2 text-sm font-medium transition-colors relative flex-1 md:flex-none text-center ${activeTab === 'friends' ? 'text-white' : 'text-white/40'}`}
                 >
                   Friends
                   {activeTab === 'friends' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1D4ED8] shadow-[0_0_8px_rgba(29,78,216,0.6)]"></div>}
                 </button>
                 <button 
                   onClick={() => setActiveTab('global')}
                   className={`pb-2 text-sm font-medium transition-colors relative flex-1 md:flex-none text-center ${activeTab === 'global' ? 'text-white' : 'text-white/40'}`}
                 >
                   Global
                   {activeTab === 'global' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1D4ED8] shadow-[0_0_8px_rgba(29,78,216,0.6)]"></div>}
                 </button>
               </>
             ) : (
               <>
                 <button 
                   onClick={onOpenLogin}
                   className="pb-2 text-sm font-medium transition-colors relative flex-1 md:flex-none text-center text-white/40 hover:text-white/70 cursor-pointer"
                   title="Login to view Friends"
                 >
                   Friends
                   <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                 </button>
                 <button 
                   className="pb-2 text-sm font-medium relative flex-1 md:flex-none text-center text-white"
                 >
                   Global
                   <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1D4ED8] shadow-[0_0_8px_rgba(29,78,216,0.6)]"></div>
                 </button>
               </>
             )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 hide-scrollbar">
          {sortedList.map((friend, index) => {
            const isSleeping = friend.status === 'sleeping';
            const isTop3 = index < 3 && !isSleeping;
            const isMe = friend.isCurrentUser;
            
            const displayValue = metric === 'owl'
              ? (friend.bedTime || '--:--')
              : (isSleeping ? 'Sleeping' : (friend.wakeTime || '--:--'));

            const valueLabel = '';

            return (
              <div 
                key={friend.id}
                className={`relative group p-3 rounded-xl border transition-all duration-300 ${
                  isMe
                    ? 'bg-[#1D4ED8]/20 border-[#1D4ED8]/50 shadow-[0_0_15px_rgba(29,78,216,0.2)]'
                    : isSleeping 
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED]/20 active:bg-purple-900/30' 
                      : 'bg-white/5 border-white/5 active:bg-white/10'
                }`}
              >
                <div className={`absolute right-3 top-3 text-lg font-black pointer-events-none select-none italic ${isTop3 ? 'text-yellow-500/50 text-2xl' : 'text-white/10'}`}>
                   #{index + 1}
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg shrink-0 ${friend.avatarColor} ${isSleeping ? 'animate-pulse' : ''}`}>
                    {friend.name.substring(0, 1)}
                    {isSleeping && (
                      <div className="absolute -top-1 -right-1 bg-[#7C3AED] rounded-full p-0.5 border-2 border-space-900">
                         <Moon size={8} className="text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-medium text-sm truncate ${isMe ? 'text-blue-200' : 'text-white/90'}`}>
                        {friend.name} {isMe && '(You)'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                       <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded ${
                         metric === 'owl' ? 'bg-[#7C3AED]/20 text-violet-200' : 
                         'bg-[#F59E0B]/20 text-amber-200'
                       }`}>
                          {metric === 'owl' ? <Moon size={10} /> : <Sun size={10} />}
                          <span className="font-bold">{displayValue}</span>
                          <span className="text-[10px] opacity-70">{valueLabel}</span>
                       </div>

                       {metric === 'owl' && (
                          <span className="flex items-center gap-1">
                            <Zap size={10} className="text-white/30" />
                            {friend.sleepScore}
                          </span>
                       )}
                       {metric === 'early' && (
                          <span className="flex items-center gap-1">
                            <Moon size={10} className="text-white/30" />
                            {friend.bedTime}
                          </span>
                       )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
          
        </div>

        {/* Sticky My Rank Footer - With Safe Area Support */}
        {currentUser ? (
          <div className="absolute bottom-0 left-0 w-full bg-[#151932] border-t border-white/10 p-4 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 uppercase tracking-wider font-bold">Your Rank</span>
              <span className="text-xs text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                {metric === 'owl' ? <Moon size={10}/> : <Sun size={10}/>}
                {activeTab === 'global' ? 'Global' : 'Friends'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#1D4ED8] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(29,78,216,0.5)]">
                 You
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-baseline">
                    <span className="font-bold text-white">#{myRank}</span>
                    <span className="text-sm text-blue-300 font-mono">{myDisplayValue}</span>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 w-full bg-[#151932] border-t border-white/10 p-4 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
            <div className="text-center mb-3">
              <p className="text-sm text-white/70 mb-1">Sign in to see your rank and track your progress</p>
              <p className="text-xs text-white/50 mb-4">Log in to join the leaderboard</p>
            </div>
            <button
              onClick={onOpenLogin}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] hover:from-[#1E40AF] hover:to-[#6D28D9] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#1D4ED8]/30"
            >
              Log in to join the leaderboard
            </button>
          </div>
        )}

      </div>

      {/* Invite Friend Modal */}
      {currentUser && (
        <InviteFriendModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          userName={currentUser.name}
        />
      )}
    </>
  );
};

export default Leaderboard;
