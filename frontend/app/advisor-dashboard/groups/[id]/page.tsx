'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  getGroup,
  updateGroup,
  getClients,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  changeGroupHead,
  setPrimaryGroup,
  deactivateGroup,
  type Group,
  type GroupMember,
  type GroupUpdatePayload,
  type Client,
} from '@/lib/api';

const GROUP_TYPES = [
  { value: 'HOUSEHOLD', label: 'Household' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'HUF', label: 'HUF' },
  { value: 'OTHER', label: 'Other' },
];

const RELATIONSHIP_TYPES = [
  'SELF',
  'SPOUSE',
  'SON',
  'DAUGHTER',
  'FATHER',
  'MOTHER',
  'BROTHER',
  'SISTER',
  'GRANDFATHER',
  'GRANDMOTHER',
  'OTHER',
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState<GroupUpdatePayload>({
    group_name: '',
    group_type: 'HOUSEHOLD',
    risk_profile: null,
    investment_objective: null,
    remarks: null,
  });

  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [selectedRelationship, setSelectedRelationship] =
    useState('OTHER');

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('finplan_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      const [groupData, memberData, clientData] =
        await Promise.all([
          getGroup(token, groupId),
          getGroupMembers(token, groupId),
          getClients(token, { page_size: 100 }),
        ]);

      setGroup(groupData);
      setMembers(memberData.members);

      setFormData({
        group_name: groupData.group_name,
        group_type: groupData.group_type,
        risk_profile: groupData.risk_profile,
        investment_objective: groupData.investment_objective,
        remarks: groupData.remarks,
      });

      const memberIds = new Set(
        memberData.members
          .filter((member) => !member.left_on)
          .map((member) => member.customer_id)
      );

      const available = clientData.clients.filter(
        (client) =>
          client.is_active &&
          !memberIds.has(client.id)
      );

      setAvailableClients(available);
    } catch (err: unknown) {
      console.error('Failed to load group:', err);
      alert(err instanceof Error ? err.message : 'Failed to load group');
      router.push('/advisor-dashboard/groups');
    } finally {
      setLoading(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!Number.isNaN(groupId)) {
      void loadData();
    }
  }, [groupId, loadData]);

  const handleSave = async () => {
    const token = localStorage.getItem('finplan_token');

    if (!token || !group) return;

    if (!formData.group_name?.trim()) {
      alert('Group name is required');
      return;
    }

    try {
      setSaving(true);

      await updateGroup(token, group.id, {
        ...formData,
        group_name: formData.group_name.trim(),
      });

      setEditing(false);
      await loadData();

      alert('Group updated successfully');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    const token = localStorage.getItem('finplan_token');

    if (
      !token ||
      !group ||
      selectedClientId === ''
    ) {
      return;
    }

    try {
      await addGroupMember(token, group.id, {
        customer_id: Number(selectedClientId),
        relationship_type: selectedRelationship,
        is_primary: false,
        is_group_head: members.length === 0,
      });

      setSelectedClientId('');
      setSelectedRelationship('OTHER');

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemoveMember = async (customerId: number) => {
    if (!group) return;

    const member = members.find(
      (item) => item.customer_id === customerId
    );

    if (!member) return;

    if (member.is_group_head) {
      alert(
        'The group head cannot be removed. Set another member as head first.'
      );
      return;
    }

    const confirmed = confirm(
      'Remove this client from the group?\n\nThe membership will be marked as ended and history will be preserved.'
    );

    if (!confirmed) return;

    const token = localStorage.getItem('finplan_token');

    if (!token) return;

    try {
      await removeGroupMember(
        token,
        group.id,
        customerId
      );

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleSetHead = async (customerId: number) => {
    const token = localStorage.getItem('finplan_token');

    if (!token || !group) return;

    try {
      await changeGroupHead(
        token,
        group.id,
        customerId
      );

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to change group head');
    }
  };

  const handleSetPrimary = async (customerId: number) => {
    const token = localStorage.getItem('finplan_token');

    if (!token || !group) return;

    try {
      await setPrimaryGroup(
        token,
        group.id,
        customerId
      );

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to set primary group');
    }
  };

  const handleDeactivate = async () => {
    if (!group || !group.is_active) return;

    const confirmed = confirm(
      `Deactivate "${group.group_name}"?\n\nThe group will become inactive and membership history will be preserved.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem('finplan_token');

    if (!token) return;

    try {
      await deactivateGroup(token, group.id);

      router.push('/advisor-dashboard/groups');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate group');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Group details
        </div>
        <div className="mt-4 text-sm text-ash">
          Loading group details...
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const activeMembers = members.filter(
    (member) => !member.left_on
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="dashboard-panel flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Group details
          </div>

          <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
            {group.group_name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-ash">
            <span className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
              {group.group_type}
            </span>

            <span className="text-sm text-ash">
              {group.group_code}
            </span>

            <span className="text-sm text-ash">
              {group.active_member_count} active member
              {group.active_member_count !== 1 ? 's' : ''}
            </span>

            {group.head_customer_name && (
              <span className="text-sm text-ash">
                · Head: {group.head_customer_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/advisor-dashboard/groups')}
            className="rounded-full border border-obsidian bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-obsidian transition-colors hover:bg-bone-deep"
          >
            Back
          </button>

          {group.is_active && (
            <>
              <button
                onClick={() => setEditing(!editing)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
                  editing
                    ? 'border border-obsidian bg-bone text-obsidian'
                    : 'bg-obsidian text-bone'
                }`}
              >
                {editing ? 'Cancel' : 'Edit Group'}
              </button>

              <button
                onClick={handleDeactivate}
                className="rounded-full border border-red-500 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-red-600 transition-colors hover:bg-red-50"
              >
                Deactivate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Group Information */}
      <div className="dashboard-panel p-6 lg:p-8">
        <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">
          Group Information
        </h2>

        {editing ? (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Group Name *
                </label>

                <input
                  type="text"
                  value={formData.group_name ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">
                  Group Type
                </label>

                <select
                  value={formData.group_type ?? 'HOUSEHOLD'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                >
                  {GROUP_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
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
                      risk_profile:
                        e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                >
                  <option value="">Not specified</option>
                  <option value="CONSERVATIVE">
                    Conservative
                  </option>
                  <option value="MODERATE">
                    Moderate
                  </option>
                  <option value="AGGRESSIVE">
                    Aggressive
                  </option>
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
                      investment_objective:
                        e.target.value || null,
                    })
                  }
                  placeholder="e.g. Wealth creation"
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
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
                rows={4}
                className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !formData.group_name?.trim()
                }
                className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                Type
              </div>
              <div className="font-medium">
                {group.group_type}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                Members
              </div>
              <div className="font-medium">
                {group.active_member_count}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                Risk Profile
              </div>
              <div className="font-medium">
                {group.risk_profile || 'Not specified'}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                Status
              </div>
              <div
                className={`font-medium ${
                  group.is_active
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {group.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                Investment Objective
              </div>

              <div className="font-medium">
                {group.investment_objective ||
                  'Not specified'}
              </div>
            </div>

            {group.remarks && (
              <div className="sm:col-span-2 lg:col-span-4">
                <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">
                  Remarks
                </div>

                <div className="font-medium whitespace-pre-wrap">
                  {group.remarks}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Member */}
      {group.is_active && (
        <div className="border border-obsidian bg-bone p-6 lg:p-8">
          <h2 className="label-mono text-ash mb-6">
            Add Group Member
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-4">
            <select
              value={selectedClientId}
              onChange={(e) =>
                setSelectedClientId(
                  e.target.value
                    ? Number(e.target.value)
                    : ''
                )
              }
              className="px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
            >
              <option value="">
                Select a client...
              </option>

              {availableClients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.first_name} {client.last_name}
                  {client.email
                    ? ` — ${client.email}`
                    : ''}
                </option>
              ))}
            </select>

            <select
              value={selectedRelationship}
              onChange={(e) =>
                setSelectedRelationship(e.target.value)
              }
              className="px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
            >
              {RELATIONSHIP_TYPES.map((relationship) => (
                <option
                  key={relationship}
                  value={relationship}
                >
                  {relationship}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddMember}
              disabled={selectedClientId === ''}
              className="px-6 py-3 bg-obsidian text-bone text-[13px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="border border-obsidian bg-bone">
        <div className="px-6 lg:px-8 py-5 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="label-mono text-ash">
              Members
            </h2>

            <div className="text-[12px] text-ash mt-1">
              {activeMembers.length} active member
              {activeMembers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {activeMembers.length === 0 ? (
          <div className="px-6 lg:px-8 py-12 text-center text-ash">
            No active members in this group.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="px-6 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-bone-deep transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">
                      {member.display_name}
                    </div>

                    {member.is_group_head && (
                      <span className="text-[10px] font-mono uppercase tracking-wider2 border border-antique bg-antique-light text-obsidian px-2 py-0.5">
                        Head
                      </span>
                    )}

                    {member.is_primary && (
                      <span className="text-[10px] font-mono uppercase tracking-wider2 border border-emerald-700 text-emerald-700 px-2 py-0.5">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="text-[12px] text-ash font-mono mt-1">
                    {member.customer_code}
                    {' · '}
                    {member.relationship_type || 'OTHER'}
                    {' · '}
                    {member.email || 'No email'}
                    {' · '}
                    {member.phone || 'No phone'}
                  </div>
                </div>

                {group.is_active && (
                  <div className="flex flex-wrap items-center gap-4">
                    {!member.is_group_head && (
                      <button
                        onClick={() =>
                          handleSetHead(member.customer_id)
                        }
                        className="text-[12px] font-mono uppercase tracking-wider2 u-link"
                      >
                        Set as Head
                      </button>
                    )}

                    {!member.is_primary && (
                      <button
                        onClick={() =>
                          handleSetPrimary(member.customer_id)
                        }
                        className="text-[12px] font-mono uppercase tracking-wider2 u-link"
                      >
                        Set Primary
                      </button>
                    )}

                    {!member.is_group_head && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member.customer_id
                          )
                        }
                        className="text-[12px] font-mono uppercase tracking-wider2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}