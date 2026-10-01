"""
Main application entry point for FinPlan Advisor Center API.
Uses the new 4-schema architecture (foundation, identity, organization, crm).
"""
import time
from pathlib import Path

from fastapi import Depends, FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware

from .core.config import settings
from .middleware.cors import setup_cors

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_ROOT = BASE_DIR / "uploads"

# Import all new models to register them with Base metadata
# Foundation
from .models.foundation import (
    Country, State, City,
    LookupCategory, LookupValue,
    Party, PartyAddress, PartyContact, PartyBankAccount,
    DocumentCategory, DocumentType, Document, DocumentFile,
    Currency, FinancialYear,
)
# Identity
from .models.identity import (
    User, AuthenticationMethod, PasswordHistory, OTPRequest,
    UserSession, RefreshToken, LoginHistory,
    Permission, Role, PermissionProfile, ProfilePermission,
    RolePermissionProfile, UserRole,
    EmployeePermissionProfile, EmployeePermissionOverride,
    Device, UserDevice, AccountLockout, SecurityEvent, AuditLog,
)
# Organization
from .models.organization import (
    Organization, Branch, Department, Designation, OrganizationSetting,
    Employee, EmployeeRole, EmployeeReporting,
    EmployeeBranchHistory, EmployeeDepartmentHistory,
    EmployeeAssignment, EmployeeSkill, EmployeeCertification,
    OrganizationHoliday,
    SubscriptionPlan, OrganizationSubscription, SubscriptionEvent,
)
# CRM
from .models.crm import (
    CustomerGroup, Customer, GroupMember, CustomerStatusHistory,
    CustomerRelationship, GroupMergeHistory, GroupSplitHistory,
    CustomerMergeHistory, GroupMemberOrder,
    CustomerKYC, CustomerFATCA, CustomerRiskProfile,
    CustomerCommunicationPreference, CustomerKYCHistory,
    Transaction, transaction_history, FinancialGoal, FinancialAccount, Holding,
    ReportSnapshot,
)

# Routers
from .routers.market import router as market_router
from .routers.auth import router as auth_router
from .routers.advisors import router as advisors_router
from .routers.advisor.task import router as tasks_router
from .routers.clients import router as clients_router
from .routers.groups import router as groups_router
from .routers.onboarding import router as onboarding_router
from .routers.goals import router as goals_router
from .routers.financial_accounts import router as financial_accounts_router
from .routers.holdings import router as holdings_router
from .routers.admin_access import router as admin_access_router
from .routers.admin_organization import router as admin_organization_router
from .routers.admin_employees import router as admin_employees_router
from .routers.admin_permissions import router as admin_permissions_router
from .services.access import require_active_subscription, require_subscription_entitlement


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    # File storage
    upload_dir = UPLOAD_ROOT
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Serve uploaded files
    app.mount(
        "/uploads",
        StaticFiles(directory=str(upload_dir)),
        name="uploads",
    )
    
    # Add middleware for response timing
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Add gzip compression for better performance
    # Minimum size 1KB to avoid overhead on small responses
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    setup_cors(app)
    app.include_router(market_router)
    app.include_router(auth_router)
    active_subscription = [Depends(require_active_subscription)]
    app.include_router(advisors_router, dependencies=active_subscription)
    app.include_router(
        tasks_router, prefix="/advisors",
        dependencies=[Depends(require_subscription_entitlement("FEATURE.TASKS"))],
    )
    app.include_router(
        clients_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.CRM"))],
    )
    app.include_router(
        groups_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.GROUPS"))],
    )
    app.include_router(onboarding_router)
    app.include_router(
        goals_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.GOALS"))],
    )
    app.include_router(
        financial_accounts_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.PORTFOLIO"))],
    )
    app.include_router(
        holdings_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.PORTFOLIO"))],
    )
    app.include_router(
        admin_access_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.EMPLOYEE_MANAGEMENT"))],
    )
    app.include_router(admin_organization_router, dependencies=active_subscription)
    app.include_router(
        admin_employees_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.EMPLOYEE_MANAGEMENT"))],
    )
    app.include_router(
        admin_permissions_router,
        dependencies=[Depends(require_subscription_entitlement("FEATURE.EMPLOYEE_MANAGEMENT"))],
    )


    @app.get("/health")
    def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    return app


app = create_app()
