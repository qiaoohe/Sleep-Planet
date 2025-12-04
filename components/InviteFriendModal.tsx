
import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, QrCode, Mail, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose, userName }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Generate invite link (in real app, this would be from backend)
  const inviteCode = `SLP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const inviteLink = `https://sleepplanet.app/invite/${inviteCode}`;
  const inviteMessage = `Join me on Sleep Planet! Let's track our sleep together and compete on the leaderboard! 🚀🌙\n\nInvite code: ${inviteCode}\nLink: ${inviteLink}`;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Sleep Planet!',
          text: inviteMessage,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  // Simple QR code generation (in production, use a proper QR library)
  const generateQRCode = () => {
    // This is a placeholder - in production use a QR code library
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="12">${inviteCode}</text>
      </svg>
    `)}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-space-800/95 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-[#7C3AED]/20 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 -m-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Invite Friends</h2>
          <p className="text-sm text-white/50 mb-6">Share your invite code or link to add friends</p>

          {/* Invite Code Display */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-4">
            <div className="text-xs text-white/50 mb-2">Your Invite Code</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 font-mono text-lg font-bold text-white bg-black/20 px-4 py-2 rounded-lg">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Invite Link */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-4">
            <div className="text-xs text-white/50 mb-2">Invite Link</div>
            <div className="flex items-center gap-2">
              <LinkIcon size={16} className="text-white/40" />
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white/80 font-mono"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] rounded-xl text-white font-medium hover:from-[#1E40AF] hover:to-[#6D28D9] transition-all active:scale-95"
            >
              <Share2 size={20} />
              <span>Share via System</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(`mailto:?subject=Join me on Sleep Planet!&body=${encodeURIComponent(inviteMessage)}`, '_blank')}
                className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <Mail size={18} />
                <span className="text-sm">Email</span>
              </button>

              <button
                onClick={() => window.open(`sms:?body=${encodeURIComponent(inviteMessage)}`, '_blank')}
                className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <MessageCircle size={18} />
                <span className="text-sm">SMS</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <div className="flex items-center gap-2">
                <QrCode size={18} />
                <span className="text-sm font-medium">Show QR Code</span>
              </div>
              <div className={`transform transition-transform ${showQR ? 'rotate-180' : ''}`}>
                <X size={16} />
              </div>
            </button>

            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-3 border-2 border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-2">{inviteCode}</div>
                      <div className="text-xs text-gray-500">Scan to join</div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">Let friends scan this code to join</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-2">How to invite:</h3>
            <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
              <li>Share your invite code or link with friends</li>
              <li>Friends enter the code or click the link</li>
              <li>They'll appear in your Friends list automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendModal;

