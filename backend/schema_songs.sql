-- Songs table (separate from setup and results)
CREATE TABLE IF NOT EXISTS soundtracks (
    id SERIAL PRIMARY KEY,
    song_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    playlist_tag VARCHAR(255),
    spotify_url TEXT,
    youtube_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_soundtracks_playlist_tag ON soundtracks(playlist_tag);
CREATE INDEX IF NOT EXISTS idx_soundtracks_song_id ON soundtracks(song_id); 