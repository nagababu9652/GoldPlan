"""Compatibility shim for the legacy user import path.

The application now uses the canonical identity schema under
app.models.identity.auth.User. Keeping this module as a thin alias prevents
duplicate SQLAlchemy model registrations while preserving older imports.
"""

from .identity.auth import User

__all__ = ["User"]