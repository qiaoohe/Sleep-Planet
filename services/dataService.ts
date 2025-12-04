
import { SleepRecord, RecordStatus, Friend } from '../types';

export const generateYearlyData = (): SleepRecord[] => {
  const records: SleepRecord[] = [];
  const today = new Date();
  // Generate for last 365 days
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Random status generation
    const rand = Math.random();
    let status: RecordStatus = 'missed';
    
    if (rand > 0.25) status = 'complete';
    else if (rand > 0.20) status = 'incomplete'; // 5% chance of incomplete/forgot logout
    
    const bedHour = 22 + Math.floor(Math.random() * 4); // 22:00 to 02:00
    
    let duration: number | undefined = undefined;
    let wakeTime: string | undefined = undefined;
    let quality: SleepRecord['quality'] = 'Unknown';
    let bedTime: string | undefined = undefined;

    if (status !== 'missed') {
      bedTime = `${bedHour % 24}:30`;
    }

    if (status === 'complete') {
       duration = 4 + Math.random() * 5; // 4 to 9 hours
       const wakeHour = 6 + Math.floor(Math.random() * 4); // 06:00 to 10:00
       wakeTime = `0${wakeHour}:15`;
       
       if (duration > 7.5) quality = 'Excellent';
       else if (duration > 6.5) quality = 'Good';
       else if (duration < 5) quality = 'Poor';
       else quality = 'Fair';
    } else if (status === 'incomplete') {
      quality = 'Unknown';
    }

    records.push({
      id: date.toISOString(),
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      duration: duration ? parseFloat(duration.toFixed(1)) : undefined,
      bedTime,
      wakeTime,
      quality,
      status,
    });
  }
  return records.reverse(); // Oldest first
};

export const generateFriends = (): Friend[] => {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"];
  const colors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-green-400", "bg-emerald-400", "bg-teal-400", "bg-cyan-400", "bg-sky-400"];
  
  return names.map((name, i) => {
    const isSleeping = Math.random() > 0.7;
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    
    // Generate bedtime for stats
    const bedHour = 22 + Math.floor(Math.random() * 5); // 22:00 to 03:00
    const bedTime = `${bedHour % 24}:${Math.floor(Math.random()*60).toString().padStart(2, '0')}`;

    const friend: Friend = {
      id: `f-${i}`,
      name,
      avatarColor: colors[i % colors.length],
      status: isSleeping ? 'sleeping' : 'awake',
      sleepScore: isSleeping ? 0 : score,
      lastSleepDuration: isSleeping ? undefined : 6 + Math.random() * 3,
      wakeTime: isSleeping ? undefined : `0${6 + Math.floor(Math.random() * 3)}:30`,
      bedTime: bedTime
    };
    return friend;
  });
};

export const generateGlobalLeaderboard = (): Friend[] => {
  const globalUsers: Friend[] = [];
  const adjectives = ["Sleepy", "Dreamy", "Cosmic", "Lunar", "Solar", "Restful", "Calm", "Night", "Dark"];
  const nouns = ["Traveler", "Panda", "Owl", "Cat", "Star", "Moon", "Cloud", "Fox", "Walker"];
  
  for(let i=0; i<50; i++) {
     const isSleeping = Math.random() > 0.8;
     const score = Math.floor(Math.random() * 50) + 50; // 50-100
     
     const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
     const noun = nouns[Math.floor(Math.random() * nouns.length)];
     
     const bedHour = 22 + Math.floor(Math.random() * 6); // 22 to 04
     const bedTime = `${bedHour % 24}:${Math.floor(Math.random()*60).toString().padStart(2, '0')}`;

     globalUsers.push({
        id: `g-${i}`,
        name: `${adj}${noun}${Math.floor(Math.random()*100)}`,
        avatarColor: 'bg-slate-700',
        status: isSleeping ? 'sleeping' : 'awake',
        sleepScore: isSleeping ? 0 : score,
        lastSleepDuration: isSleeping ? undefined : 5 + Math.random() * 4,
        wakeTime: isSleeping ? undefined : `0${6 + Math.floor(Math.random() * 3)}:30`,
        bedTime: bedTime
     });
  }
  return globalUsers;
}

export const getMonthName = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const createTodayRecord = (bedTime: string): SleepRecord => {
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  
  return {
    id: `record-${date}-${Date.now()}`,
    date,
    timestamp: today.getTime(),
    bedTime,
    status: 'incomplete',
    quality: 'Unknown'
  };
};

export const updateTodayRecord = (
  record: SleepRecord, 
  updates: { wakeTime?: string; bedTime?: string; status?: 'complete' | 'incomplete' }
): SleepRecord => {
  let duration: number | undefined = undefined;
  let quality: SleepRecord['quality'] = record.quality;

  if (updates.wakeTime && updates.status === 'complete' && record.bedTime) {
    const [bedH, bedM] = record.bedTime.split(':').map(Number);
    const [wakeH, wakeM] = updates.wakeTime.split(':').map(Number);
    
    let durationHours = (wakeH + wakeM / 60) - (bedH + bedM / 60);
    if (durationHours < 0) durationHours += 24; // Crossed midnight
    
    duration = parseFloat(durationHours.toFixed(1));
    
    // Determine quality based on duration
    if (duration > 7.5) quality = 'Excellent';
    else if (duration > 6) quality = 'Good';
    else if (duration < 5) quality = 'Poor';
    else quality = 'Fair';
  }

  return {
    ...record,
    ...updates,
    duration: duration !== undefined ? duration : record.duration,
    quality
  };
};
