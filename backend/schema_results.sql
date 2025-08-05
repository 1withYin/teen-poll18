-- Results tables (contain valuable user data - NEVER drop these!)
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    year_of_birth INTEGER,
    referred_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    option_code VARCHAR(50) NOT NULL,
    session_id VARCHAR(255),
    year_of_birth INTEGER,
    referred_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checkbox Responses table
CREATE TABLE IF NOT EXISTS checkbox_responses (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    option_codes TEXT[] NOT NULL,
    year_of_birth INTEGER,
    other_text TEXT,
    referred_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other Responses table
CREATE TABLE IF NOT EXISTS other_responses (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    year_of_birth INTEGER,
    referred_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_responses_user_uuid ON responses(user_uuid);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_checkbox_responses_user_uuid ON checkbox_responses(user_uuid);
CREATE INDEX IF NOT EXISTS idx_checkbox_responses_question_id ON checkbox_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_other_responses_user_uuid ON other_responses(user_uuid);
CREATE INDEX IF NOT EXISTS idx_other_responses_question_id ON other_responses(question_id); 