
import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && email.trim()) {
      onLogin(username, email);
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-space-800/95 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-[#1D4ED8]/20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl bg-[#7C3AED]/20 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 -m-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Join the Leaderboard</h2>
              <p className="text-sm text-white/50">Sign in to see your rank and track your progress</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-2 flex items-center gap-2">
                <User size={14} /> Username
              </label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2 flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs text-white/60 mb-2 flex items-center gap-2">
                  <Lock size={14} /> Password
                </label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                  required={isSignUp}
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] hover:from-[#1E40AF] hover:to-[#6D28D9] transition-all shadow-lg shadow-[#1D4ED8]/30 active:scale-95"
            >
              {isSignUp ? 'Sign Up' : 'Log in to join the leaderboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

