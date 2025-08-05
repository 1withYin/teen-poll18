import { useState, useEffect } from 'react';

const ReferralLink = ({ userUUID }) => {
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socialHandles, setSocialHandles] = useState({});

  // Check if user has connected any social media accounts
  useEffect(() => {
    const saved = localStorage.getItem('socialHandles');
    if (saved) {
      setSocialHandles(JSON.parse(saved));
    }
  }, []);

  const hasConnectedAccounts = Object.values(socialHandles).some(handle => handle && handle.trim() !== '');

  const referralLink = `${window.location.origin}?ref=${userUUID}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };



  if (!userUUID) {
    return null;
  }

  return (
    <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-600/40">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Drop it in your chat 💬
        </h3>
        <button
          onClick={() => setShowLink(!showLink)}
          className="text-sm"
          style={{
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {showLink ? 'Hide' : 'Show'} Link
        </button>
      </div>
      

      
      {showLink && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          
          <div className="text-sm text-gray-300 mb-2">Share to your accounts:</div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const text = `Check out this teen poll app! ${referralLink}`;
                const url = `https://discord.com/channels/@me?content=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                hasConnectedAccounts 
                  ? 'bg-purple-600/40 hover:bg-purple-500/50 text-white border border-purple-400/60' 
                  : 'bg-purple-600/20 hover:bg-purple-500/30 text-white/70 border border-dashed border-purple-400/40'
              }`}
            >
              Discord
            </button>
            
            <button
              onClick={() => {
                const text = `Check out this teen poll app! ${referralLink}`;
                const url = `https://www.instagram.com/?url=${encodeURIComponent(referralLink)}`;
                window.open(url, '_blank');
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                hasConnectedAccounts 
                  ? 'bg-pink-600/40 hover:bg-pink-500/50 text-white border border-pink-400/60' 
                  : 'bg-pink-600/20 hover:bg-pink-500/30 text-white/70 border border-dashed border-pink-400/40'
              }`}
            >
              Instagram
            </button>
            
            <button
              onClick={() => {
                const text = `Check out this teen poll app! ${referralLink}`;
                const url = `https://www.snapchat.com/share?url=${encodeURIComponent(referralLink)}`;
                window.open(url, '_blank');
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                hasConnectedAccounts 
                  ? 'bg-yellow-600/40 hover:bg-yellow-500/50 text-black border border-yellow-400/60' 
                  : 'bg-yellow-600/20 hover:bg-yellow-500/30 text-black/70 border border-dashed border-yellow-400/40'
              }`}
            >
              Snapchat
            </button>
            
            <button
              onClick={() => {
                const text = `Check out this teen poll app! ${referralLink}`;
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                hasConnectedAccounts 
                  ? 'bg-green-600/40 hover:bg-green-500/50 text-white border border-green-400/60' 
                  : 'bg-green-600/20 hover:bg-green-500/30 text-white/70 border border-dashed border-green-400/40'
              }`}
            >
              Whatsapp
            </button>
            
            <button
              onClick={() => {
                const text = `Check out this teen poll app! ${referralLink}`;
                const url = `https://www.tiktok.com/share?url=${encodeURIComponent(referralLink)}`;
                window.open(url, '_blank');
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                hasConnectedAccounts 
                  ? 'bg-gray-800/40 hover:bg-gray-700/50 text-white border border-gray-400/60' 
                  : 'bg-gray-800/20 hover:bg-gray-700/30 text-white/70 border border-dashed border-gray-400/40'
              }`}
            >
              Tiktok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralLink; 