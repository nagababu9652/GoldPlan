import type { GroupType } from './api';

export const GROUP_TYPES: Array<{ value: GroupType; label: string }> = [
  { value: 'HOUSEHOLD', label: 'Household' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'HUF', label: 'HUF' },
  { value: 'OTHER', label: 'Other' },
];

const HOUSEHOLD_RELATIONSHIPS = [
  'SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER',
  'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'DEPENDENT', 'MEMBER', 'OTHER',
];

export const GROUP_RELATIONSHIPS: Record<GroupType, string[]> = {
  HOUSEHOLD: HOUSEHOLD_RELATIONSHIPS,
  FAMILY: HOUSEHOLD_RELATIONSHIPS,
  BUSINESS: ['DIRECTOR', 'OWNER', 'PARTNER', 'SHAREHOLDER', 'EMPLOYEE', 'MEMBER', 'OTHER'],
  INVESTMENT: ['INVESTOR', 'BENEFICIAL_OWNER', 'MEMBER', 'OTHER'],
  TRUST: ['TRUSTEE', 'SETTLOR', 'BENEFICIARY', 'MEMBER', 'OTHER'],
  HUF: ['KARTA', 'MEMBER', 'OTHER'],
  OTHER: ['MEMBER', 'OTHER'],
};

export function getGroupRelationships(groupType: string): string[] {
  return GROUP_RELATIONSHIPS[groupType as GroupType] ?? GROUP_RELATIONSHIPS.OTHER;
}
