'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGroup, updateGroup, getClients, assignClientToGroup, removeClientFromGroup, setGroupHead, deleteGroup, type Group, type Client } from '@/lib/api';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupClients, setGroupClients] = useState<Client[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

  const loadData = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      const [groupData, allClients] = await Promise.all([
        getGroup(token, Number(params.id)),
        getClients(token, { page_size: 100 }),
      ]);
      setGroup(groupData);
      setFormData(groupData);
      const members = allClients.clients.filter((c) => c.group_id === groupData.id);
      const nonMembers = allClients.clients.filter((c) => c.group_id !== groupData.id && c.is_active);
      setGroupClients(members);
      setAvailableClients(nonMembers);
    } catch (err: any) {
      alert(err.message);
      router.push('/advisor-dashboard/groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleSave = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !group) return;
    setSaving(true);
    try {
      await updateGroup(token, group.id, formData);
      setEditing(false);
      loadData();
      alert('Group updated successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignClient = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !group || selectedClientId === '') return;
    try {
      await assignClientToGroup(token, group.id, Number(selectedClientId));
      setSelectedClientId('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveClient = async (clientId: number) => {
    if (!confirm('Remove this client from the group?')) return;
    const token = localStorage.getItem('finplan_token');
    if (!token || !group) return;
    try {
      await removeClientFromGroup(token, group.id, clientId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetHead = async (clientId: number) => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !group) return;
    try {
      await setGroupHead(token, group.id, clientId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this group? Clients will be unassigned.')) return;
    const token = localStorage.getItem('finplan_token');
    if (!token || !group) return;
    try {
      await deleteGroup(token, group.id);
      router.push('/advisor-dashboard/groups');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading group details...</div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="label-mono text-ash mb-3">&mdash; Group Details</div>
            <h1 className="display text-[36px] lg:text-[48px]">{group.name}</h1>
            <p className="text-ash text-[16px] mt-2">
              <span className="font-mono uppercase tracking-wider2 text-[12px] border px-3 py-1 mr-3">{group.group_type}</span>
              {group.client_count} member{group.client_count !== 1 ? 's' : ''}
              {group.head_client_name && ` · Head: ${group.head_client_name}`}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/advisor-dashboard/groups')}
              className="px-6 py-3 border border-obsidian text-[14px] font-mono uppercase tracking-wider2 hover:bg-bone-deep transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className={`px-6 py-3 border text-[14px] font-mono uppercase tracking-wider2 transition-colors ${
                editing ? 'border-obsidian bg-bone text-obsidian' : 'bg-obsidian text-bone'
              }`}
            >
              {editing ? 'Cancel' : 'Edit Group'}
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 border border-red-500 text-red-600 text-[14px] font-mono uppercase tracking-wider2 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Group Info */}
        <div className="border border-obsidian bg-bone p-6 lg:p-8 mb-8">
          <h2 className="label-mono text-ash mb-6">Group Information</h2>
          {editing ? (
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Type</label>
                <select
                  value={formData.group_type || 'family'}
                  onChange={(e) => setFormData({...formData, group_type: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                >
                  <option value="family">Family</option>
                  <option value="HUF">HUF</option>
                  <option value="trust">Trust</option>
                  <option value="corporate">Corporate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Type</div>
                <div className="font-medium">{group.group_type}</div>
              </div>
              <div>
                <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Members</div>
                <div className="font-medium">{group.client_count}</div>
              </div>
              <div>
                <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Total Investment</div>
                <div className="font-medium">₹{group.total_investment.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Status</div>
                <div className={`font-medium ${group.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                  {group.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              {group.email && (
                <div>
                  <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Email</div>
                  <div className="font-medium">{group.email}</div>
                </div>
              )}
              {group.phone && (
                <div>
                  <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">Phone</div>
                  <div className="font-medium">{group.phone}</div>
                </div>
              )}
              {group.city && (
                <div>
                  <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">City</div>
                  <div className="font-medium">{group.city}</div>
                </div>
              )}
              {group.state && (
                <div>
                  <div className="text-[12px] font-mono uppercase tracking-wider2 text-ash mb-1">State</div>
                  <div className="font-medium">{group.state}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Member */}
        <div className="border border-obsidian bg-bone p-6 lg:p-8 mb-8">
          <h2 className="label-mono text-ash mb-6">Assign Client to Group</h2>
          <div className="flex gap-4">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
            >
              <option value="">Select a client...</option>
              {availableClients.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.email ? `(${c.email})` : ''}</option>
              ))}
            </select>
            <button
              onClick={handleAssignClient}
              disabled={selectedClientId === ''}
              className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>

        {/* Member Clients */}
        <div className="border border-obsidian bg-bone">
          <div className="px-6 lg:px-8 py-4 border-b border-line">
            <h2 className="label-mono text-ash">Members ({groupClients.length})</h2>
          </div>
          {groupClients.length === 0 ? (
            <div className="px-6 lg:px-8 py-12 text-center text-ash">
              No clients assigned to this group yet.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {groupClients.map((client) => (
                <div key={client.id} className="px-6 lg:px-8 py-4 flex items-center justify-between hover:bg-bone-deep transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {client.first_name} {client.last_name}
                        {group.head_client_id === client.id && (
                          <span className="ml-2 text-[11px] font-mono uppercase tracking-wider2 border border-antique bg-antique-light text-obsidian px-2 py-0.5">
                            Head
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-ash font-mono">
                        {client.email || 'No email'} · {client.phone || 'No phone'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {group.head_client_id !== client.id && (
                      <button
                        onClick={() => handleSetHead(client.id)}
                        className="text-[12px] font-mono uppercase tracking-wider2 u-link"
                      >
                        Set as Head
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveClient(client.id)}
                      className="text-[12px] font-mono uppercase tracking-wider2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}