import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from './AudioContext';

const HamburgerMenu = ({ isSoundOn, onToggleSound }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { playTheme, currentPlaylist } = useAudio();

  const handleNavigate = (path) => {
    setOpen(false);
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleSoundtrackNavigate = () => {
    setOpen(false);
    
    // If we're currently in a playlist, navigate to that specific playlist
    if (currentPlaylist && currentPlaylist.length > 0) {
      // Get the playlist tag from the first song in the current playlist
      const firstSong = currentPlaylist[0];
      if (firstSong && firstSong.playlist_tag) {
        const tags = firstSong.playlist_tag.split(",").map(tag => tag.trim());
        const playlistTag = tags[0]; // Use the first tag
        navigate(`/soundtrack/playlist/${playlistTag}`);
        return;
      }
    }
    
    // Fallback to all songs
    navigate('/soundtrack/playlist/all');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Hamburger Icon */}
      <button
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 shadow-lg focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open menu"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-black/70 backdrop-blur-sm text-white rounded-xl shadow-2xl py-4 px-2 flex flex-col gap-2 animate-fade-in z-50 border border-white/10">
          <button className="text-left px-4 py-2 rounded hover:bg-red-500/20 font-bold transition-colors text-red-400 border border-red-400/30" onClick={() => handleNavigate('/before-you-begin')}>Before You Begin</button>
          <button className="text-left px-4 py-2 rounded hover:bg-white/10 font-medium transition-colors" onClick={() => {
            playTheme();
            handleNavigate('/');
          }}>Pick a Bubble</button>
          <button className="text-left px-4 py-2 rounded hover:bg-white/10 font-medium transition-colors" onClick={handleSoundtrackNavigate}>MyWorld Soundtrack</button>
          <button className="text-left px-4 py-2 rounded hover:bg-white/10 font-medium transition-colors" onClick={() => handleNavigate('/faq')}>FAQ/About</button>
          <button className="text-left px-4 py-2 rounded hover:bg-white/10 font-medium transition-colors" onClick={() => handleNavigate('/help')}>Help/Resources</button>
          
          {/* Theme Song Toggle - compact version inside menu */}
          <div className="flex items-center justify-between px-4 py-2 mt-2 border-t border-white/10">
            <span className="font-medium text-sm">Theme Song</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isSoundOn} onChange={onToggleSound} className="sr-only" />
              <div className={`w-8 h-5 bg-gray-300 rounded-full shadow-inner transition-colors duration-200 ${isSoundOn ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu; 