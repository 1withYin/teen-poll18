import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAudio } from '../components/AudioContext'
import SoundtrackControls from '../components/SoundtrackControls';

const HeartIcon = ({ isFavorite }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-6 w-6" 
    fill={isFavorite ? 'currentColor' : 'none'} 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" 
    />
  </svg>
);

const Playlist = () => {
  const { playlistTag: paramTag } = useParams()
  const navigate = useNavigate()
  
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });
  const [justClicked, setJustClicked] = useState(false);

  const {
    playlist,
    currentTrackIndex,
    playSoundtrackTrack,
    favorites,
    toggleFavorite
  } = useAudio();

  const playlistTag = paramTag || 'all'

  // Determine which songs to show
  let songs = (playlistTag === 'all')
    ? playlist
    : playlist.filter(song => {
        if (!song.playlist_tag) return false;
        const tags = song.playlist_tag.split(",").map(tag => tag.trim());
        return tags.includes(playlistTag);
      });


  // Get all unique playlist tags from the songs (excluding current and 'other')
  const allTags = Array.from(
    new Set(
      playlist.flatMap(song =>
        song.playlist_tag
          ? song.playlist_tag.split(",").map(tag => tag.trim())
          : []
      )
    )
  ).filter(tag => tag && tag !== playlistTag && tag.toLowerCase() !== 'other')
  
  // Debug: Log all tags to see what's happening
  console.log('All playlist tags found:', allTags);
  console.log('Current playlist tag:', playlistTag);

  // Add 'all' to the list if we're not currently on the 'all' page
  const displayTags = playlistTag === 'all' ? allTags : ['all', ...allTags]
  
  // Add the current playlist tag to the list if it's not already there
  const allDisplayTags = displayTags.includes(playlistTag) ? displayTags : [...displayTags, playlistTag]
  
  // Sort the display tags alphabetically, keeping 'all' at the top
  const sortedDisplayTags = allDisplayTags.sort((a, b) => {
    // Keep 'all' at the top
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    // Sort the rest alphabetically
    return a.localeCompare(b);
  });

  const handleMouseEnter = (e, snippet) => {
    console.log('=== MOUSE ENTER EVENT ===');
    console.log('Mouse enter - snippet:', snippet);
    console.log('Event target:', e.target);
    console.log('Current tooltip state:', tooltip.visible);
    
    if (snippet) {
      console.log('Setting tooltip visible with content:', snippet);
      setTooltip({
        visible: true,
        content: snippet,
        x: e.clientX,
        y: e.clientY,
      });
      console.log('Tooltip should now be visible');
    } else {
      console.log('No snippet provided, not showing tooltip');
    }
  };

  // Also show tooltip on click if not already visible
  const handleSongClick = (originalIndex, songs, song) => {
    console.log('=== SONG CLICK ===');
    console.log('Previous justClicked state:', justClicked);
    
    playSoundtrackTrack(originalIndex, songs);
    
    // Show tooltip if not already visible
    if (!tooltip.visible && song.lyrics_snippet) {
      console.log('Showing tooltip on click');
      setTooltip({
        visible: true,
        content: song.lyrics_snippet,
        x: 100, // Fixed position for now
        y: 100,
      });
    }
    
    // Clear any existing timeout
    if (window.clickTimeout) {
      clearTimeout(window.clickTimeout);
    }
    
    // Set flag to prevent immediate tooltip hiding
    setJustClicked(true);
    console.log('Set justClicked to true');
    
    // Reset flag after 500ms
    window.clickTimeout = setTimeout(() => {
      console.log('Resetting justClicked to false');
      setJustClicked(false);
    }, 500);
  };

  const handleMouseLeave = (e) => {
    console.log('Mouse leave event triggered');
    console.log('Related target:', e.relatedTarget);
    console.log('Current target:', e.currentTarget);
    console.log('Just clicked state:', justClicked);
    
    // Don't hide tooltip if we just clicked
    if (justClicked) {
      console.log('Just clicked, not hiding tooltip');
      return;
    }
    
    // Add a small delay to prevent immediate hiding
    setTimeout(() => {
      console.log('Delayed hide check - hiding tooltip');
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 100);
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };



  return (
    <div className="min-h-screen bg-navy-900 p-4 flex flex-col">
      {/* Debug: Show tooltip state */}
      {tooltip.visible && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-2 py-1 rounded z-[10000]">
        </div>
      )}
      
      {/* Tooltip Element */}
      {tooltip.visible && (
        <div
          className="fixed bg-blue-950/90 backdrop-blur-sm text-green-400 text-sm rounded-lg px-3 py-2 shadow-lg border border-green-400/50 cursor-pointer hover:bg-blue-900/90 transition-colors"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            zIndex: 9999,
            maxWidth: '300px',
            wordWrap: 'break-word',
          }}
          onClick={(e) => {
            e.stopPropagation();
            hideTooltip();
          }}
        >
          {tooltip.content}
        </div>
      )}
      
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-6 z-40 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </motion.button>

      <div className="max-w-screen-lg mx-auto w-full flex-grow flex flex-col">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-30 bg-navy-900/95 backdrop-blur-sm border-b border-white/10 pb-4">
          <h2 className="text-white text-3xl font-bold mb-4 text-center mt-16">
            {playlistTag === 'all' ? 'All Songs' : playlistTag.replace(/_/g, ' ') + ' Playlist'}
          </h2>
          
          {/* Playlist Navigation */}
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2">Playlists</h3>
            {sortedDisplayTags.length === 0 ? (
              <p className="text-white text-sm">No other playlists found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedDisplayTags.map(tag => {
                  const isCurrentPlaylist = tag === playlistTag;
                  return (
                    <div key={tag}>
                      {isCurrentPlaylist ? (
                        <div className="px-3 py-1 rounded-full bg-navy-800 text-white font-medium border border-blue-400 text-sm">
                          {tag === 'all' ? 'All Songs' : tag.replace(/_/g, ' ')}
                        </div>
                      ) : (
                        <Link 
                          to={`/soundtrack/playlist/${tag}`} 
                          className="px-3 py-1 rounded-full bg-white/10 text-blue-400 font-medium hover:bg-white/20 hover:text-blue-300 transition-colors text-sm"
                        >
                          {tag === 'all' ? 'All Songs' : tag.replace(/_/g, ' ')}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Songs Section */}
        <div className="flex-grow">
          {songs.length === 0 ? (
            <p className="text-white text-center mt-8">No songs found for this playlist.</p>
          ) : (
            <ul className="mb-8">
              {songs.map((song, idx) => {
                // Find the original index from the master playlist
                const originalIndex = playlist.findIndex(p => p.song_id === song.song_id);
                const isFavorite = favorites.has(song.song_id);
                return (
                  <li 
                    key={song.song_id || song.file_url} 
                    className="mb-4 flex items-center gap-4"
                  >
                    <button
                      className={`flex-grow px-4 py-2 rounded text-left transition-colors ${
                        originalIndex === currentTrackIndex
                          ? 'bg-navy-800 text-white font-bold border-2 border-blue-400'
                          : 'bg-white/20 text-white'
                      }`}
                      onMouseEnter={(e) => handleMouseEnter(e, song.lyrics_snippet)}
                      onMouseLeave={handleMouseLeave}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSongClick(originalIndex, songs, song);
                      }}
                    >
                      {song.song_title}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song.song_id);
                      }} 
                      className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                      aria-label={isFavorite ? 'Unfavorite song' : 'Favorite song'}
                    >
                      <HeartIcon isFavorite={isFavorite} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      
      <div className="w-full flex justify-center py-4">
        <SoundtrackControls />
      </div>
    </div>
  )
}

export default Playlist 