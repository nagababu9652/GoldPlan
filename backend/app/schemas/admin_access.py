from pydantic import BaseModel


class LoginAccessResponse(BaseModel):
    employee_id: int
    user_id: int
    account_status: str
    is_active: bool
    revoked_sessions: int

