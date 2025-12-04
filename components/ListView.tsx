
import React, { useMemo, useRef } from 'react';
import { SleepRecord } from '../types';
import { getMonthName } from '../services/dataService';
import { Moon, Sun, Clock, Loader2, Plus } from 'lucide-react';

interface ListViewProps {
  data: SleepRecord[];
  onRecordSelect: (record: SleepRecord) => void;
}

const ListView: React.FC<ListViewProps> = ({ data, onRecordSelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group data by month
  const groupedData = useMemo(() => {
    const groups: { [key: string]: SleepRecord[] } = {};
    data.forEach(record => {
      const monthYear = getMonthName(record.date);
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(record);
    });
    return groups;
  }, [data]);

  return (
    <div className="w-full h-full bg-space-900 pt-24 md:pt-32 pb-10 flex flex-col justify-center">
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto hide-scrollbar px-6 md:px-10 gap-8 md:gap-16 items-center snap-x snap-mandatory"
      >
        {Object.entries(groupedData).map(([month, records]: [string, SleepRecord[]]) => (
          <div key={month} className="flex flex-col justify-center min-w-fit h-full py-4 snap-center">
            {/* Month Title */}
            <h2 className="text-2xl md:text-4xl font-bold text-white/10 mb-4 md:mb-8 sticky left-0 uppercase tracking-widest pl-1 select-none">
              {month}
            </h2>
            
            {/* Grid */}
            <div className="grid grid-rows-5 grid-flow-col gap-3 md:gap-4">
              {records.map((record) => {
                const isComplete = record.status === 'complete';
                const isIncomplete = record.status === 'incomplete';
                const isMissed = record.status === 'missed';
                
                // Optimized sizing for mobile
                let baseClasses = "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative group border hover:z-[100]";
                let statusClasses = "bg-slate-800/50 border-white/5 cursor-pointer text-white/30 hover:border-white/30 hover:bg-slate-700/80 active:scale-95"; 
                
                if (isComplete) {
                  statusClasses = "bg-[#1D4ED8] border-blue-600 cursor-pointer active:scale-95 md:hover:scale-110 shadow-[0_0_15px_rgba(29,78,216,0.4)] text-white";
                } else if (isIncomplete) {
                  statusClasses = "bg-[#7C3AED] border-violet-500 cursor-pointer active:scale-95 md:hover:scale-110 shadow-[0_0_15px_rgba(124,58,237,0.4)] text-white";
                }

                return (
                  <div 
                    key={record.id}
                    onClick={() => onRecordSelect(record)}
                    className={`${baseClasses} ${statusClasses}`}
                  >
                    <span className="text-xs md:text-sm font-bold drop-shadow-sm">
                      {isMissed ? <span className="opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={14}/></span> : new Date(record.date).getDate()}
                    </span>
                    {isMissed && <span className="absolute text-xs md:text-sm font-bold group-hover:opacity-0 transition-opacity">{new Date(record.date).getDate()}</span>}
                    
                    {/* Tooltip - Hidden on touch, shown on hover (desktop) */}
                    <div className="hidden md:block absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 bg-space-800 border border-white/10 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl backdrop-blur-md z-[100]">
                        <div className="text-xs text-center text-white/50 mb-2 font-mono">{record.date}</div>
                        
                        {isComplete ? (
                          <>
                            <div className="flex justify-between items-center text-xs text-white gap-2 mb-2">
                              <span className="flex items-center gap-1 bg-white/5 px-1.5 py-1 rounded"><Moon size={10} className="text-indigo-300"/> {record.bedTime}</span>
                              <span className="flex items-center gap-1 bg-white/5 px-1.5 py-1 rounded"><Sun size={10} className="text-amber-300"/> {record.wakeTime}</span>
                            </div>
                            <div className="text-center text-[10px] text-blue-300 flex items-center justify-center gap-1">
                              <Clock size={10} />
                              {record.duration}h Sleep
                            </div>
                          </>
                        ) : isIncomplete ? (
                          <>
                            <div className="flex justify-center items-center text-xs text-white gap-2 mb-2">
                              <span className="flex items-center gap-1 bg-white/5 px-1.5 py-1 rounded"><Moon size={10} className="text-indigo-300"/> {record.bedTime}</span>
                            </div>
                            <div className="text-center text-[10px] text-violet-300 flex items-center justify-center gap-1 uppercase tracking-wide">
                              <Loader2 size={10} className="animate-spin" />
                              Dreaming...
                            </div>
                          </>
                        ) : (
                          // Missed
                          <div className="text-center text-[10px] text-slate-300 flex items-center justify-center gap-1">
                            <Plus size={10} />
                            Click to add
                          </div>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Spacer */}
        <div className="min-w-[20px]" />
      </div>

      <div className="h-10 md:h-12 text-center text-white/20 text-[10px] md:text-sm font-mono tracking-widest uppercase flex items-center justify-center gap-2">
        <span>← Scroll History →</span>
      </div>
    </div>
  );
};

export default ListView;
