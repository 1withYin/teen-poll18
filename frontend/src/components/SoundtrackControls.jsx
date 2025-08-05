import { useAudio } from './AudioContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Helper to format time from seconds to MM:SS
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const SoundtrackControls = () => {
  const { 
    isPlaying, 
    isThemeSong,
    progress,
    currentTrackIndex,
    currentTrackInfo,
    toggleMasterPlay, 
    nextTrack, 
    prevTrack,
    seek
  } = useAudio();
  const navigate = useNavigate();

  // Don't show controls if the theme song is playing or if no track has ever been selected
  if (isThemeSong || currentTrackIndex === -1) {
    return null;
  }

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * progress.duration;
    seek(seekTime);
  };

  const progressPercentage = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md p-4 flex items-center justify-center text-white shadow-lg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <button onClick={prevTrack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>
          <button onClick={toggleMasterPlay} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full shadow-lg transform hover:scale-105 transition-transform">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button onClick={nextTrack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">{formatTime(progress.currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
            style={{
              background: `linear-gradient(to right, #1DB954 ${progressPercentage}%, #4B5563 ${progressPercentage}%)`
            }}
          />
          <span className="text-xs text-gray-400">{formatTime(progress.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SoundtrackControls; 