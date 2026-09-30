'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  getGroup,
  updateGroup,
  getClients,
  getGroupMembers,
  getGroupMembershipHistory,
  addGroupMember,
  moveClientToHousehold,
  removeGroupMember,
  changeGroupHead,
  deactivateGroup,
  type Group,
  type GroupMember,
  type GroupUpdatePayload,
  type Client,
} from '@/lib/api';

import { getGroupRelationships } from '@/lib/group-options';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membershipHistory, setMembershipHistory] = useState<GroupMember[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
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

  const [replacementHeadId, setReplacementHeadId] =
    useState<number | ''>('');

  const [replacementHeadOptions, setReplacementHeadOptions] =
    useState<GroupMember[]>([]);

  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [selectedRelationship, setSelectedRelationship] =
    useState('OTHER');

  const activeMembers = members.filter(
    (member) => !member.left_on
  );
  const canRemoveSoleHouseholdHead =
    (group?.group_type === 'HOUSEHOLD' || group?.group_type === 'FAMILY') &&
    activeMembers.length === 1;

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('finplan_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setHistoryError(null);

      const [groupData, memberData, clientData, historyData] =
        await Promise.all([
          getGroup(token, groupId),
          getGroupMembers(token, groupId),
          getClients(token, { page_size: 100 }),
          getGroupMembershipHistory(token, groupId).catch((err: unknown) => {
            setHistoryError(
              err instanceof Error ? err.message : 'Failed to load membership history'
            );
            return null;
          }),
        ]);

      setGroup(groupData);
      setSelectedRelationship((current) =>
        getGroupRelationships(groupData.group_type).includes(current) ? current : 'OTHER'
      );
      setMembers(memberData.members);
      setMembershipHistory(historyData?.members ?? []);

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
        is_group_head: activeMembers.length === 0,
      });

      setSelectedClientId('');
      setSelectedRelationship('OTHER');

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleMoveMemberHere = async () => {
    const token = localStorage.getItem('finplan_token');

    if (
      !token ||
      !group ||
      selectedClientId === ''
    ) {
      return;
    }

    const selectedClient = availableClients.find(
      (client) => client.id === Number(selectedClientId)
    );

    if (!selectedClient) {
      alert('Selected client was not found.');
      return;
    }

    try {
      let newHeadCustomerId: number | null = null;

      // Client currently belongs to another household.
      if (
        selectedClient.group_id &&
        selectedClient.group_id !== group.id
      ) {
        const sourceMembersResponse =
          await getGroupMembers(
            token,
            selectedClient.group_id
          );

        const sourceActiveMembers =
          sourceMembersResponse.members.filter(
            (member) => !member.left_on
          );

        const movingMember =
          sourceActiveMembers.find(
            (member) =>
              member.customer_id === selectedClient.id
          );

        const remainingMembers =
          sourceActiveMembers.filter(
            (member) =>
              member.customer_id !== selectedClient.id
          );

        // If the moving client is the old household head
        // and people remain, a replacement head is required.
        if (
          movingMember?.is_group_head &&
          remainingMembers.length > 0
        ) {
          setReplacementHeadOptions(
            remainingMembers
          );

          if (replacementHeadId === '') {
            alert(
              'This client is the head of their current household. ' +
              'Select a replacement head first.'
            );

            return;
          }

          newHeadCustomerId =
            Number(replacementHeadId);
        }
      }

      const confirmed = confirm(
        'Move this client to this household?\n\n' +
        'Their previous household membership will be ' +
        'preserved in history.'
      );

      if (!confirmed) return;

      await moveClientToHousehold(
        token,
        group.id,
        {
          customer_id: selectedClient.id,
          relationship_type: selectedRelationship,
          new_head_customer_id:
            newHeadCustomerId,
        }
      );

      setSelectedClientId('');
      setSelectedRelationship('OTHER');
      setReplacementHeadId('');
      setReplacementHeadOptions([]);

      await loadData();

      alert('Client moved successfully');
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to move client'
      );
    }
  };

  const handleRemoveMember = async (customerId: number) => {
    if (!group) return;

    const member = members.find(
      (item) => item.customer_id === customerId
    );

    if (!member) return;

    if (member.is_group_head && !canRemoveSoleHouseholdHead) {
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
          <div className="space-y-3 max-w-3xl">
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

                <input
                  type="text"
                  value={formData.group_type ?? ''}
                  disabled
                  className="w-full px-4 py-3 border border-line bg-bone-deep text-[14px] text-ash cursor-not-allowed"
                />
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
              onChange={(e) => {
                setSelectedClientId(
                  e.target.value
                    ? Number(e.target.value)
                    : ''
                );
                setReplacementHeadId('');
                setReplacementHeadOptions([]);
              }}
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
              {getGroupRelationships(group.group_type).map((relationship) => (
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

            {(group.group_type === 'HOUSEHOLD' ||
              group.group_type === 'FAMILY') && (
              <button
                type="button"
                onClick={handleMoveMemberHere}
                disabled={selectedClientId === ''}
                className="rounded-full border border-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-obsidian transition-colors hover:bg-bone-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                Move Client Here
              </button>
            )}
          </div>

          {replacementHeadOptions.length > 0 && (
            <div className="mt-4 border border-amber-300 bg-amber-50 p-4">
              <label
                htmlFor="replacement-head"
                className="mb-2 block text-[12px] font-mono uppercase tracking-wider2 text-ash"
              >
                Replacement Head for Current Household
              </label>

              <select
                id="replacement-head"
                value={replacementHeadId}
                onChange={(e) =>
                  setReplacementHeadId(
                    e.target.value
                      ? Number(e.target.value)
                      : ''
                  )
                }
                className="w-full border border-line bg-bone px-4 py-3 text-[14px] focus:border-obsidian focus:outline-none"
              >
                <option value="">
                  Select new household head...
                </option>

                {replacementHeadOptions.map((member) => (
                  <option
                    key={member.id}
                    value={member.customer_id}
                  >
                    {member.display_name}
                    {' — '}
                    {member.relationship_type || 'MEMBER'}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-ash">
                The selected client is currently the household head.
                Choose another active member before moving them.
              </p>
            </div>
          )}
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

                    {(!member.is_group_head || canRemoveSoleHouseholdHead) && (
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
      {/* Membership History */}
      <section
        aria-labelledby="membership-history-heading"
        className="border border-obsidian bg-bone"
      >
        <div className="px-6 lg:px-8 py-5 border-b border-line">
          <h2 id="membership-history-heading" className="label-mono text-ash">
            Membership History
          </h2>
          <p className="mt-1 text-[12px] text-ash">
            All membership periods, including current members. Newest first.
          </p>
        </div>

        {historyError ? (
          <div role="alert" className="px-6 lg:px-8 py-6 text-sm text-red-600">
            {historyError}
            <button
              type="button"
              onClick={() => void loadData()}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        ) : membershipHistory.length === 0 ? (
          <div className="px-6 lg:px-8 py-12 text-center text-ash">
            No membership history for this group.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-bone-deep text-[12px] text-ash">
                <tr>
                  <th scope="col" className="px-6 py-3 lg:pl-8">Client</th>
                  <th scope="col" className="px-6 py-3">Relationship</th>
                  <th scope="col" className="px-6 py-3">Joined</th>
                  <th scope="col" className="px-6 py-3">Left</th>
                  <th scope="col" className="px-6 py-3 lg:pr-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {membershipHistory.map((membership) => (
                  <tr key={membership.id} className="hover:bg-bone-deep">
                    <td className="px-6 py-4 lg:pl-8">
                      <div className="font-medium">{membership.display_name}</div>
                      <div className="mt-1 text-[12px] font-mono text-ash">
                        {membership.customer_code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {membership.relationship_type || 'MEMBER'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {membership.joined_on ? (
                        <time dateTime={membership.joined_on}>{membership.joined_on}</time>
                      ) : 'Not recorded'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {membership.left_on ? (
                        <time dateTime={membership.left_on}>{membership.left_on}</time>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 lg:pr-8">
                      <span className={`text-[12px] font-medium ${
                        membership.left_on ? 'text-ash' : 'text-emerald-700'
                      }`}>
                        {membership.left_on ? 'Ended' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
