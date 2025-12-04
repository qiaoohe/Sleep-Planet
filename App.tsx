
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PlanetView from './components/PlanetView';
import ListView from './components/ListView';
import SleepModal from './components/SleepModal';
import Leaderboard from './components/Leaderboard';
import DashboardFooter from './components/DashboardFooter';
import LoginModal from './components/LoginModal';
import { generateYearlyData, generateFriends, createTodayRecord, updateTodayRecord } from './services/dataService';
import { SleepRecord, ViewMode, Friend } from './types';

interface User {
  id: string;
  username: string;
  email: string;
  avatarColor: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [data, setData] = useState<SleepRecord[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('planet');
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    try {
      // Check if user is logged in (in real app, check localStorage or auth token)
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('sleepPlanet_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('sleepPlanet_user');
          }
        }
      }
      // Allow browsing without login - only prompt when user wants to participate

      // Initialize with mock data
      const yearlyData = generateYearlyData();
      const friendsData = generateFriends();
      setData(yearlyData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error initializing app:', error);
      // Set empty data as fallback
      setData([]);
      setFriends([]);
    }
  }, []);

  const handleLogin = (username: string, email: string) => {
    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500'];
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    };
    setUser(newUser);
    localStorage.setItem('sleepPlanet_user', JSON.stringify(newUser));
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sleepPlanet_user');
    // Clear user-specific data if needed
  };

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };


  const requireLogin = (action: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return false;
    }
    return true;
  };

  const handleStartSleep = () => {
    if (!requireLogin('start sleep')) return;
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const bedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const todayRecord = data.find(r => r.date === today);
    if (todayRecord) {
      // Update existing record
      const updated = updateTodayRecord(todayRecord, { bedTime, status: 'incomplete' });
      setData(prevData => prevData.map(r => r.id === updated.id ? updated : r));
    } else {
      // Create new record
      const newRecord = createTodayRecord(bedTime);
      setData(prevData => [...prevData, newRecord]);
    }
  };

  const handleWakeUp = () => {
    if (!requireLogin('wake up')) return;
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const wakeTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const todayRecord = data.find(r => r.date === today);
    if (todayRecord && todayRecord.status === 'incomplete' && todayRecord.bedTime) {
      const updated = updateTodayRecord(todayRecord, { wakeTime, status: 'complete' });
      setData(prevData => prevData.map(r => r.id === updated.id ? updated : r));
    }
  };

  const handleToggleLeaderboard = () => {
    // Allow viewing leaderboard without login (will show Global only)
    setIsLeaderboardOpen(true);
  };

  // Calculate current user's "Friend" profile based on latest data
  const currentUser: Friend | null = useMemo(() => {
    if (!user || data.length === 0) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = data.find(r => r.date === today) || data[data.length - 1];
    
    // Determine score - simplified logic matching modal
    let score = 0;
    if (todayRecord.status === 'complete') {
       if (todayRecord.quality === 'Excellent') score = 95;
       else if (todayRecord.quality === 'Good') score = 85;
       else if (todayRecord.quality === 'Fair') score = 70;
       else score = 60;
    }

    return {
      id: user.id,
      name: user.username,
      avatarColor: user.avatarColor,
      status: todayRecord.status === 'incomplete' ? 'sleeping' : 'awake',
      sleepScore: todayRecord.status === 'incomplete' ? 0 : score,
      lastSleepDuration: todayRecord.duration,
      wakeTime: todayRecord.wakeTime,
      bedTime: todayRecord.bedTime,
      isCurrentUser: true
    };
  }, [data, user]);

  // Get today's record or create a placeholder
  const today = new Date().toISOString().split('T')[0];
  const latestRecord = data.find(r => r.date === today) || (data.length > 0 ? data[data.length - 1] : null);

  const handleRecordUpdate = (updatedRecord: SleepRecord) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setData(prevData => prevData.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    // Close modal after saving
    setSelectedRecord(null);
  };

  const handleOpenDetails = () => {
    // Allow viewing details without login, but saving requires login
    if (latestRecord) {
      setSelectedRecord(latestRecord);
    }
  };


  return (
    <div className="relative w-full h-screen overflow-hidden bg-space-900 text-white font-sans selection:bg-purple-500/30">
      <Header 
        currentView={currentView} 
        onToggleView={setCurrentView} 
        onToggleLeaderboard={handleToggleLeaderboard}
        data={data}
        user={user}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      <main className="w-full h-full">
        {currentView === 'planet' ? (
          <PlanetView 
            data={data} 
            onRecordSelect={setSelectedRecord} 
          />
        ) : (
          <ListView 
            data={data} 
            onRecordSelect={setSelectedRecord} 
          />
        )}
      </main>

      {/* Dashboard Footer - Displays Today's Info */}
      <DashboardFooter 
        todayRecord={latestRecord}
        onOpenDetails={handleOpenDetails}
        onStartSleep={handleStartSleep}
        onWakeUp={handleWakeUp}
      />

      {/* Overlays */}
      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        friends={friends}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
      />

      {/* Modal */}
      {selectedRecord && (
        <SleepModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onSave={handleRecordUpdate}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)} // Allow closing to continue browsing
        onLogin={handleLogin}
      />

    </div>
  );
};

export default App;
