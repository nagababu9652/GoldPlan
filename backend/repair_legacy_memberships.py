"""Preview the five legacy membership repairs; apply only with explicit leave dates.

Run from backend:
    python repair_legacy_memberships.py
    python repair_legacy_memberships.py --apply --cleanup-date YYYY-MM-DD
Or supply each actual date with --left-on 1=YYYY-MM-DD (also IDs 2 and 3).
Cleanup dates record reconciliation, not an inferred historical departure date.
"""

import argparse
from datetime import date

from sqlalchemy import text

from app.database.session import engine


# Membership ID -> (customer ID, group ID, group type, group active)
EXPECTED = {
    1: (1, 2, "FAMILY", False),
    2: (15, 3, "INDIVIDUAL", False),
    3: (4, 3, "INDIVIDUAL", False),
    4: (12, 4, "HOUSEHOLD", True),
    5: (15, 5, "HOUSEHOLD", True),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--cleanup-date", type=date.fromisoformat)
    parser.add_argument("--left-on", action="append", default=[], metavar="ID=YYYY-MM-DD")
    args = parser.parse_args()
    dates = {i: args.cleanup_date for i in (1, 2, 3)}
    for entry in args.left_on:
        key, value = entry.split("=", 1)
        if int(key) not in dates:
            parser.error("--left-on must identify membership 1, 2, or 3")
        dates[int(key)] = date.fromisoformat(value)
    if args.apply and not all(dates.values()):
        parser.error("Apply requires a leave date for each stale membership")

    with engine.begin() as conn:
        # Lock affected groups first, then memberships, only when applying.
        if args.apply:
            conn.execute(text("SELECT id FROM crm.customer_groups WHERE id IN (2,3,4,5) ORDER BY id FOR UPDATE"))
        query = """
            SELECT m.id, m.customer_id, m.customer_group_id, m.joined_on, m.left_on,
                   m.is_primary, m.is_group_head, g.group_type, g.is_active
            FROM crm.group_members m
            JOIN crm.customer_groups g ON g.id = m.customer_group_id
            WHERE m.id IN (1,2,3,4,5) ORDER BY m.id
        """
        if args.apply:
            query += " FOR UPDATE OF m"
        rows = conn.execute(text(query)).mappings().all()
        if len(rows) != len(EXPECTED):
            raise RuntimeError("Expected legacy memberships are missing; review before repair")
        for row in rows:
            identity = (row.customer_id, row.customer_group_id, row.group_type, row.is_active)
            if identity != EXPECTED[row.id]:
                raise RuntimeError(f"Membership {row.id} changed; review before repair")
            if row.id in dates:
                leave_date = dates[row.id]
                if leave_date and row.joined_on and leave_date < row.joined_on:
                    raise ValueError(f"Membership {row.id}: leave date precedes join date")
                if row.left_on is not None:
                    raise RuntimeError(f"Membership {row.id} is already closed; review before repair")
                print(f"Membership {row.id}: close on {leave_date or 'DATE REQUIRED'}, clear primary/head flags")
            else:
                if row.left_on is not None:
                    raise RuntimeError(f"Membership {row.id} is no longer active")
                print(f"Membership {row.id}: set primary=True")
        print("Groups 2 and 3: clear head references; retain inactive status and original group types")
        if not args.apply:
            print("Preview only. No data changed.")
            return

        # Release stale primary slots before enabling the correct household flags.
        for member_id, leave_date in dates.items():
            conn.execute(text("""
                UPDATE crm.group_members
                SET left_on=:left_on, is_primary=false, is_group_head=false
                WHERE id=:id
            """), {"left_on": leave_date, "id": member_id})
        conn.execute(text("UPDATE crm.customer_groups SET head_customer_id=NULL WHERE id IN (2,3)"))
        conn.execute(text("UPDATE crm.group_members SET is_primary=true WHERE id IN (4,5)"))
    print("Repair committed atomically.")


if __name__ == "__main__":
    main()
