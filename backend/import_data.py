import csv
from pathlib import Path
import psycopg2
from config import DATABASE_URL
import os

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

def import_data():
    """
    Initializes the database schema and imports data from CSV files.
    """
    current_dir = Path(__file__).resolve().parent
    data_dir = current_dir.parent / 'data'
    schema_path = current_dir / 'schema_setup.sql'

    print("Initializing database schema (dropping and recreating tables)...")
    schema_sql = read_sql_file(schema_path)
    
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Drop and recreate tables
            cur.execute(schema_sql)
        conn.commit()

        print("Importing data...")
        
        # Import categories
        categories_path = data_dir / 'categories.csv'
        print("Reading categories from:", categories_path)
        categories_data = read_csv_file(categories_path)
        print("Importing categories...")
        import_categories(conn, categories_data)

        # Import questions
        questions_data = read_csv_file(data_dir / 'questions.csv')
        print("Importing questions...")
        import_questions(conn, questions_data)

        # Import options
        options_data = read_csv_file(data_dir / 'options.csv')
        print("Importing options...")
        import_options(conn, options_data)

        # Import blocks
        blocks_data = read_csv_file(data_dir / 'blocks.csv')
        print("Importing blocks...")
        import_blocks(conn, blocks_data)

        print("Import completed successfully!")
    finally:
        conn.close()


def read_sql_file(file_path):
    """Read SQL file and return as a string."""
    with open(file_path, 'r') as f:
        return f.read()

def read_csv_file(file_path):
    """Read CSV file and return list of dictionaries, filtering out extra columns not expected by the import functions."""
    with open(file_path, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        
        print('DEBUG: CSV fieldnames:', reader.fieldnames)
        
        expected_columns = {
            'categories.csv': ['id', 'category_name', 'description', 'category_text', 'category_text_long', 'version', 'uuid'],
            'blocks.csv': ['id', 'category_id', 'block_number', 'block_text', 'version', 'uuid'],
            'questions.csv': ['id', 'question_id', 'question_number', 'question_text', 'category_id', 'is_start_question', 'parent_question_id', 'check_box', 'block_number', 'color_code', 'version'],
            'options.csv': ['id', 'category_id', 'question_id', 'question_number', 'question_text', 'check_box', 'block_number', 'block_text', 'option_code', 'option_text', 'response_message', 'companion_advice', 'tone_tag', 'next_question_id']
        }
        filename = Path(file_path).name
        if filename in expected_columns:
            expected = expected_columns[filename]
            # Filter out empty columns and only keep expected ones
            return [{k: row[k] for k in expected if k in row and row[k].strip() != ''} for row in reader]
        else:
            return list(reader)

def import_categories(conn, categories_data):
    with conn.cursor() as cur:
        for row in categories_data:
            cur.execute("""
                INSERT INTO categories (id, category_name, description, category_text, category_text_long, version, uuid)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                row['id'],
                row['category_name'],
                row.get('description', ''),
                row['category_text'],
                row.get('category_text_long', ''),
                row['version'],
                row['uuid']
            ))
    conn.commit()

def import_questions(conn, questions_data):
    with conn.cursor() as cur:
        for row in questions_data:
            is_start = True if row.get('is_start_question', '').upper() == 'TRUE' else False
            check_box = True if row.get('check_box', '').upper() == 'TRUE' else False

            cur.execute("""
                INSERT INTO questions (
                    id, question_id, question_number, question_text, 
                    category_id, is_start_question, parent_question_id, 
                    check_box, block_number, color_code, version
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row['id'],
                row['question_id'],
                row['question_number'],
                row['question_text'],
                row['category_id'],
                is_start,
                row.get('parent_question_id'),
                check_box,
                row.get('block_number'),
                row.get('color_code'),
                row['version']
            ))
    conn.commit()

def import_options(conn, options_data):
    with conn.cursor() as cur:
        for row in options_data:
            cur.execute("""
                INSERT INTO options (
                    id, option_text, option_code, question_id, 
                    next_question_id, response_message, companion_advice, 
                    tone_tag, version, uuid
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row['id'],
                row['option_text'],
                row['option_code'],
                row['question_id'],
                row.get('next_question_id'),
                row.get('response_message'),
                row.get('companion_advice'),
                row.get('tone_tag'),
                '1.0',  # Default version since it's not in the CSV
                None    # Default UUID since it's not in the CSV
            ))
    conn.commit()

def import_blocks(conn, blocks_data):
    with conn.cursor() as cur:
        for row in blocks_data:
            cur.execute("""
                INSERT INTO blocks (
                    id, category_id, block_number, block_text, version, uuid
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                row['id'],
                row['category_id'],
                row['block_number'],
                row['block_text'],
                row['version'],
                row['uuid']
            ))
    conn.commit()

if __name__ == '__main__':
    import_data()
