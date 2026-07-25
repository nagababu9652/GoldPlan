'use client';

import { useState, useEffect } from 'react';
import { getAdvisorDocuments, type AdvisorDocuments } from '@/lib/api';

export default function AdvisorDocumentsPage() {
  const [data, setData] = useState<AdvisorDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    getAdvisorDocuments(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        <div className="mb-10">
          <div className="label-mono text-ash mb-3">&mdash; Documents</div>
          <h1 className="display text-[36px] lg:text-[48px]">
            Client Documents
          </h1>
          <p className="text-ash text-[16px] leading-[1.6] mt-3">
            Access and manage documents for all your clients
          </p>
        </div>

        {/* Documents List */}
        <div className="border border-obsidian bg-bone">
          <div className="px-6 lg:px-8 py-4 border-b border-line">
            <span className="label-mono text-ash">Client Documents</span>
          </div>
          <div className="divide-y divide-line">
            {data?.documents?.map((doc) => (
              <div key={doc.id} className="px-6 lg:px-8 py-4 flex items-center justify-between hover:bg-bone-deep transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[28px]">📄</span>
                  <div>
                    <div className="font-medium text-[15px]">{doc.name}</div>
                    <div className="text-[12px] text-ash font-mono mt-1">
                      {doc.date} • {doc.category} • {doc.size}
                    </div>
                  </div>
                </div>
                <button className="btn-outline text-[12px] py-2 px-4">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}