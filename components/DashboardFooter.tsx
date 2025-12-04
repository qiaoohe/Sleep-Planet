
import React from 'react';
import { SleepRecord } from '../types';
import { Moon, Sun, Clock, Zap, ChevronUp, Activity, Plus, Power } from 'lucide-react';

interface DashboardFooterProps {
  todayRecord: SleepRecord | null;
  onOpenDetails: () => void;
  onStartSleep: () => void;
  onWakeUp: () => void;
}

const DashboardFooter: React.FC<DashboardFooterProps> = ({ todayRecord, onOpenDetails, onStartSleep, onWakeUp }) => {
  // If explicitly null or missed, show "Start Sleep" action
  if (!todayRecord || todayRecord.status === 'missed') {
    return (
      <div className="fixed bottom-0 left-0 w-full z-40 p-4 pb-8 md:pb-6 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl mx-auto space-y-3">
          <button
            onClick={onStartSleep}
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#7C3AED]/30 transition-all active:scale-95"
          >
            <Moon size={20} className="fill-current" />
            <span>Start Sleep</span>
          </button>
          <div 
            onClick={onOpenDetails}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  <Plus size={18} className="text-slate-400" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white">Manual Log</h3>
                  <p className="text-xs text-white/40">Log sleep manually</p>
               </div>
            </div>
            <ChevronUp size={16} className="text-white/40" />
          </div>
        </div>
      </div>
    );
  }

  const isIncomplete = todayRecord.status === 'incomplete';
  const isComplete = todayRecord.status === 'complete';
  
  // Theme colors based on status (Hex: #1D4ED8 (Blue) / #7C3AED (Violet))
  // Using explicit arbitrary tailwind values to match requested hexes
  const themeColor = isIncomplete ? 'text-[#7C3AED]' : isComplete ? 'text-[#1D4ED8]' : 'text-slate-400';
  const bgColor = isIncomplete ? 'bg-[#7C3AED]/10' : isComplete ? 'bg-[#1D4ED8]/10' : 'bg-slate-800/50';
  const borderColor = isIncomplete ? 'border-[#7C3AED]/30' : isComplete ? 'border-[#1D4ED8]/30' : 'border-white/10';
  const shadow = isIncomplete ? 'shadow-[0_0_30px_rgba(124,58,237,0.15)]' : isComplete ? 'shadow-[0_0_30px_rgba(29,78,216,0.15)]' : '';

  // Determine Score or Status Text
  let mainMetric = '0';
  
  if (isIncomplete) {
    mainMetric = 'ON';
  } else if (isComplete) {
    // Estimate score based on quality for quick view
    mainMetric = todayRecord.quality === 'Excellent' ? '95' : todayRecord.quality === 'Good' ? '85' : '72';
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 p-4 pb-6 md:pb-8 pointer-events-none">
      <div 
        onClick={onOpenDetails}
        className={`pointer-events-auto max-w-3xl mx-auto backdrop-blur-2xl rounded-2xl md:rounded-3xl border ${borderColor} ${bgColor} ${shadow} overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group`}
      >
        {/* Progress Bar (Visual indicator at top) */}
        {isComplete && (
            <div className="w-full h-0.5 bg-black/20">
                <div className="h-full bg-gradient-to-r from-transparent via-[#1D4ED8] to-transparent w-full opacity-50" />
            </div>
        )}
        
        <div className="flex items-center justify-between p-4 md:px-8 md:py-5">
            
            {/* Left: Status & Icon */}
            <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-12 h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${isIncomplete ? 'bg-[#7C3AED] text-white animate-pulse' : 'bg-space-800 text-white border border-white/10'}`}>
                    {isIncomplete ? <Moon size={24} className="fill-current" /> : <Activity size={24} className={themeColor} />}
                </div>
                <div>
                    <h3 className="text-xs md:text-sm font-medium text-white/50 uppercase tracking-wider mb-0.5">Today</h3>
                    <p className={`text-base md:text-lg font-bold ${themeColor} flex items-center gap-2`}>
                        {isIncomplete ? 'Recording...' : isComplete ? 'Sleep Analysis' : 'Missed'}
                        <ChevronUp size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1" />
                    </p>
                </div>
            </div>

            {/* Center: Metrics (Hidden on very small screens if crowded, simplified on mobile) */}
            <div className="flex items-center gap-4 md:gap-12">
                
                {/* Metric 1: Bedtime */}
                <div className="hidden md:block text-center">
                    <div className="flex items-center gap-1 justify-center text-xs text-white/40 mb-1">
                        <Moon size={10} /> Bed
                    </div>
                    <div className="font-mono text-lg">{todayRecord.bedTime || '--:--'}</div>
                </div>

                {/* Metric 2: Duration / Status */}
                <div className="text-center px-4 border-l border-r border-white/5">
                    <div className="flex items-center gap-1 justify-center text-xs text-white/40 mb-1">
                         {isIncomplete ? <Clock size={10} /> : <Zap size={10} />}
                         {isIncomplete ? 'Duration' : 'Sleep Score'}
                    </div>
                    <div className={`font-mono text-xl md:text-3xl font-bold ${themeColor}`}>
                        {isIncomplete ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            mainMetric
                        )}
                        <span className="text-xs md:text-sm text-white/30 ml-1 font-sans font-normal">
                           {isIncomplete ? '' : isComplete ? '/100' : ''}
                        </span>
                    </div>
                </div>

                {/* Metric 3: Wake */}
                <div className="hidden md:block text-center">
                    <div className="flex items-center gap-1 justify-center text-xs text-white/40 mb-1">
                        <Sun size={10} /> Wake
                    </div>
                    <div className="font-mono text-lg">{todayRecord.wakeTime || '--:--'}</div>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {isIncomplete ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWakeUp();
                  }}
                  className="bg-gradient-to-r from-[#F59E0B] to-[#F97316] hover:from-[#D97706] hover:to-[#EA580C] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-[#F59E0B]/30 transition-all active:scale-95"
                >
                  <Sun size={18} />
                  <span className="hidden md:inline">Wake Up</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartSleep();
                  }}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-[#7C3AED]/30 transition-all active:scale-95"
                >
                  <Moon size={18} />
                  <span className="hidden md:inline">Sleep</span>
                </button>
              )}
              <button
                onClick={onOpenDetails}
                className="hidden md:flex items-center justify-center bg-white/5 rounded-full p-2 group-hover:bg-white/10 transition-colors"
              >
                <ChevronUp size={20} className="text-white/50" />
              </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardFooter;
