import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import soundtrack from '../data/soundtrack.json';

const AudioContext = createContext()
export const useAudio = () => useContext(AudioContext)

const THEME_SONG_URL = '/music/My World My Say Theme.mp3';

// The soundtrack data is now clean, so we can use it directly.
console.log('Raw soundtrack data:', soundtrack);

const processedSoundtrack = soundtrack
  .filter(song => {
    const isValid = song.song_title && song.file_url && song.featured === 'TRUE';
    if (!isValid) {
      console.log('Filtered out song:', song.song_title, 'featured:', song.featured);
    }
    return isValid;
  })
  .sort((a, b) => {
    if (a.featured_order && b.featured_order) {
      return Number(a.featured_order) - Number(b.featured_order);
    } else if (a.featured_order) {
      return -1;
    } else if (b.featured_order) {
      return 1;
    }
    return a.song_title.localeCompare(b.song_title);
  });

console.log('Processed soundtrack:', processedSoundtrack);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    src: null,
    isTheme: false,
    trackIndex: -1
  });
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [themeEnabled, setThemeEnabled] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('soundtrack_favorites');
    return storedFavorites ? new Set(JSON.parse(storedFavorites)) : new Set();
  });
  const [currentPlaylist, setCurrentPlaylist] = useState(null); // Track current playlist

  // A ref to hold the latest state. This is crucial for preventing stale closures
  // in the useCallback hooks, making our functions stable.
  const stateRef = useRef({ isPlaying, currentTrack, themeEnabled, currentPlaylist });
  useEffect(() => {
    stateRef.current = { isPlaying, currentTrack, themeEnabled, currentPlaylist };
  }, [isPlaying, currentTrack, themeEnabled, currentPlaylist]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setProgress(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const playSoundtrackTrack = useCallback((index, playlist = null) => {
    console.log('playSoundtrackTrack called with index:', index, 'playlist:', playlist);
    console.log('processedSoundtrack length:', processedSoundtrack.length);
    if (index >= 0 && index < processedSoundtrack.length) {
      const track = processedSoundtrack[index];
      console.log('Playing track:', track);
      setCurrentTrack({
        src: track.file_url,
        isTheme: false,
        trackIndex: index
      });
      setCurrentPlaylist(playlist); // Set the current playlist
      setIsPlaying(true);
    } else {
      console.log('Invalid index:', index);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const { currentTrack, currentPlaylist } = stateRef.current;
    
    // If we're in a playlist, use playlist navigation
    if (currentPlaylist && currentPlaylist.length > 0) {
      const currentSong = processedSoundtrack[currentTrack.trackIndex];
      const currentPlaylistIndex = currentPlaylist.findIndex(song => song.song_id === currentSong.song_id);
      
      if (currentPlaylistIndex !== -1) {
        const nextPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
        const nextPlaylistSong = currentPlaylist[nextPlaylistIndex];
        const nextGlobalIndex = processedSoundtrack.findIndex(song => song.song_id === nextPlaylistSong.song_id);
        
        if (nextGlobalIndex !== -1) {
          playSoundtrackTrack(nextGlobalIndex, currentPlaylist);
          return;
        }
      }
    }
    
    // Fallback to global navigation
    const nextIndex = (currentTrack.trackIndex + 1) % processedSoundtrack.length;
    playSoundtrackTrack(nextIndex);
  }, [playSoundtrackTrack, currentPlaylist]);

  // Effect to save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('soundtrack_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Effect to handle actual playback
  useEffect(() => {
    const audio = audioRef.current;
    console.log('Audio playback effect - currentTrack.src:', currentTrack.src, 'isPlaying:', isPlaying);
    
    if (currentTrack.src && audio.src !== currentTrack.src) {
      console.log('Setting audio src to:', currentTrack.src);
      audio.src = currentTrack.src;
    }

    if (isPlaying) {
      console.log('Attempting to play audio');
      audio.play().catch(e => console.error("Playback error:", e));
    } else {
      console.log('Pausing audio');
      audio.pause();
    }
  }, [currentTrack.src, isPlaying]);

  // Effect for wiring up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (currentTrack.isTheme) {
        setIsPlaying(false);
      } else {
        nextTrack();
      }
    };
    const onTimeUpdate = () => {
      setProgress({
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      });
    };
    const onLoadedMetadata = () => {
      setProgress({
        currentTime: audio.currentTime,
        duration: audio.duration
      });
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [nextTrack]);

  const playTheme = useCallback(() => {
    const { isPlaying, currentTrack, themeEnabled } = stateRef.current;
    if (isPlaying && !currentTrack.isTheme) {
      return;
    }
    // Only play theme if it's enabled
    if (!themeEnabled) {
      return;
    }
    // Don't change themeEnabled state - respect user's preference
    setCurrentTrack({ src: THEME_SONG_URL, isTheme: true, trackIndex: -1 });
    setIsPlaying(true);
  }, []);

  const toggleMasterPlay = useCallback(() => {
    const { isPlaying, currentTrack } = stateRef.current;
    if (!isPlaying && currentTrack.trackIndex === -1) {
      playSoundtrackTrack(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [playSoundtrackTrack]);
  
  const toggleTheme = useCallback(() => {
    const { isPlaying, currentTrack, themeEnabled } = stateRef.current;
    
    if (themeEnabled) {
      // Currently enabled, so disable it
      setThemeEnabled(false);
      if (currentTrack.isTheme && isPlaying) {
        setIsPlaying(false);
      }
    } else {
      // Currently disabled, so enable it
      setThemeEnabled(true);
      // If nothing is playing, start the theme
      if (!isPlaying) {
        playTheme();
      }
    }
  }, [playTheme]);

  const prevTrack = useCallback(() => {
    const { currentTrack, currentPlaylist } = stateRef.current;
    
    // If we're in a playlist, use playlist navigation
    if (currentPlaylist && currentPlaylist.length > 0) {
      const currentSong = processedSoundtrack[currentTrack.trackIndex];
      const currentPlaylistIndex = currentPlaylist.findIndex(song => song.song_id === currentSong.song_id);
      
      if (currentPlaylistIndex !== -1) {
        const prevPlaylistIndex = (currentPlaylistIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        const prevPlaylistSong = currentPlaylist[prevPlaylistIndex];
        const prevGlobalIndex = processedSoundtrack.findIndex(song => song.song_id === prevPlaylistSong.song_id);
        
        if (prevGlobalIndex !== -1) {
          playSoundtrackTrack(prevGlobalIndex, currentPlaylist);
          return;
        }
      }
    }
    
    // Fallback to global navigation
    const prevIndex = (currentTrack.trackIndex - 1 + processedSoundtrack.length) % processedSoundtrack.length;
    playSoundtrackTrack(prevIndex);
  }, [playSoundtrackTrack, currentPlaylist]);

  const toggleFavorite = useCallback((songId) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  }, []);

  const clearPlaylist = useCallback(() => {
    setCurrentPlaylist(null);
  }, []);

  const value = {
    isPlaying,
    isThemeSong: currentTrack.isTheme,
    currentTrackIndex: currentTrack.trackIndex,
    currentTrackInfo: processedSoundtrack[currentTrack.trackIndex],
    playlist: processedSoundtrack,
    favorites,
    themeEnabled,
    progress,
    currentPlaylist,
    
    playTheme,
    playSoundtrackTrack,
    toggleMasterPlay,
    toggleTheme,
    toggleFavorite,
    nextTrack,
    prevTrack,
    seek,
    clearPlaylist
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  )
}