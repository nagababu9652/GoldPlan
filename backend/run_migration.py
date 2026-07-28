#!/usr/bin/env python3
"""
Run the SQL migration script against the database.
Properly handles dollar-quoted function bodies.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings


def get_db_connection_params():
    db_url = settings.database_url
    parsed = urlparse(db_url)

    return {
        "user": parsed.username or "postgres",
        "password": parsed.password or "postgres",
        "host": parsed.hostname or "localhost",
        "port": str(parsed.port or 5432),
        "dbname": parsed.path.lstrip("/") or "postgres",
    }


def split_sql_statements(sql_content: str):
    """
    Split SQL into statements, handling dollar-quoted strings.
    Dollar-quoted strings like $$...$$ or $func$...$func$ are kept intact.
    """
    statements = []
    current = []
    i = 0
    in_dollar = False
    dollar_end = None
    
    while i < len(sql_content):
        ch = sql_content[i]
        
        # Check for dollar quote
        if ch == '$' and not in_dollar:
            # Find the end of this dollar delimiter
            j = i + 1
            while j < len(sql_content) and sql_content[j] != '$':
                j += 1
            if j < len(sql_content):
                # Found matching $, now find the closing delimiter
                delimiter = sql_content[i:j+1]  # e.g., $$ or $func$
                # Find the closing delimiter
                close_pos = sql_content.find(delimiter, j + 1)
                if close_pos != -1:
                    # Include the entire dollar-quoted block
                    current.append(sql_content[i:close_pos + len(delimiter)])
                    i = close_pos + len(delimiter)
                    continue
        
        # Check for line comment
        if ch == '-' and i + 1 < len(sql_content) and sql_content[i+1] == '-':
            while i < len(sql_content) and sql_content[i] != '\n':
                i += 1
            continue
        
        # Statement terminator
        if ch == ';':
            stmt = ''.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
            i += 1
            continue
        
        current.append(ch)
        i += 1
    
    remaining = ''.join(current).strip()
    if remaining:
        statements.append(remaining)
    
    return statements


def run_migration():
    db_url = settings.database_url
    print(f"Database: {db_url}")

    params = get_db_connection_params()
    user = params["user"]
    password = params["password"]
    host = params["host"]
    port = params["port"]
    dbname = params["dbname"]
    
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
        import psycopg2
    
    sql_file = Path(__file__).parent.parent / "sql" / "complete_migration.sql"
    print(f"Reading SQL from: {sql_file}")
    
    with open(sql_file, "r", encoding="utf-8") as f:
        sql_content = f.read()
    
    statements = split_sql_statements(sql_content)
    print(f"Found {len(statements)} SQL statements")
    
    conn = psycopg2.connect(
        user=user, password=password, host=host, port=port, dbname=dbname
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    executed = 0
    errors = 0
    
    try:
        for i, stmt in enumerate(statements, 1):
            stmt_lower = stmt.lower().strip()
            if not stmt_lower:
                continue
            
            try:
                cursor.execute(stmt)
                executed += 1
                if executed % 50 == 0:
                    print(f"  Executed {executed} statements...")
            except Exception as e:
                errors += 1
                err_str = str(e).strip()
                if any(skip in err_str.lower() for skip in [
                    "already exists", "duplicate key", "does not exist"
                ]):
                    pass
                else:
                    print(f"\n  Warning [{i}]: {err_str[:150]}")
        
        print(f"\n✓ Migration done. Executed: {executed}, Warnings: {errors}")
        
        # Verify tables
        cursor.execute("""
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema IN ('foundation','identity','organization','crm')
            AND table_type = 'BASE TABLE'
            ORDER BY table_schema, table_name
        """)
        tables = cursor.fetchall()
        print(f"\nTables created ({len(tables)}):")
        for schema, table in tables:
            print(f"  {schema}.{table}")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        conn.close()
        sys.exit(1)
    
    conn.close()


if __name__ == "__main__":
    run_migration()