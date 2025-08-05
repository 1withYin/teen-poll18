#!/usr/bin/env python3
"""
Script to replace all non-_18 table references with _18 suffixed versions
in backend/main.py to ensure E18 site only uses _18 tables.
"""

import re

# Read the current main.py file
with open('backend/main.py', 'r') as f:
    content = f.read()

# Define the table mappings (non-_18 -> _18)
table_mappings = {
    'categories': 'categories_18',
    'questions': 'questions_18', 
    'options': 'options_18',
    'blocks': 'blocks_18',
    'responses': 'responses_18',
    'users': 'users_18',
    'checkbox_responses': 'checkbox_responses_18',
    'other_responses': 'other_responses_18',
    'user_block_progress': 'user_block_progress_18'
}

# Replace table references in SQL queries
# This regex looks for FROM/JOIN followed by table names that don't end with _18
for old_table, new_table in table_mappings.items():
    # Replace FROM table_name
    content = re.sub(
        rf'\bFROM\s+{old_table}\b',
        f'FROM {new_table}',
        content,
        flags=re.IGNORECASE
    )
    
    # Replace JOIN table_name
    content = re.sub(
        rf'\bJOIN\s+{old_table}\b',
        f'JOIN {new_table}',
        content,
        flags=re.IGNORECASE
    )
    
    # Replace table_name in other contexts (like table_name.field)
    content = re.sub(
        rf'\b{old_table}\b(?!_18)',
        new_table,
        content
    )

# Write the updated content back
with open('backend/main.py', 'w') as f:
    f.write(content)

print("✅ Successfully updated all table references to use _18 suffix!")
print("Tables updated:")
for old, new in table_mappings.items():
    print(f"  {old} -> {new}") 