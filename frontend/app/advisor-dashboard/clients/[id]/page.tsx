'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClient, updateClient, getGroups, type Client, type Group } from '@/lib/api';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    const loadData = async () => {
      try {
        const [clientData, groupsData] = await Promise.all([
          getClient(token, Number(params.id)),
          getGroups(token),
        ]);
        setClient(clientData);
        setGroups(groupsData.groups);
        setFormData(clientData);
      } catch (err: any) {
        alert(err.message);
        router.push('/advisor-dashboard/clients');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const handleSave = async () => {
    const token = localStorage.getItem('finplan_token');
    if (!token || !client) return;
    setSaving(true);
    try {
      const updated = await updateClient(token, client.id, formData);
      setClient(updated);
      setFormData(updated);
      alert('Client updated successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading client details...</div>
      </div>
    );
  }

  if (!client) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'address', label: 'Address' },
    { id: 'financial', label: 'Financial Profile' },
    { id: 'nominee', label: 'Nominee' },
    { id: 'banking', label: 'Banking' },
    { id: 'kyc', label: 'KYC & Notes' },
  ];

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="label-mono text-ash mb-3">&mdash; Client Details</div>
            <h1 className="display text-[36px] lg:text-[48px]">
              {client.first_name} {client.last_name}
            </h1>
            <p className="text-ash text-[16px] mt-2">
              {client.email || 'No email'} &middot; {client.phone || 'No phone'}
              {client.group_name && ` &middot; Group: ${client.group_name}`}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/advisor-dashboard/clients')}
              className="px-6 py-3 border border-obsidian text-[14px] font-mono uppercase tracking-wider2 hover:bg-bone-deep transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-obsidian text-bone text-[14px] font-mono uppercase tracking-wider2 hover:bg-obsidian-soft transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[14px] font-mono uppercase tracking-wider2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-obsidian text-obsidian'
                  : 'text-ash hover:text-obsidian'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
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
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Alternate Phone</label>
                  <input
                    type="text"
                    value={formData.alternate_phone || ''}
                    onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth ? formData.date_of_birth.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Gender</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Marital Status</label>
                  <select
                    value={formData.marital_status || ''}
                    onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan_number || ''}
                    onChange={(e) => setFormData({...formData, pan_number: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    value={formData.aadhar_number || ''}
                    onChange={(e) => setFormData({...formData, aadhar_number: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="1234 5678 9012"
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
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={formData.address_line1 || ''}
                    onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address_line2 || ''}
                    onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
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
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country || 'India'}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={formData.annual_income || ''}
                    onChange={(e) => setFormData({...formData, annual_income: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Net Worth (₹)</label>
                  <input
                    type="number"
                    value={formData.net_worth || ''}
                    onChange={(e) => setFormData({...formData, net_worth: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Risk Profile</label>
                  <select
                    value={formData.risk_profile || ''}
                    onChange={(e) => setFormData({...formData, risk_profile: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select</option>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Investment Experience</label>
                  <select
                    value={formData.investment_experience || ''}
                    onChange={(e) => setFormData({...formData, investment_experience: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Financial Goals</label>
                  <textarea
                    value={formData.financial_goals || ''}
                    onChange={(e) => setFormData({...formData, financial_goals: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="Retirement planning, children education, wealth creation..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nominee' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Nominee Name</label>
                  <input
                    type="text"
                    value={formData.nominee_name || ''}
                    onChange={(e) => setFormData({...formData, nominee_name: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Relation</label>
                  <input
                    type="text"
                    value={formData.nominee_relation || ''}
                    onChange={(e) => setFormData({...formData, nominee_relation: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="Spouse, Child, Parent..."
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Nominee Contact</label>
                  <input
                    type="text"
                    value={formData.nominee_contact || ''}
                    onChange={(e) => setFormData({...formData, nominee_contact: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name || ''}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number || ''}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code || ''}
                    onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="SBIN0001234"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Account Type</label>
                  <select
                    value={formData.account_type || ''}
                    onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="nri">NRI</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">KYC Status</label>
                  <select
                    value={formData.kyc_status || 'pending'}
                    onChange={(e) => setFormData({...formData, kyc_status: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">KYC Document URL</label>
                  <input
                    type="text"
                    value={formData.kyc_document_url || ''}
                    onChange={(e) => setFormData({...formData, kyc_document_url: e.target.value})}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-mono uppercase tracking-wider2 text-ash mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:outline-none focus:border-obsidian"
                    placeholder="Any additional notes about this client..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}