'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getGroups,
  createGroup,
  deactivateGroup,
  type Group,
  type GroupCreatePayload,
} from '@/lib/api';

import { GROUP_TYPES } from '@/lib/group-options';

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<GroupCreatePayload>({
    group_name: '',
    group_type: 'HOUSEHOLD',
    risk_profile: null,
    investment_objective: null,
    remarks: null,
    head_customer_id: null,
  });

  const loadGroups = useCallback(async () => {
    const token = localStorage.getItem('finplan_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      const data = await getGroups(token, {
        search: search.trim() || undefined,
        group_type: filterType || undefined,
      });

      setGroups(data.groups);
    } catch (err: unknown) {
      console.error('Failed to load groups:', err);
      alert(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [filterType, router, search]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const handleCreate = async () => {
    const token = localStorage.getItem('finplan_token');

    if (!token || !formData.group_name.trim()) {
      return;
    }

    try {
      setSaving(true);

      await createGroup(token, {
        ...formData,
        group_name: formData.group_name.trim(),
      });

      setShowAddModal(false);

      setFormData({
        group_name: '',
        group_type: 'HOUSEHOLD',
        risk_profile: null,
        investment_objective: null,
        remarks: null,
        head_customer_id: null,
      });

      await loadGroups();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (group: Group) => {
    if (!group.is_active) return;

    const confirmed = confirm(
      `Deactivate "${group.group_name}"?\n\nThe group will be marked inactive. Its membership history will be preserved.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem('finplan_token');

    if (!token) return;

    try {
      await deactivateGroup(token, group.id);
      await loadGroups();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate group');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Group management</div>
        <div className="mt-4 text-sm text-ash">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="dashboard-panel flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Group management
          </div>

          <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
            Groups & Households
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
            Organize clients into households, families, businesses and other
            financial groups.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start rounded-full bg-obsidian px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-obsidian/90 lg:self-auto"
        >
          + Add Group
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search groups by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
        >
          <option value="">All Types</option>

          {GROUP_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="border border-obsidian bg-bone p-12 text-center">
          <div className="text-[48px] mb-4">👨‍👩‍👧‍👦</div>

          <p className="text-ash text-[16px]">
            No groups found.
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 px-5 py-2.5 bg-obsidian text-bone text-[13px] font-mono uppercase tracking-wider2"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="border border-obsidian bg-bone hover:bg-bone-deep transition-colors"
            >
              <div
                onClick={() =>
                  router.push(`/advisor-dashboard/groups/${group.id}`)
                }
                className="p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <h3 className="font-serif text-[20px] truncate">
                      {group.group_name}
                    </h3>

                    <div className="text-[11px] font-mono uppercase tracking-wider2 text-ash mt-1">
                      {group.group_code}
                    </div>

                    <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mt-2">
                      {group.group_type}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-[11px] font-mono uppercase tracking-wider2 px-3 py-1 border ${
                      group.is_active
                        ? 'border-emerald-700 text-emerald-700'
                        : 'border-red-500 text-red-600'
                    }`}
                  >
                    {group.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ash">Members</span>
                    <span className="font-medium">
                      {group.active_member_count}
                    </span>
                  </div>

                  {group?.head_customer_name && (
                    <div className="flex justify-between gap-4 text-[14px]">
                      <span className="text-ash">Head</span>
                      <span className="font-medium text-right truncate">
                        {group.head_customer_name}
                      </span>
                    </div>
                  )}

                  {group.risk_profile && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-ash">Risk Profile</span>
                      <span className="font-medium">
                        {group.risk_profile}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-line flex justify-between items-center">
                <button
                  onClick={() =>
                    router.push(`/advisor-dashboard/groups/${group.id}`)
                  }
                  className="text-[12px] font-mono uppercase tracking-wider2 u-link"
                >
                  View Group
                </button>

                {group.is_active && (
                  <button
                    onClick={() => handleDeactivate(group)}
                    className="text-[12px] font-mono uppercase tracking-wider2 text-red-600 hover:text-red-700"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-bone border border-obsidian w-full max-w-lg">
            <div className="px-8 py-6 border-b border-line">
              <h2 className="font-serif text-[24px]">
                Add New Group
              </h2>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Group Name *
                </label>

                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  placeholder="e.g. Sharma Family"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Group Type
                </label>

                <select
                  value={formData.group_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                >
                  {GROUP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Risk Profile
                </label>

                <select
                  value={formData.risk_profile ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      risk_profile: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                >
                  <option value="">Not specified</option>
                  <option value="CONSERVATIVE">Conservative</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="AGGRESSIVE">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Investment Objective
                </label>

                <input
                  type="text"
                  value={formData.investment_objective ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investment_objective: e.target.value || null,
                    })
                  }
                  placeholder="e.g. Wealth creation, retirement"
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Remarks
                </label>

                <textarea
                  value={formData.remarks ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value || null,
                    })
                  }
                  rows={3}
                  placeholder="Optional notes about this group..."
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-line flex justify-end gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={saving}
                className="px-6 py-3 border border-obsidian text-[14px] font-mono uppercase tracking-wider2 hover:bg-bone-deep transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={saving || !formData.group_name.trim()}
                className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
