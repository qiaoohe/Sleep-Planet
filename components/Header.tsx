
import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, SleepRecord } from '../types';
import { LayoutGrid, Globe, Users, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onToggleView: (view: ViewMode) => void;
  onToggleLeaderboard: () => void;
  data: SleepRecord[];
  user: { id: string; username: string; email: string; avatarColor: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onToggleView, onToggleLeaderboard, data, user, onOpenLogin, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const weeklySummary = useMemo(() => {
    if (!data || data.length === 0) return "Begin tonight.";
    
    const recent = data.slice(-7);
    const completeCount = recent.filter(r => r.status === 'complete').length;
    const incompleteCount = recent.filter(r => r.status === 'incomplete').length;
    const totalDuration = recent.reduce((acc, r) => acc + (r.duration || 0), 0);
    const avgDuration = completeCount > 0 ? totalDuration / completeCount : 0;

    if (incompleteCount > 2) return "Dreams vivid lately.";
    if (completeCount >= 5) {
      if (avgDuration > 7.5) return "Radiating energy.";
      if (avgDuration > 6) return "Steady rhythm.";
      return "Building habits.";
    }
    if (completeCount >= 3) return "Finding balance.";
    return "Be gentle tonight.";
  }, [data]);

  return (
    <>
      {/* Top Bar: Date & Actions */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start z-50 pointer-events-none">
        
        {/* Date & Summary */}
        <div className="pointer-events-auto flex flex-col gap-1">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg font-sans">
            {formatDate(currentDate)}
          </h1>
          <div className="flex items-center gap-2 text-white/60 animate-in fade-in slide-in-from-left-4 duration-700">
             <p className="text-xs md:text-sm font-light italic tracking-wide pl-1 max-w-[150px] md:max-w-none truncate">
               {weeklySummary}
             </p>
          </div>
        </div>

        {/* Right Actions Container */}
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          {/* Leaderboard Toggle */}
          <button
            onClick={onToggleLeaderboard}
            className="bg-black/30 backdrop-blur-xl p-2.5 md:p-3 rounded-full border border-white/10 shadow-xl text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95 group relative"
          >
            <div className="absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
            <Users size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
          </button>

          {/* View Toggle */}
          <div className="bg-black/30 backdrop-blur-xl p-1 rounded-full flex gap-1 border border-white/10 shadow-xl">
            <button
              onClick={() => onToggleView('planet')}
              className={`p-2.5 md:p-3 rounded-full transition-all duration-300 ${
                currentView === 'planet' 
                  ? 'bg-white text-space-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
            </button>
            <button
              onClick={() => onToggleView('list')}
              className={`p-2.5 md:p-3 rounded-full transition-all duration-300 ${
                currentView === 'list' 
                  ? 'bg-white text-space-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
            </button>
          </div>

          {/* User Menu / Login Button */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-black/30 backdrop-blur-xl p-2.5 md:p-3 rounded-full border border-white/10 shadow-xl text-white hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center"
                >
                  <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${user.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {user.username.substring(0, 1).toUpperCase()}
                  </div>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[100]"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-space-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden">
                      <div className="p-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                            {user.username.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{user.username}</div>
                            <div className="text-xs text-white/50 truncate">{user.email || 'Sleep Tracker'}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 border-t border-white/5"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] hover:from-[#1E40AF] hover:to-[#6D28D9] backdrop-blur-xl p-2.5 md:p-3 rounded-full border border-white/10 shadow-xl text-white hover:shadow-[#1D4ED8]/50 transition-all active:scale-95 flex items-center justify-center gap-1.5 group relative overflow-hidden"
                title="Login to join the leaderboard"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <LogIn size={18} strokeWidth={1.5} className="md:w-[20px] md:h-[20px] relative z-10" />
                <span className="hidden md:inline text-xs font-medium relative z-10">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Legend: Hidden on Mobile (Space saved for Footer), Visible Top-Left on Desktop */}
      <div className="hidden md:block absolute top-[130px] left-8 z-40 pointer-events-none">
        <div className="flex flex-row gap-4 items-center bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1D4ED8] shadow-[0_0_8px_rgba(29,78,216,0.6)]"></div>
              <span className="text-[10px] font-medium text-blue-200/80 uppercase tracking-wider">Restful</span>
            </div>
            
            <div className="w-px h-2.5 bg-white/10 mx-1"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)]"></div>
              <span className="text-[10px] font-medium text-violet-200/80 uppercase tracking-wider">Dreaming</span>
            </div>

            <div className="w-px h-2.5 bg-white/10 mx-1"></div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700 border border-white/10"></div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Missed</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
