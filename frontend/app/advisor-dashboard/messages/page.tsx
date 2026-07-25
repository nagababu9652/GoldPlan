'use client';

import { useState, useEffect } from 'react';
import { getAdvisorMessages, type AdvisorMessages } from '@/lib/api';

export default function AdvisorMessagesPage() {
  const [data, setData] = useState<AdvisorMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    getAdvisorMessages(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading messages...</div>
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
          <div className="label-mono text-ash mb-3">&mdash; Messages</div>
          <h1 className="display text-[36px] lg:text-[48px]">
            Client Communications
          </h1>
          <p className="text-ash text-[16px] leading-[1.6] mt-3">
            Manage conversations and updates with your clients
          </p>
        </div>

        {/* Messages List */}
        <div className="border border-obsidian bg-bone">
          <div className="px-6 lg:px-8 py-4 border-b border-line">
            <span className="label-mono text-ash">Client Messages</span>
          </div>
          <div className="divide-y divide-line">
            {data?.messages?.map((msg) => (
              <div key={msg.id} className="px-6 lg:px-8 py-4 flex items-start gap-4 hover:bg-bone-deep transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-[15px]">{msg.from}</div>
                    {msg.unread && (
                      <span className="bg-antique text-obsidian text-[10px] font-mono px-2 py-0.5">New</span>
                    )}
                  </div>
                  <div className="font-medium text-[14px] mb-1">{msg.subject}</div>
                  <div className="text-[12px] text-ash font-mono">{msg.date}</div>
                </div>
                <button className="btn-outline text-[12px] py-2 px-4">
                  Reply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}