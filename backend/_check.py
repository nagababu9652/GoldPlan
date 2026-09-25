from sqlalchemy import text
from app.database.session import SessionLocal
from app.models.organization.core import Department

db = SessionLocal()
rows = db.execute(text(
    "select column_name, data_type from information_schema.columns "
    "where table_name='departments' order by ordinal_position"
)).fetchall()
print("DB COLUMNS:")
for r in rows:
    print(" ", r[0], r[1])
print("MODEL COLUMNS:")
for c in Department.__table__.columns:
    print(" ", c.name)
db.close()

from app.database.session import SessionLocal
from app.models.organization.core import Organization


from app.database.session import SessionLocal
from app.models.organization.employee import Employee

db = SessionLocal()
print('ORGANIZATIONS:')
try:
    for o in db.query(Organization).all():
        print(o.id, o.organization_code, o.display_name, o.is_active)
except Exception as e:
    print('QUERY ERROR:', type(e).__name__)
    print(str(e))
print('EMPLOYEES:', db.query(Employee).count())
db.close()
