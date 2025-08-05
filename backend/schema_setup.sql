-- Setup tables (can be updated frequently without losing user data)
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    category_text TEXT NOT NULL,
    category_text_long TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    uuid VARCHAR(255)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    is_start_question BOOLEAN DEFAULT FALSE,
    parent_question_id TEXT,
    check_box BOOLEAN DEFAULT FALSE,
    block_number INTEGER,
    color_code TEXT,
    block_id INTEGER,
    version VARCHAR(50) DEFAULT '1.0',
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    option_text TEXT NOT NULL,
    option_code TEXT NOT NULL,
    question_id TEXT NOT NULL,
    next_question_id TEXT,
    response_message TEXT,
    companion_advice TEXT,
    tone_tag TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    uuid VARCHAR(255),
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (next_question_id) REFERENCES questions(question_id)
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    block_number INTEGER NOT NULL,
    block_text TEXT NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    uuid VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_id ON questions(question_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_blocks_category_id ON blocks(category_id); 