import os
from pathlib import Path

# Database configuration - use PostgreSQL for both local and production
# For local development, you'll need to set up a local PostgreSQL database
# or use the DATABASE_URL from Render
# Note: Using External Database URL for Render to match where data was imported
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@host:port/database')

# Database configuration based on environment
if os.environ.get('RENDER', 'false').lower() == 'true':
    # Remote Render deployment - use External Database URL
    print(f"RENDER environment detected, using External Database URL")
    DATABASE_URL = "postgresql://user:password@host:port/database"
elif os.environ.get('USE_REMOTE_DB', 'false').lower() == 'true':
    # Local development but want to use remote database
    print(f"USE_REMOTE_DB detected, using External Database URL")
    DATABASE_URL = "postgresql://user:password@host:port/database"
else:
    # Default to remote database for production-like behavior
    print(f"Using remote PostgreSQL database for production-like behavior")
    DATABASE_URL = "postgresql://user:password@host:port/database"

# Server settings
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 8000))

# CORS settings
ALLOWED_ORIGINS = ["*"]  # Allow all origins in production (you might want to restrict this later)

# Debug mode
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

# Frontend path (optional, update as needed)
BASE_DIR = Path(__file__).parent
FRONTEND_PATH = BASE_DIR.parent / 'frontend' / 'dist'

# Environment
IS_PRODUCTION = os.environ.get('RENDER', 'false').lower() == 'true'

# Cooldown periods (1 minute for both development and production)
BLOCK_COOLDOWN = '1 minute'
QUESTION_COOLDOWN = '1 minute' 