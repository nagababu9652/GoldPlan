import type { AccessContext } from '@/lib/api';

const requirements: Record<string, { permission?: string; feature?: string; head?: boolean }> = {
  '/admin/organization': { permission: 'ORG.PROFILE.READ', head: true },
  '/admin/configuration': { permission: 'ORG.CONFIG.READ', head: true },
  '/admin/organization/branches': { permission: 'ORG.BRANCH.READ', head: true },
  '/admin/organization/departments': { permission: 'ORG.DEPARTMENT.READ', head: true },
  '/admin/organization/designations': { permission: 'ORG.DESIGNATION.READ', head: true },
  '/admin/organization/employees': { permission: 'ORG.EMPLOYEE.READ', head: true },
  '/admin/client-access': { permission: 'ORG.INVITATION.READ', head: true },
  '/admin/organization/associates': { permission: 'ORG.ASSOCIATE.READ', head: true },
  '/admin/organization/agencies': { permission: 'ORG.AGENCY.READ', head: true },
  '/admin/organization/arn-holders': { permission: 'ORG.ARN.READ', head: true },
  '/admin/subscription': { head: true },
  '/advisor-dashboard/clients': { permission: 'CLIENT.READ', feature: 'FEATURE.CRM' },
  '/advisor-dashboard/groups': { permission: 'GROUP.READ', feature: 'FEATURE.GROUPS' },
  '/advisor-dashboard/meetings': { permission: 'MEETING.READ', feature: 'FEATURE.MEETINGS' },
  '/advisor-dashboard/tasks': { permission: 'TASK.READ', feature: 'FEATURE.TASKS' },
  '/advisor-dashboard/portfolio': { permission: 'HOLDING.READ', feature: 'FEATURE.PORTFOLIO' },
  '/advisor-dashboard/reports': { permission: 'REPORT.READ', feature: 'FEATURE.REPORTS' },
  '/advisor-dashboard/documents': { permission: 'DOCUMENT.READ', feature: 'FEATURE.DOCUMENTS' },
  '/advisor-dashboard/transactions': { permission: 'TRANSACTION.READ', feature: 'FEATURE.TRANSACTIONS' },
  '/employee-dashboard/clients': { permission: 'CLIENT.READ', feature: 'FEATURE.CRM' },
};

export function hasPermission(access: AccessContext, code: string): boolean {
  return access.permissions.includes(code) && !access.denied_permissions.includes(code);
}

export function canNavigate(access: AccessContext | null, path: string): boolean {
  if (!access) return false;
  const requirement = requirements[path];
  if (!requirement) return true;
  if (requirement.head && access.actor_type !== 'HEAD') return false;
  if (requirement.permission && !hasPermission(access, requirement.permission)) return false;
  if (requirement.feature && (!access.subscription_active || !access.entitlements.includes(requirement.feature))) return false;
  return true;
}
