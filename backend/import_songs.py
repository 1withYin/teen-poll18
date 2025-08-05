import csv
from pathlib import Path
import psycopg2
import os
from config import DATABASE_URL

# Set your CSV directory
data_dir = Path(__file__).parent.parent / 'data'  # go up one level
csv_file = data_dir / 'soundtracks.csv'


# --- Database connection ---
def get_connection():
    # Parse DATABASE_URL to get connection parameters
    # DATABASE_URL format: postgresql://user:password@host:port/database
    url_parts = DATABASE_URL.replace('postgresql://', '').split('@')
    user_pass = url_parts[0].split(':')
    host_db = url_parts[1].split('/')
    host_port = host_db[0].split(':')
    
    return psycopg2.connect(
        dbname=host_db[1],
        user=user_pass[0],
        password=user_pass[1],
        host=host_port[0],
        port=host_port[1] if len(host_port) > 1 else "5432"
    )

# --- CSV Reader ---
def read_csv_file(filepath):
    with open(filepath, mode='r', encoding='utf-8-sig') as file:  # utf-8-sig handles BOM
        reader = csv.DictReader(file)
        return list(reader)

# --- Import Function ---
def import_soundtracks(conn, data):
    with conn.cursor() as cur:
        for row in data:
            cur.execute("""
                INSERT INTO soundtracks (
                    song_id, title, artist, playlist_tag,
                    spotify_url, youtube_url
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (song_id) DO NOTHING;
            """, (
                row['song_id'],
                row['song_title'],
                row.get('artist'),
                row.get('playlist_tag'),
                row.get('spotify_url'),
                row.get('youtube_url')
            ))
    conn.commit()
    print(f"✅ Imported {len(data)} soundtracks.")

# --- Main Runner ---
if __name__ == '__main__':
    try:
        conn = get_connection()
        soundtracks_data = read_csv_file(data_dir / 'soundtracks.csv')
        import_soundtracks(conn, soundtracks_data)
    except Exception as e:
        print("❌ Error:", e)
    finally:
        if 'conn' in locals():
            conn.close()

