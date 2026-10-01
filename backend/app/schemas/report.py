from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ReportSnapshotCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(default=None, min_length=1, max_length=250)


class ReportSnapshotSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    report_type: str
    report_date: date
    period_start: date
    period_end: date
    created_at: datetime


class ReportSnapshotResponse(ReportSnapshotSummary):
    assumptions: dict[str, Any]
    payload: dict[str, Any]


class ReportSnapshotListResponse(BaseModel):
    reports: list[ReportSnapshotSummary]
    total: int
