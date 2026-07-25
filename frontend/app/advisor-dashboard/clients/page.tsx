'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClients, createClient, deleteClient, getGroups, type Client, type ClientCreate, type Group } from '@/lib/api';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | ''>('');
  const [filterKyc, setFilterKyc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<ClientCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const loadClients = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filterGroup !== '') params.group_id = filterGroup;
      if (filterKyc) params.kyc_status = filterKyc;
      const data = await getClients(token, params);
      setClients(data.clients);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      const data = await getGroups(token);
      setGroups(data.groups);
    } catch (err) {}
  };

  useEffect(() => {
    loadClients();
    loadGroups();
  }, []);

  useEffect(() => {
    loadClients();
  }, [search, filterGroup, filterKyc]);

  const handleCreate = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !formData.first_name || !formData.last_name) return;
    try {
      await createClient(token, formData);
      setShowAddModal(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '' });
      loadClients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this client?')) return;
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    try {
      await deleteClient(token, id);
      loadClients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="label-mono text-ash mb-3">&mdash; Client Management</div>
            <h1 className="display text-[36px] lg:text-[48px]">Clients</h1>
            <p className="text-ash text-[16px] mt-2">Manage your client base</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors"
          >
            + Add Client
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, phone, or PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            value={filterKyc}
            onChange={(e) => setFilterKyc(e.target.value)}
            className="px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
          >
            <option value="">All KYC Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Clients Table */}
        <div className="border border-obsidian bg-bone overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-6 py-4 label-mono text-ash">Name</th>
                <th className="text-left px-6 py-4 label-mono text-ash">Contact</th>
                <th className="text-left px-6 py-4 label-mono text-ash">Group</th>
                <th className="text-left px-6 py-4 label-mono text-ash">Risk Profile</th>
                <th className="text-left px-6 py-4 label-mono text-ash">KYC</th>
                <th className="text-left px-6 py-4 label-mono text-ash">Status</th>
                <th className="text-right px-6 py-4 label-mono text-ash">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ash">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-bone-deep transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/advisor-dashboard/clients/${client.id}`)}
                        className="font-medium hover:underline text-left"
                      >
                        {client.first_name} {client.last_name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px]">{client.email || '-'}</div>
                      <div className="text-[12px] text-ash font-mono">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px]">{client.group_name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {client.risk_profile ? (
                        <span className={`text-[12px] font-mono px-3 py-1 border ${
                          client.risk_profile === 'aggressive' ? 'border-red-500 text-red-600' :
                          client.risk_profile === 'moderate' ? 'border-yellow-500 text-yellow-700' :
                          'border-emerald-700 text-emerald-700'
                        }`}>
                          {client.risk_profile}
                        </span>
                      ) : (
                        <span className="text-ash text-[14px]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[12px] font-mono px-3 py-1 border ${
                        client.kyc_status === 'verified' ? 'border-emerald-700 text-emerald-700' :
                        client.kyc_status === 'rejected' ? 'border-red-500 text-red-600' :
                        'border-ash text-ash'
                      }`}>
                        {client.kyc_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[12px] font-mono ${client.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/advisor-dashboard/clients/${client.id}`)}
                        className="text-[12px] font-mono uppercase tracking-wider2 u-link mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-[12px] font-mono uppercase tracking-wider2 text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-bone border border-obsidian w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-8 py-6 border-b border-line">
                <h2 className="font-serif text-[24px]">Add New Client</h2>
              </div>
              <div className="px-8 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Group</label>
                  <select
                    value={formData.group_id || ''}
                    onChange={(e) => setFormData({...formData, group_id: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">No Group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
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
                  disabled={!formData.first_name || !formData.last_name}
                  className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}