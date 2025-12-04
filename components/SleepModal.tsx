
import React, { useEffect, useState } from 'react';
import { SleepRecord, GeminiAnalysis } from '../types';
import { X, Moon, Sun, Activity, Sparkles, AlertCircle, Save, Clock } from 'lucide-react';
import { analyzeSleepRecord } from '../services/geminiService';

interface SleepModalProps {
  record: SleepRecord | null;
  onClose: () => void;
  onSave: (record: SleepRecord) => void;
}

const SleepModal: React.FC<SleepModalProps> = ({ record, onClose, onSave }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  
  useEffect(() => {
    if (record) {
      setBedTime(record.bedTime || '23:00');
      
      // If incomplete, wake time might be empty, default to now or 07:00
      if (record.status === 'incomplete' && !record.wakeTime) {
         const now = new Date();
         const hours = now.getHours().toString().padStart(2, '0');
         const minutes = now.getMinutes().toString().padStart(2, '0');
         setWakeTime(`${hours}:${minutes}`);
      } else {
         setWakeTime(record.wakeTime || '07:00');
      }

      if (record.status === 'complete') {
        setLoading(true);
        setAnalysis(null);
        analyzeSleepRecord(record)
          .then(setAnalysis)
          .finally(() => setLoading(false));
      }
    }
  }, [record]);

  if (!record) return null;

  const isMissed = record.status === 'missed';
  const isIncomplete = record.status === 'incomplete';
  const isComplete = record.status === 'complete';

  // Styles
  let statusBg = 'bg-slate-700/50';
  let statusText = 'text-slate-300';
  if (isIncomplete) {
     statusBg = 'bg-[#7C3AED]/20';
     statusText = 'text-violet-300';
  } else if (isComplete) {
     statusBg = 'bg-[#1D4ED8]/20';
     statusText = 'text-blue-300';
  }

  // Helper to calculate duration
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let duration = (endH + endM / 60) - (startH + startM / 60);
    if (duration < 0) duration += 24; // Crossed midnight
    return parseFloat(duration.toFixed(1));
  };

  const handleSave = () => {
    const currentDuration = calculateDuration(bedTime, wakeTime);
    
    // Determine Quality based on duration
    let quality: SleepRecord['quality'] = 'Fair';
    if (currentDuration > 7.5) quality = 'Excellent';
    else if (currentDuration > 6) quality = 'Good';
    else if (currentDuration < 5) quality = 'Poor';

    const updatedRecord: SleepRecord = {
      ...record,
      status: 'complete',
      bedTime,
      wakeTime,
      duration: currentDuration,
      quality
    };
    onSave(updatedRecord);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-space-800/95 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative background glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isIncomplete ? 'bg-[#7C3AED]/20' : isComplete ? 'bg-[#1D4ED8]/20' : 'bg-white/5'}`} />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 -m-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-1 relative z-10">{record.date}</h2>
        <div className={`text-sm font-medium mb-6 inline-block px-2 py-0.5 rounded ${statusBg} ${statusText} self-start relative z-10`}>
          {isIncomplete ? 'Dreaming' : isMissed ? 'Add Record' : `${record.quality} Sleep`}
        </div>

        <div className="overflow-y-auto hide-scrollbar relative z-10 space-y-6">
          
          {/* Form for Missed or Incomplete */}
          {(isMissed || isIncomplete) && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl">
                  <label className="block text-xs text-white/40 mb-1 flex items-center gap-1"><Moon size={12}/> Bed Time</label>
                  <input 
                    type="time" 
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="bg-transparent text-white text-lg font-mono w-full outline-none focus:text-blue-400"
                  />
                </div>
                <div className="bg-black/20 p-3 rounded-xl">
                  <label className="block text-xs text-white/40 mb-1 flex items-center gap-1"><Sun size={12}/> Wake Time</label>
                  <input 
                    type="time" 
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="bg-transparent text-white text-lg font-mono w-full outline-none focus:text-amber-400"
                  />
                </div>
              </div>
              
              <div className="text-center text-xs text-white/30 font-mono">
                 Calculated Duration: <span className="text-white">{calculateDuration(bedTime, wakeTime)} hrs</span>
              </div>

              <button 
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isIncomplete ? 'bg-[#7C3AED] hover:bg-violet-500' : 'bg-[#1D4ED8] hover:bg-blue-600'}`}
              >
                {isIncomplete ? <Sun size={18} /> : <Save size={18} />}
                {isIncomplete ? 'Wake Up' : 'Save Record'}
              </button>
            </div>
          )}

          {/* Stats for Complete */}
          {isComplete && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                  <Moon className="text-indigo-400" size={20} />
                  <div className="text-xs text-white/40">Bed Time</div>
                  <div className="text-lg font-mono font-medium">{record.bedTime}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                  <Clock className="text-blue-400" size={20} />
                  <div className="text-xs text-white/40">Duration</div>
                  <div className="text-lg font-mono font-medium">{record.duration}h</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                  <Sun className="text-amber-400" size={20} />
                  <div className="text-xs text-white/40">Wake Time</div>
                  <div className="text-lg font-mono font-medium">{record.wakeTime}</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Sparkles size={40} />
                </div>
                
                <h3 className="text-sm font-bold text-indigo-200 mb-2 flex items-center gap-2">
                  <Activity size={14} /> Sleep Insight
                </h3>
                
                {loading ? (
                  <div className="flex items-center gap-2 text-white/50 text-sm animate-pulse">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                    Analyzing sleep patterns...
                  </div>
                ) : analysis ? (
                  <div className="space-y-3">
                     <p className="text-sm text-white/80 leading-relaxed">
                       {analysis.insight}
                     </p>
                     <div className="flex items-start gap-2 text-xs text-indigo-200/80 bg-indigo-500/10 p-2 rounded-lg">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        {analysis.suggestion}
                     </div>
                  </div>
                ) : (
                  <div className="text-sm text-white/50">Analysis unavailable.</div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default SleepModal;
