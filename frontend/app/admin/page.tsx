'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessContext } from '@/lib/api';
import { canNavigate } from '@/lib/navigation-access';

const destinations = [
  '/admin/organization',
  '/admin/configuration',
  '/admin/organization/branches',
  '/admin/organization/departments',
  '/admin/organization/designations',
  '/admin/organization/employees',
  '/admin/client-access',
  '/admin/organization/associates',
  '/admin/organization/agencies',
  '/admin/organization/arn-holders',
];

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    void getAccessContext(token).then((access) => {
      if (!access) {
        router.replace('/onboarding/organization');
      } else if (access.actor_type !== 'HEAD') {
        router.replace(access.actor_type === 'EMPLOYEE' ? '/employee-dashboard' : '/client-portal');
      } else {
        router.replace(destinations.find((path) => canNavigate(access, path)) ?? '/admin/subscription');
      }
    }).catch(() => router.replace('/login'));
  }, [router]);

  return <main className="min-h-screen bg-bone p-12 text-ash">Loading administration...</main>;
}
