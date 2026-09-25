from sqlalchemy import text
from app.database.session import SessionLocal

db = SessionLocal()
rows = db.execute(text(
    "select table_name, column_name, data_type, is_nullable, column_default "
    "from information_schema.columns "
    "where table_schema='organization' and table_name='departments' "
    "order by ordinal_position"
)).fetchall()
for r in rows:
    print(r)
db.close()