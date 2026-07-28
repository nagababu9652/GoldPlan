"""Fix PostgreSQL enum to use lowercase values."""
from app.database.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Drop the enum type
    conn.execute(text('DROP TYPE IF EXISTS userrole CASCADE'))
    conn.commit()
    print('Dropped userrole enum')
    
    # Create the new enum type with lowercase values
    conn.execute(text("CREATE TYPE userrole AS ENUM ('user', 'advisor', 'admin')"))
    conn.commit()
    print('Created userrole enum with lowercase values')