"""Versioned, organization-scoped application configuration."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.identity.security import AuditLog
from ..models.organization.configuration import ApplicationConfigurationVersion
from ..models.organization.core import Organization
from ..schemas.application_configuration import (
    CONFIG_SCHEMAS, ConfigSection, ConfigurationSave, ConfigurationVersionResponse,
)
from ..services.access import AccessContext, require_head, require_permission


router = APIRouter(prefix="/admin/configuration", tags=["admin-configuration"])


def permissions(code: str):
    return [Depends(require_head), Depends(require_permission(code))]


def latest(db: Session, organization_id: int, section: ConfigSection):
    return (
        db.query(ApplicationConfigurationVersion)
        .filter(
            ApplicationConfigurationVersion.organization_id == organization_id,
            ApplicationConfigurationVersion.section == section.value,
        )
        .order_by(ApplicationConfigurationVersion.version.desc())
        .first()
    )


@router.get("/{section}", response_model=ConfigurationVersionResponse | None,
            dependencies=permissions("ORG.CONFIG.READ"))
def get_configuration(section: ConfigSection, context: AccessContext = Depends(require_head),
                      db: Session = Depends(get_db)):
    return latest(db, context.organization_id, section)


@router.get("/{section}/history", response_model=list[ConfigurationVersionResponse],
            dependencies=permissions("ORG.CONFIG.READ"))
def list_configuration_history(section: ConfigSection, context: AccessContext = Depends(require_head),
                               db: Session = Depends(get_db)):
    return (
        db.query(ApplicationConfigurationVersion)
        .filter(
            ApplicationConfigurationVersion.organization_id == context.organization_id,
            ApplicationConfigurationVersion.section == section.value,
        )
        .order_by(ApplicationConfigurationVersion.version.desc())
        .all()
    )


@router.put("/{section}", response_model=ConfigurationVersionResponse,
            dependencies=permissions("ORG.CONFIG.UPDATE"))
def save_configuration(section: ConfigSection, payload: ConfigurationSave,
                       context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    try:
        values = CONFIG_SCHEMAS[section].model_validate(payload.values).model_dump(mode="json")
    except ValidationError as exc:
        raise HTTPException(422, exc.errors(include_context=False, include_url=False)) from exc

    organization = (
        db.query(Organization)
        .filter(Organization.id == context.organization_id)
        .with_for_update()
        .first()
    )
    if organization is None:
        raise HTTPException(404, "Organization not found")
    current = latest(db, context.organization_id, section)
    current_version = current.version if current else 0
    if payload.expected_version != current_version:
        raise HTTPException(409, "Configuration changed; reload before saving")
    if current and current.values == values:
        return current

    row = ApplicationConfigurationVersion(
        organization_id=context.organization_id,
        section=section.value,
        version=current_version + 1,
        values=values,
        created_by=context.user_id,
    )
    db.add(row)
    db.flush()
    db.add(AuditLog(
        organization_id=context.organization_id,
        user_id=context.user_id,
        module_name="APPLICATION_CONFIGURATION",
        table_name="application_configuration_versions",
        record_id=row.id,
        action="CREATE",
        old_values={"version": current_version},
        new_values={"section": section.value, "version": row.version, "values": values},
        session_id=context.session_id,
    ))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(row)
    return row
