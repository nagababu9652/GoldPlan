'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGroups, createGroup, deleteGroup, type Group, type GroupCreate } from '@/lib/api';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<GroupCreate>({
    name: '',
    group_type: 'family',
  });

  const loadGroups = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filterType) params.group_type = filterType;
      const data = await getGroups(token, params);
      setGroups(data.groups);
    } catch (err: any) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadGroups();
  }, [search, filterType]);

  const handleCreate = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !formData.name) return;
    try {
      await createGroup(token, formData);
      setShowAddModal(false);
      setFormData({ name: '', group_type: 'family' });
      loadGroups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this group? Clients in this group will be unassigned.')) return;
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      await deleteGroup(token, id);
      loadGroups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="label-mono text-ash mb-3">&mdash; Group Management</div>
            <h1 className="display text-[36px] lg:text-[48px]">Groups & Families</h1>
            <p className="text-ash text-[16px] mt-2">Organize clients into families, trusts, and groups</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors"
          >
            + Add Group
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search groups by name..."
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
            <option value="family">Family</option>
            <option value="HUF">HUF</option>
            <option value="trust">Trust</option>
            <option value="corporate">Corporate</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="border border-obsidian bg-bone p-12 text-center">
            <div className="text-[48px] mb-4">👨‍👩‍👧‍👦</div>
            <p className="text-ash text-[16px]">No groups found. Create your first group to organize clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="border border-obsidian bg-bone p-6 hover:bg-bone-deep transition-colors cursor-pointer"
                onClick={() => router.push(`/advisor-dashboard/groups/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-[20px]">{group.name}</h3>
                    <span className="text-[12px] font-mono uppercase tracking-wider2 text-ash">
                      {group.group_type}
                    </span>
                  </div>
                  <span className={`text-[12px] font-mono px-3 py-1 border ${
                    group.is_active ? 'border-emerald-700 text-emerald-700' : 'border-red-500 text-red-600'
                  }`}>
                    {group.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ash">Members</span>
                    <span className="font-medium">{group.client_count}</span>
                  </div>
                  {group.head_client_name && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-ash">Head</span>
                      <span className="font-medium">{group.head_client_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ash">Total Investment</span>
                    <span className="font-medium">₹{group.total_investment.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-line">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/advisor-dashboard/groups/${group.id}`);
                    }}
                    className="text-[12px] font-mono uppercase tracking-wider2 u-link"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(group.id);
                    }}
                    className="text-[12px] font-mono uppercase tracking-wider2 text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Group Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-bone border border-obsidian w-full max-w-lg mx-4">
              <div className="px-8 py-6 border-b border-line">
                <h2 className="font-serif text-[24px]">Add New Group</h2>
              </div>
              <div className="px-8 py-6 space-y-4">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Group Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="e.g., Sharma Family"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Group Type</label>
                  <select
                    value={formData.group_type}
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
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="Optional description..."
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
              </div>
              <div className="px-8 py-6 border-t border-line flex justify-end gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-obsidian text-[14px] font-mono uppercase tracking-wider2 hover:bg-bone-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.name}
                  className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}