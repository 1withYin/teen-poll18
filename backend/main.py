# main.py
# FastAPI backend for Teen Poll app
# ---------------------------------
# This file defines the API, database connection, and all backend logic for the app.
#
# Key sections:
# - Imports and setup
# - App startup/shutdown
# - CORS and middleware
# - API endpoints (categories_18, questions_18, voting, results, etc.)
# - Helper functions (block completion, etc.)
# - Static file serving for frontend

# --------------------
# Imports and Setup
# --------------------
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy import text, insert, Table, Column, Integer, String, MetaData, Text, TIMESTAMP, create_engine
from typing import List, Dict
import json
import os
from pydantic import BaseModel
import uvicorn
from pathlib import Path
import logging
import uuid
from config import *
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

# SQLAlchemy metadata for table definitions (used for 'other_responses_18')
metadata = MetaData()

# Table definition for 'other_responses_18' (for free-text answers)
other_responses_table = Table(
    "other_responses_18",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("question_id", String(20), nullable=False),
    Column("question_text", Text, nullable=False),
    Column("other_text", Text, nullable=False),
    Column("submitted_at", TIMESTAMP),
    Column("uuid", String(36), nullable=True),
)

# --------------------
# Pydantic Models
# --------------------
class Vote(BaseModel):
    question_id: str
    option_code: str
    session_id: str = None  # Optional session ID
    uuid: str = None  # User UUID
    year_of_birth: int = None  # User's year of birth
    referred_by: str = None  # Referrer UUID

class FollowUpRequest(BaseModel):
    session_id: str
    current_question_id: str
    answer: str

# In-memory session data (for development; use Redis in production)
session_responses = {}

# --------------------
# FastAPI App Instance
# --------------------
app = FastAPI()

# --------------------
# Migration Functions
# --------------------
def run_migrations(engine):
    """Run database migrations safely."""
    try:
        # TEMPORARILY DISABLE MIGRATIONS TO PREVENT DATA LOSS
        # The migrations are causing database corruption
        logger.info("Migrations temporarily disabled to prevent data loss")
        return
        
        # Original migration code (commented out for safety)
        """
        migration_files = [
            "migrations/02_add_decision_tree.sql",
            "migrations/03_set_start_questions.sql", 
            "migrations/04_add_user_tracking.sql",
            "migrations/05_add_checkbox_support.sql",
            "migrations/06_add_user_block_progress.sql",
            "migrations/07_add_blocks_table.sql",
            "migrations/08_add_soundtracks_table.sql",
            "migrations/09_add_referral_tracking.sql",
            "migrations/add_decision_tree.sql"
        ]
        
        for migration_file in migration_files:
            try:
                logger.info(f"Running migration: {migration_file}")
                with open(migration_file, 'r') as f:
                    sql = f.read()
                with engine.begin() as conn:
                    conn.execute(text(sql))
                logger.info(f"Migration {migration_file} completed successfully")
            except Exception as e:
                logger.warning(f"Migration {migration_file} failed (may already be applied): {e}")
        """
    except Exception as e:
        logger.error(f"Error running migrations: {e}")
        # Don't raise the exception - let the app start even if migrations fail

# --------------------
# Startup/Shutdown Events
# --------------------
@app.on_event("startup")
def startup_event():
    # Debug: Log the database URL being used
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL environment variable not set!")
        raise Exception("DATABASE_URL environment variable not set!")
    
    # Debug: Log the database URL being used
    logger.info(f"Starting up with DATABASE_URL: {database_url}")
    
    # Create the database engine
    app.state.engine = create_engine(database_url)
    
    # Run migrations - DISABLED TO PREVENT DATA LOSS
    try:
        # run_migrations(app.state.engine)  # DISABLED
        logger.info("Migrations disabled to prevent data loss.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        pass
    
    # Print all registered routes for debugging
    logger.info("Registered routes:")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            logger.info(f"  {route.methods} {route.path}")
        elif hasattr(route, 'path'):
            logger.info(f"  {route.path}")
        else:
            logger.info(f"  {route}")

@app.on_event("shutdown")
def shutdown_event():
    # Dispose of the database engine on shutdown
    if hasattr(app.state, 'engine'):
        app.state.engine.dispose()

# --------------------
# CORS Middleware
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.myworldmysay.com",
        "https://myworldmysay.com",
        "https://e18.myworldmysay.com",  # E18 frontend domain
        "http://localhost:3000",  # (optional, for local development)
        "http://localhost:3001",
        "http://192.168.87.244:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# API Endpoints
# --------------------
# Get all categories_18
@app.get("/api/categories")
async def get_categories(request: Request):
    try:
        # Debug: Log the database URL being used
        logger.info(f"Database URL: {DATABASE_URL}")
        
        with request.app.state.engine.connect() as conn:
            # Debug: Check if categories_18 table exists
            table_check = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories_18')"))
            table_exists = table_check.scalar()
            logger.info(f"Categories table exists: {table_exists}")
            
            if not table_exists:
                logger.error("Categories table does not exist!")
                return []
            
            # Debug: Check table schema
            schema_result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'categories_18' 
                ORDER BY ordinal_position
            """))
            schema = schema_result.mappings().all()
            logger.info(f"Categories table schema: {[col['column_name'] for col in schema]}")
            
            # Debug: Check if there are any rows at all
            any_rows = conn.execute(text("SELECT COUNT(*) FROM categories_18"))
            total_rows = any_rows.scalar()
            logger.info(f"Total rows in categories_18 table: {total_rows}")
            
            # Debug: Check transaction isolation and session info
            session_info = conn.execute(text("""
                SELECT 
                    current_database() as db_name,
                    current_user as user,
                    inet_server_addr() as server_ip,
                    txid_current() as transaction_id
            """))
            session_data = session_info.mappings().first()
            logger.info(f"Session info: {session_data}")
            
            # Debug: Check first few rows with all columns
            if total_rows > 0:
                sample_data = conn.execute(text("SELECT * FROM categories_18 LIMIT 3"))
                sample_rows = sample_data.mappings().all()
                logger.info(f"Sample data FROM categories_18: {sample_rows}")
            else:
                logger.info("No rows found in categories_18 table")
            
            # Debug: Test the connection and count categories_18
            count_result = conn.execute(text("SELECT COUNT(*) FROM categories_18"))
            count = count_result.scalar()
            logger.info(f"Found {count} categories_18 in database")
            
            # Debug: Show first few categories_18
            sample_result = conn.execute(text("SELECT id, category_name FROM categories_18 LIMIT 3"))
            sample_categories = sample_result.mappings().all()
            logger.info(f"Sample categories_18: {sample_categories}")
            
            result = conn.execute(text("""
                SELECT id, category_name, category_text, category_text_long
                FROM categories_18
                ORDER BY id
            """))
            categories_18 = result.mappings().all()
            logger.info(f"Returning {len(categories_18)} categories_18")
            return [{"id": str(cat["id"]), "category_name": cat["category_name"], "category_text": cat["category_text"], "category_text_long": cat["category_text_long"]} for cat in categories_18]
    except Exception as e:
        logger.error(f"Error fetching categories_18: {str(e)}")
        return []

# Get all questions_18 (optionally filter by category and block)
@app.get("/api/questions")
async def get_questions(request: Request, category_id: str = Query(None), block: int = Query(None)):
    try:
        with request.app.state.engine.connect() as conn:
            # Updated query to use blocks_18 table instead of questions_18.block column
            query = """
                SELECT q.id, q.question_id, q.question_text, q.category_id, q.color_code, q.check_box, c.category_name
                FROM questions_18 q
                JOIN categories_18 c ON q.category_id = c.id
            """
            params = {}
            where_clauses = []
            if category_id is not None and category_id != "all":
                where_clauses.append("q.category_id = :category_id")
                params["category_id"] = int(category_id)
            if block is not None:
                # Use blocks_18 table to filter by block_number
                where_clauses.append("""
                    EXISTS (
                        SELECT 1 FROM blocks_18 b 
                        WHERE b.category_id = q.category_id 
                        AND b.block_number = :block
                    )
                """)
                params["block"] = int(block)
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            query += " ORDER BY q.question_number"
            result = conn.execute(text(query), params)
            questions_18 = result.mappings().all()
            if not questions_18:
                logger.error("No questions_18 found in database")
                raise HTTPException(status_code=404, detail="No questions_18 found")
            out = []
            for question in questions_18:
                options_result = conn.execute(text("""
                    SELECT id, option_text, option_code, response_message, companion_advice
                    FROM options_18
                    WHERE question_id = :question_id
                    ORDER BY option_code
                """), {"question_id": question['question_id']})
                options_18 = options_result.mappings().all()
                out.append({
                    "id": question['id'],
                    "question_id": question['question_id'],
                    "text": question['question_text'],
                    "category": question['category_name'],
                    "category_id": str(question['category_id']),
                    "color_code": question['color_code'],
                    "check_box": question['check_box'],
                    "block": block,  # Use the requested block parameter
                    "options_18": [{
                        "id": opt['id'],
                        "text": opt['option_text'],
                        "code": opt['option_code'],
                        "response_message": opt['response_message'],
                        "companion_advice": opt['companion_advice']
                    } for opt in options_18]
                })
            return out
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching questions_18: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vote")
async def submit_vote(vote: Vote, request: Request):
    try:
        with request.app.state.engine.begin() as conn:
            # Check for recent vote (configurable cooldown)
            result = conn.execute(
                text(f"""
                    SELECT * FROM responses_18
                    WHERE uuid = :uuid
                      AND question_id = :qid
                      AND created_at > NOW() - INTERVAL '{QUESTION_COOLDOWN}'
                """),
                {"uuid": vote.uuid, "qid": vote.question_id}
            ).fetchone()
            if result:
                return {
                    "status": "already_voted",
                    "message": f"You have already voted on this question. Please come back after {QUESTION_COOLDOWN} if you want to vote again for this question."
                }
            # Handle user creation/validation if UUID is provided
            if vote.uuid and vote.year_of_birth:
                # Check if user exists, create if not
                user_result = conn.execute(text("""
                    SELECT uuid FROM users_18 WHERE uuid = :uuid
                """), {"uuid": vote.uuid})
                user = user_result.mappings().first()
                
                if not user:
                    # Create new user with referral info if provided
                    if vote.referred_by:
                        # Verify the referrer exists
                        referrer_result = conn.execute(text("""
                            SELECT uuid FROM users_18 WHERE uuid = :referrer_uuid
                        """), {"referrer_uuid": vote.referred_by})
                        referrer = referrer_result.mappings().first()
                        
                        if referrer:
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth, referred_by)
                                VALUES (:uuid, :year_of_birth, :referred_by)
                            """), {
                                "uuid": vote.uuid, 
                                "year_of_birth": vote.year_of_birth,
                                "referred_by": vote.referred_by
                            })
                            logger.info(f"Created new user with UUID: {vote.uuid} referred by: {vote.referred_by}")
                        else:
                            # Referrer doesn't exist, create user without referral
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth)
                                VALUES (:uuid, :year_of_birth)
                            """), {"uuid": vote.uuid, "year_of_birth": vote.year_of_birth})
                            logger.info(f"Created new user with UUID: {vote.uuid} (invalid referrer: {vote.referred_by})")
                    else:
                        # Create new user without referral
                        conn.execute(text("""
                            INSERT INTO users_18 (uuid, year_of_birth)
                            VALUES (:uuid, :year_of_birth)
                        """), {"uuid": vote.uuid, "year_of_birth": vote.year_of_birth})
                        logger.info(f"Created new user with UUID: {vote.uuid}")
            
            # Generate or use existing session ID
            if not vote.session_id:
                vote.session_id = str(uuid.uuid4())
            # Store response in session history
            if vote.session_id not in session_responses:
                session_responses[vote.session_id] = []
            session_responses[vote.session_id].append({
                'question_id': vote.question_id,
                'option_code': vote.option_code
            })
            
            # Check if this is an "OTHER" option
            if vote.option_code == "OTHER":
                return {
                    "status": "other_needed",
                    "session_id": vote.session_id,
                    "previous_responses": session_responses[vote.session_id]
                }
            
            # First get the option_id for the given question_id and option_code
            option_result = conn.execute(text("""
                SELECT id FROM options_18 
                WHERE question_id = :question_id AND option_code = :option_code
            """), {"question_id": vote.question_id, "option_code": vote.option_code})
            option = option_result.mappings().first()
            if not option:
                raise HTTPException(status_code=400, detail="Invalid option")
            # Get client IP
            client_ip = request.client.host
            # Record the vote in responses_18 table with UUID if provided
            if vote.uuid:
                conn.execute(text("""
                    INSERT INTO responses_18 (question_id, option_id, uuid, option_code)
                    VALUES (:question_id, :option_id, :uuid, :option_code)
                """), {
                    "question_id": vote.question_id,
                    "option_id": option['id'],
                    "uuid": vote.uuid,
                    "option_code": vote.option_code
                })
            else:
                conn.execute(text("""
                    INSERT INTO responses_18 (question_id, option_id)
                    VALUES (:question_id, :option_id)
                """), {"question_id": vote.question_id, "option_id": option['id']})
            
            # After recording the vote, check if all questions_18 in the block are answered
            # Get category_id and block for this question
            qinfo = conn.execute(text("""
                SELECT category_id, block FROM questions_18 WHERE question_id = :qid
            """), {"qid": vote.question_id}).mappings().first()
            if vote.uuid and qinfo and qinfo['block'] is not None:
                if all_block_questions_answered(conn, vote.uuid, qinfo['category_id'], qinfo['block']):
                    await mark_block_completed(conn, vote.uuid, qinfo['category_id'], qinfo['block'])
            
            return {
                "status": "success",
                "session_id": vote.session_id,
                "previous_responses": session_responses[vote.session_id]
            }
    except Exception as e:
        logger.error(f"Error submitting vote: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/questions/{question_id}/results")
async def get_question_results(question_id: str, request: Request):
    print(f"DEBUG: Getting results for question_id: {question_id}")
    logger.debug(f"Getting results for question_id: {question_id}")
    try:
        with request.app.state.engine.connect() as conn:
            # Check if the question is a checkbox question
            qtype_result = conn.execute(text("""
                SELECT check_box FROM questions_18 WHERE question_id = :question_id
            """), {"question_id": question_id})
            qtype = qtype_result.mappings().first()
            is_checkbox = qtype and qtype['check_box']

            # Get all options_18 for this question (including OTHER)
            options_result = conn.execute(text("""
                SELECT id, option_text, option_code FROM options_18 WHERE question_id = :question_id ORDER BY option_code
            """), {"question_id": question_id})
            options_18 = options_result.mappings().all()
            print(f"DEBUG: Found {len(options_18)} options_18 for question {question_id}")
            print(f"DEBUG: Options: {options_18}")
            option_codes = [opt['option_code'] for opt in options_18]
            option_texts = {opt['option_code']: opt['option_text'] for opt in options_18}
            print(f"DEBUG: Option codes: {option_codes}")
            print(f"DEBUG: Option texts: {option_texts}")

            results_dict = {code: 0.0 for code in option_codes}

            if is_checkbox:
                # Weighted logic: for each user, split their vote among their selections
                user_votes = conn.execute(text("""
                    SELECT uuid, STRING_AGG(option_code, ',') as codes
                    FROM checkbox_responses_18
                    WHERE question_id = :question_id
                    GROUP BY uuid
                """), {"question_id": question_id}).mappings().all()
                for user in user_votes:
                    if not user['uuid'] or not user['codes']:
                        continue
                    codes = user['codes'].split(',')
                    n = len(codes)
                    if n == 0:
                        continue
                    weight = 1.0 / n
                    for code in codes:
                        if code in results_dict:
                            results_dict[code] += weight
                # For anonymous votes (no uuid), count as 1 per selection
                anon_votes = conn.execute(text("""
                    SELECT option_code, COUNT(*) as count
                    FROM checkbox_responses_18
                    WHERE question_id = :question_id AND (uuid IS NULL OR uuid = '')
                    GROUP BY option_code
                """), {"question_id": question_id}).mappings().all()
                for row in anon_votes:
                    if row['option_code'] in results_dict:
                        results_dict[row['option_code']] += row['count']
            else:
                # Non-checkbox: count FROM responses_18 table
                resp_counts = conn.execute(text("""
                    SELECT option_code, COUNT(*) as count
                    FROM responses_18
                    WHERE question_id = :question_id
                    GROUP BY option_code
                """), {"question_id": question_id}).mappings().all()
                for row in resp_counts:
                    if row['option_code'] in results_dict:
                        results_dict[row['option_code']] += row['count']

            # Get "Other" responses_18 text for display
            other_responses_result = conn.execute(text("""
                SELECT other_text
                FROM other_responses_18
                WHERE question_id = :question_id
                ORDER BY submitted_at DESC
            """), {"question_id": question_id})
            other_responses_18 = [row['other_text'] for row in other_responses_result.mappings().all()]

            # Prepare results for frontend
            formatted_results = {"results": []}
            logger.debug(f"Processing {len(option_codes)} options_18: {option_codes}")
            logger.debug(f"Results dict: {results_dict}")
            for code in option_codes:
                if code == 'OTHER':
                    # For "Other", use the count of other_responses_18 for non-checkbox, or weighted count for checkbox
                    if is_checkbox:
                        count = results_dict['OTHER']
                    else:
                        count = len(other_responses_18)
                    # Always include "Other" option, even with 0 count
                    logger.debug(f"Adding OTHER option with count: {count}")
                    formatted_results["results"].append({
                        "text": option_texts.get('OTHER', 'Other'),  # Use actual option_text from database, fallback to 'Other'
                        "code": "OTHER",
                        "count": round(count, 2)  # Round to 2 decimal places
                    })
                else:
                    count = results_dict[code]
                    # Always include all options_18, even with 0 count
                    logger.debug(f"Adding option {code} with count: {count}")
                    formatted_results["results"].append({
                        "text": option_texts[code],
                        "code": code,
                        "count": round(count, 2)  # Round to 2 decimal places
                    })
            formatted_results["custom_responses"] = other_responses_18
            logger.debug(f"Formatted results being returned: {formatted_results}")
            return formatted_results
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/follow-up")
async def get_follow_up(request: FollowUpRequest):
    try:
        # Get session history
        previous_responses = session_responses.get(request.session_id, [])
        
        # Here we would call OpenAI API to generate follow-ups
        # For now, return placeholder response
        return {
            "follow_up_questions": [
                {
                    "question": f"Based on your answer, could you tell me more about...",
                    "context": "Generated from answer: " + request.answer
                }
            ],
            "session_id": request.session_id
        }
    except Exception as e:
        logger.error(f"Error generating follow-up: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/start-question/{category_id}")
async def get_start_question(category_id: str, request: Request):
    logger.debug(f"Getting start question for category: {category_id}")
    try:
        with request.app.state.engine.connect() as conn:
            if category_id == 'all':
                query = text("""
                    SELECT q.*, c.category_name
                    FROM questions_18 q
                    LEFT JOIN categories_18 c ON q.category_id = c.id
                    WHERE q.is_start_question = TRUE
                    ORDER BY RANDOM()
                    LIMIT 1
                """)
                question_result = conn.execute(query)
            else:
                query = text("""
                    SELECT q.*, c.category_name
                    FROM questions_18 q
                    LEFT JOIN categories_18 c ON q.category_id = c.id
                    WHERE q.category_id = :category_id AND q.is_start_question = TRUE
                    LIMIT 1
                """)
                question_result = conn.execute(query, {'category_id': int(category_id)})

            question = question_result.mappings().first()
            if not question:
                raise HTTPException(status_code=404, detail="Start question not found")

            options_result = conn.execute(text("""
                SELECT id, option_text, option_code, response_message, companion_advice, next_question_id
                FROM options_18
                WHERE question_id = :question_id
                ORDER BY option_code
            """), {"question_id": question['question_id']})
            options_18 = options_result.mappings().all()

            return {
                "id": question['id'],
                "question_id": question['question_id'],
                "text": question['question_text'],
                "category": question['category_name'],
                "category_id": str(question['category_id']),
                "color_code": question['color_code'],
                "options_18": [{
                    "id": opt['id'],
                    "text": opt['option_text'],
                    "code": opt['option_code'],
                    "response_message": opt['response_message'],
                    "companion_advice": opt['companion_advice'],
                    "next_question_id": opt['next_question_id']
                } for opt in options_18]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching start question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/next-question/{question_id}/{option_code}")
async def get_next_question(question_id: str, option_code: str, request: Request):
    try:
        with request.app.state.engine.connect() as conn:
            # Find the next_question_id from the options_18 table
            next_question_id_result = conn.execute(text("""
                SELECT next_question_id FROM options_18
                WHERE question_id = :question_id AND option_code = :option_code
            """), {"question_id": question_id, "option_code": option_code})
            next_question_info = next_question_id_result.mappings().first()

            if not next_question_info or not next_question_info['next_question_id']:
                return {"next_question": None}

            next_question_id = next_question_info['next_question_id']

            # Fetch the full next question details
            question_result = conn.execute(text("""
                SELECT q.*, c.category_name
                FROM questions_18 q
                JOIN categories_18 c ON q.category_id = c.id
                WHERE q.question_id = :next_question_id
            """), {"next_question_id": next_question_id})
            question = question_result.mappings().first()

            if not question:
                return {"next_question": None}

            options_result = conn.execute(text("""
                SELECT id, option_text, option_code, response_message, companion_advice, next_question_id
                FROM options_18
                WHERE question_id = :question_id
                ORDER BY option_code
            """), {"question_id": question['question_id']})
            options_18 = options_result.mappings().all()

            return {
                "next_question": {
                    "id": question['id'],
                    "question_id": question['question_id'],
                    "text": question['question_text'],
                    "category": question['category_name'],
                    "category_id": str(question['category_id']),
                    "color_code": question['color_code'],
                    "options_18": [{
                        "id": opt['id'],
                        "text": opt['option_text'],
                        "code": opt['option_code'],
                        "response_message": opt['response_message'],
                        "companion_advice": opt['companion_advice'],
                        "next_question_id": opt['next_question_id']
                    } for opt in options_18]
                }
            }
    except Exception as e:
        logger.error(f"Error fetching next question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class OtherResponse(BaseModel):
    question_id: str
    question_text: str
    other_text: str
    uuid: str = None  # User UUID
    year_of_birth: int = None  # User's year of birth
    referred_by: str = None  # Referrer UUID

class CheckboxVote(BaseModel):
    question_id: str
    option_codes: list[str]  # List of selected option codes
    uuid: str = None  # User UUID
    year_of_birth: int = None  # User's year of birth
    other_text: str = None  # Free-text answer for 'Other' option (checkbox)
    referred_by: str = None  # Referrer UUID

@app.post("/api/other-response")
async def submit_other_response(response: OtherResponse, request: Request):
    try:
        with request.app.state.engine.begin() as conn:
            # Handle user creation/validation if UUID is provided
            if response.uuid and response.year_of_birth:
                # Check if user exists, create if not
                user_result = conn.execute(text("""
                    SELECT uuid FROM users_18 WHERE uuid = :uuid
                """), {"uuid": response.uuid})
                user = user_result.mappings().first()
                
                if not user:
                    # Create new user with referral info if provided
                    if response.referred_by:
                        # Verify the referrer exists
                        referrer_result = conn.execute(text("""
                            SELECT uuid FROM users_18 WHERE uuid = :referrer_uuid
                        """), {"referrer_uuid": response.referred_by})
                        referrer = referrer_result.mappings().first()
                        
                        if referrer:
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth, referred_by)
                                VALUES (:uuid, :year_of_birth, :referred_by)
                            """), {
                                "uuid": response.uuid, 
                                "year_of_birth": response.year_of_birth,
                                "referred_by": response.referred_by
                            })
                            logger.info(f"Created new user with UUID: {response.uuid} referred by: {response.referred_by}")
                        else:
                            # Referrer doesn't exist, create user without referral
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth)
                                VALUES (:uuid, :year_of_birth)
                            """), {"uuid": response.uuid, "year_of_birth": response.year_of_birth})
                            logger.info(f"Created new user with UUID: {response.uuid} (invalid referrer: {response.referred_by})")
                    else:
                        # Create new user without referral
                        conn.execute(text("""
                            INSERT INTO users_18 (uuid, year_of_birth)
                            VALUES (:uuid, :year_of_birth)
                        """), {"uuid": response.uuid, "year_of_birth": response.year_of_birth})
                        logger.info(f"Created new user with UUID: {response.uuid}")
            
            # Insert the other response with UUID if provided
            if response.uuid:
                conn.execute(
                    insert(other_responses_table).values(
                        question_id=response.question_id,
                        question_text=response.question_text,
                        other_text=response.other_text,
                        uuid=response.uuid
                    )
                )
            else:
                conn.execute(
                    insert(other_responses_table).values(
                        question_id=response.question_id,
                        question_text=response.question_text,
                        other_text=response.other_text
                    )
                )
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error submitting 'other' response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/checkbox-vote")
async def submit_checkbox_vote(vote: CheckboxVote, request: Request):
    try:
        with request.app.state.engine.begin() as conn:
            # Check for recent vote (configurable cooldown)
            result = conn.execute(
                text(f"""
                    SELECT * FROM checkbox_responses_18
                    WHERE uuid = :uuid
                      AND question_id = :qid
                      AND created_at > NOW() - INTERVAL '{QUESTION_COOLDOWN}'
                """),
                {"uuid": vote.uuid, "qid": vote.question_id}
            ).fetchone()
            if result:
                return {
                    "status": "already_voted",
                    "message": f"You have already voted on this question. Please come back after {QUESTION_COOLDOWN} if you want to vote again for this question."
                }
            # Handle user creation/validation if UUID is provided
            if vote.uuid and vote.year_of_birth:
                # Check if user exists, create if not
                user_result = conn.execute(text("""
                    SELECT uuid FROM users_18 WHERE uuid = :uuid
                """), {"uuid": vote.uuid})
                user = user_result.mappings().first()
                if not user:
                    # Create new user with referral info if provided
                    if vote.referred_by:
                        # Verify the referrer exists
                        referrer_result = conn.execute(text("""
                            SELECT uuid FROM users_18 WHERE uuid = :referrer_uuid
                        """), {"referrer_uuid": vote.referred_by})
                        referrer = referrer_result.mappings().first()
                        
                        if referrer:
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth, referred_by)
                                VALUES (:uuid, :year_of_birth, :referred_by)
                            """), {
                                "uuid": vote.uuid, 
                                "year_of_birth": vote.year_of_birth,
                                "referred_by": vote.referred_by
                            })
                            logger.info(f"Created new user with UUID: {vote.uuid} referred by: {vote.referred_by}")
                        else:
                            # Referrer doesn't exist, create user without referral
                            conn.execute(text("""
                                INSERT INTO users_18 (uuid, year_of_birth)
                                VALUES (:uuid, :year_of_birth)
                            """), {"uuid": vote.uuid, "year_of_birth": vote.year_of_birth})
                            logger.info(f"Created new user with UUID: {vote.uuid} (invalid referrer: {vote.referred_by})")
                    else:
                        # Create new user without referral
                        conn.execute(text("""
                            INSERT INTO users_18 (uuid, year_of_birth)
                            VALUES (:uuid, :year_of_birth)
                        """), {"uuid": vote.uuid, "year_of_birth": vote.year_of_birth})
                        logger.info(f"Created new user with UUID: {vote.uuid}")
            # Insert new checkbox responses_18
            for option_code in vote.option_codes:
                option_result = conn.execute(text("""
                    SELECT id FROM options_18 
                    WHERE question_id = :question_id AND option_code = :option_code
                """), {"question_id": vote.question_id, "option_code": option_code})
                option = option_result.mappings().first()
                if option:
                    conn.execute(text("""
                        INSERT INTO checkbox_responses_18 (question_id, option_id, uuid, option_code)
                        VALUES (:question_id, :option_id, :uuid, :option_code)
                    """), {
                        "question_id": vote.question_id,
                        "option_id": option['id'],
                        "uuid": vote.uuid,
                        "option_code": option_code
                    })
            # If 'OTHER' is selected and other_text is provided, save to other_responses_18
            if 'OTHER' in vote.option_codes and hasattr(vote, 'other_text') and vote.other_text and vote.other_text.strip():
                conn.execute(
                    insert(other_responses_table).values(
                        question_id=vote.question_id,
                        question_text="",  # Optionally fetch question text if needed
                        other_text=vote.other_text.strip(),
                        uuid=vote.uuid
                    )
                )
            # After recording the vote, check if all questions_18 in the block are answered
            qinfo = conn.execute(text("""
                SELECT category_id, block FROM questions_18 WHERE question_id = :qid
            """), {"qid": vote.question_id}).mappings().first()
            if vote.uuid and qinfo and qinfo['block'] is not None:
                if all_block_questions_answered(conn, vote.uuid, qinfo['category_id'], qinfo['block']):
                    await mark_block_completed(conn, vote.uuid, qinfo['category_id'], qinfo['block'])
            return {"status": "success"}
    except Exception as e:
        logger.error(f"Error submitting checkbox vote: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/db-status")
async def db_status(request: Request):
    try:
        with request.app.state.engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM categories_18"))
            count = result.scalar_one()
            return {"status": "ok", "category_count": count}
    except Exception as e:
        logger.error(f"Database status check failed: {e}")
        return {"status": "error", "detail": str(e)}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "message": "API is running"}

# Helper: Mark block as completed for a user
async def mark_block_completed(conn, uuid, category_id, block):
    conn.execute(text("""
        INSERT INTO user_block_progress_18 (uuid, category_id, block, completed_at)
        VALUES (:uuid, :category_id, :block, NOW())
        ON CONFLICT (uuid, category_id, block) DO UPDATE SET completed_at = NOW()
    """), {"uuid": uuid, "category_id": category_id, "block": block})

# Endpoint: Get all blocks_18 for a category
@app.get("/api/blocks/{category_id}")
async def get_blocks_for_category(category_id: int, request: Request):
    try:
        with request.app.state.engine.connect() as conn:
            # Get all blocks_18 for this category from the blocks_18 table
            blocks_result = conn.execute(text("""
                SELECT id, category_id, block_number, block_text, version, uuid, category_name
                FROM blocks_18
                WHERE category_id = :category_id
                ORDER BY block_number
            """), {"category_id": category_id})
            blocks_18 = [dict(row) for row in blocks_result.mappings().all()]
            if not blocks_18:
                # Fallback: if no blocks_18 in blocks_18 table, get FROM questions_18 table
                fallback_result = conn.execute(text("""
                    SELECT DISTINCT block as block_number, 
                           'Block ' || block as block_text,
                           :category_id as category_id
                    FROM questions_18
                    WHERE category_id = :category_id AND block IS NOT NULL
                    ORDER BY block
                """), {"category_id": category_id})
                fallback_blocks = [dict(row) for row in fallback_result.mappings().all()]
                if not fallback_blocks:
                    raise HTTPException(status_code=404, detail="No blocks_18 found for this category")
                return {"blocks_18": fallback_blocks}
            return {"blocks_18": blocks_18}
    except Exception as e:
        logger.error(f"Error in get_blocks_for_category: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Get next available block for a user in a category
@app.get("/api/next-block/{category_id}")
async def get_next_block(category_id: int, uuid: str, request: Request):
    try:
        with request.app.state.engine.connect() as conn:
            # Get all blocks_18 for this category
            blocks_result = conn.execute(text("""
                SELECT DISTINCT block FROM questions_18
                WHERE category_id = :category_id
                ORDER BY block
            """), {"category_id": category_id})
            all_blocks = [row['block'] for row in blocks_result.mappings().all() if row['block'] is not None]
            if not all_blocks:
                raise HTTPException(status_code=404, detail="No blocks_18 found for this category")
            # Get blocks_18 completed in last configurable cooldown period
            cooldown_result = conn.execute(text(f"""
                SELECT block FROM user_block_progress_18
                WHERE uuid = :uuid AND category_id = :category_id
                  AND completed_at > NOW() - INTERVAL '{BLOCK_COOLDOWN}'
            """), {"uuid": uuid, "category_id": category_id})
            cooldown_blocks = set(row['block'] for row in cooldown_result.mappings().all())
            # Find the first block not in cooldown
            for block in all_blocks:
                if block not in cooldown_blocks:
                    return {"block": block}
            return {"block": None, "message": "No available blocks_18. Come back later!"}
    except Exception as e:
        logger.error(f"Error in get_next_block: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files for the frontend - this must be at the end
frontend_dir = Path(__file__).resolve().parent.parent / "frontend/dist"

if frontend_dir.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Skip API routes
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "API endpoint not found"}, status_code=404)
        frontend_dir = Path(__file__).parent.parent / "frontend" / "dist"
        index_file = frontend_dir / "index.html"
        file_path = frontend_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        elif index_file.exists():
            return FileResponse(str(index_file))
        else:
            logger.warning(f"Frontend dist directory not found at {frontend_dir}")
            return JSONResponse({"detail": "Frontend not built"}, status_code=404)
else:
    logger.warning(f"Frontend dist directory not found at {frontend_dir}")

def all_block_questions_answered(conn, uuid, category_id, block):
    # Get all question_ids for this block
    qids_result = conn.execute(text("""
        SELECT question_id, check_box FROM questions_18 WHERE category_id = :category_id AND block = :block
    """), {"category_id": category_id, "block": block})
    qid_types = [(row['question_id'], row['check_box']) for row in qids_result.mappings().all()]
    if not qid_types:
        return False
    answered = set()
    for qid, is_checkbox in qid_types:
        if is_checkbox:
            resp_result = conn.execute(text("""
                SELECT 1 FROM checkbox_responses_18 WHERE uuid = :uuid AND question_id = :qid LIMIT 1
            """), {"uuid": uuid, "qid": qid})
            if resp_result.fetchone():
                answered.add(qid)
        else:
            resp_result = conn.execute(text("""
                SELECT 1 FROM responses_18 WHERE uuid = :uuid AND question_id = :qid LIMIT 1
            """), {"uuid": uuid, "qid": qid})
            if resp_result.fetchone():
                answered.add(qid)
    return set(qid for qid, _ in qid_types) == answered

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)

print("Registered routes:") # Force redeploy
