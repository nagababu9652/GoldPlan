"""
Models package - all SQLAlchemy models organized by module.

Foundation: Shared master data (geography, lookups, parties, documents, masters)
Identity: Authentication, authorization, security, audit
Organization: Organization hierarchy, employees, assignments
CRM: Customer groups, customers, KYC, relationships
"""
from .base import Base, AuditMixin

# Foundation models
from .foundation import (
    Country, State, City,
    LookupCategory, LookupValue,
    Party, PartyAddress, PartyContact, PartyBankAccount,
    DocumentCategory, DocumentType, Document, DocumentFile,
    Currency, FinancialYear,
)

# Identity models
from .identity import (
    User, AuthenticationMethod, PasswordHistory, OTPRequest, UserSession, RefreshToken, LoginHistory,
    Permission, Role, PermissionProfile, ProfilePermission, RolePermissionProfile, UserRole,
    Device, UserDevice, AccountLockout, SecurityEvent, AuditLog,
)

# Organization models
from .organization import (
    Organization, Branch, Department, Designation, OrganizationSetting,
    Employee, EmployeeRole, EmployeeReporting, EmployeeBranchHistory, EmployeeDepartmentHistory,
    EmployeeAssignment, EmployeeSkill, EmployeeCertification, OrganizationHoliday,
)

# CRM models
from .crm import (
    CustomerGroup, Customer, GroupMember, CustomerStatusHistory,
    CustomerRelationship, GroupMergeHistory, GroupSplitHistory, CustomerMergeHistory, GroupMemberOrder,
    CustomerKYC, CustomerFATCA, CustomerRiskProfile, CustomerCommunicationPreference, CustomerKYCHistory,
)

__all__ = [
    # Base
    "Base", "AuditMixin",

    # Foundation
    "Country", "State", "City",
    "LookupCategory", "LookupValue",
    "Party", "PartyAddress", "PartyContact", "PartyBankAccount",
    "DocumentCategory", "DocumentType", "Document", "DocumentFile",
    "Currency", "FinancialYear",

    # Identity
    "User", "AuthenticationMethod", "PasswordHistory", "OTPRequest", "UserSession", "RefreshToken", "LoginHistory",
    "Permission", "Role", "PermissionProfile", "ProfilePermission", "RolePermissionProfile", "UserRole",
    "Device", "UserDevice", "AccountLockout", "SecurityEvent", "AuditLog",

    # Organization
    "Organization", "Branch", "Department", "Designation", "OrganizationSetting",
    "Employee", "EmployeeRole", "EmployeeReporting", "EmployeeBranchHistory", "EmployeeDepartmentHistory",
    "EmployeeAssignment", "EmployeeSkill", "EmployeeCertification", "OrganizationHoliday",

    # CRM
    "CustomerGroup", "Customer", "GroupMember", "CustomerStatusHistory",
    "CustomerRelationship", "GroupMergeHistory", "GroupSplitHistory", "CustomerMergeHistory", "GroupMemberOrder",
    "CustomerKYC", "CustomerFATCA", "CustomerRiskProfile", "CustomerCommunicationPreference", "CustomerKYCHistory",
]