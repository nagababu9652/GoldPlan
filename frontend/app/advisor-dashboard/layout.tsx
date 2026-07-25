'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const sidebarItems = [
  { label: 'Dashboard', icon: '📊', path: '/advisor-dashboard' },
  { label: 'Clients', icon: '👥', path: '/advisor-dashboard/clients' },
  { label: 'Groups', icon: '👨‍👩‍👧‍👦', path: '/advisor-dashboard/groups' },
  { label: 'Portfolio', icon: '📈', path: '/advisor-dashboard/portfolio' },
  { label: 'Reports', icon: '📋', path: '/advisor-dashboard/reports' },
  { label: 'Documents', icon: '📄', path: '/advisor-dashboard/documents' },
  { label: 'Messages', icon: '💬', path: '/advisor-dashboard/messages' },
  { label: 'Profile', icon: '👤', path: '/advisor-dashboard/profile' },
];

export default function AdvisorDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Advisor');

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('finplan_token');
    const userStr = localStorage.getItem('finplan_user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Get user info and validate role
    let userRole = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = user.role || '';
        setUserName(user.email?.split('@')[0] || 'Advisor');
      } catch (e) {}
    }

    // Redirect if not advisor
    if (userRole && userRole !== 'advisor') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('finplan_token');
    localStorage.removeItem('finplan_refresh_token');
    localStorage.removeItem('finplan_user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-bone text-obsidian flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-obsidian text-bone flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Brand */}
        <div className="px-6 py-8 border-b border-obsidian-soft">
          <Link href="/" className="font-serif text-[24px] text-antique-light">
            FinPlan
          </Link>
          <div className="text-[11px] text-ash-light font-mono uppercase tracking-wider2 mt-1">Advisor Portal</div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-[14px] transition-colors ${
                  isActive
                    ? 'bg-antique text-obsidian font-medium'
                    : 'text-ash-light hover:text-bone hover:bg-obsidian-soft'
                }`}
              >
                <span className="text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-6 py-6 border-t border-obsidian-soft">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-ash-light hover:text-bone transition-colors w-full text-[14px]"
          >
            <span className="text-[18px]">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-bone border-b border-line">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-obsidian p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-4">
              <span className="text-ash">🔍</span>
              <input
                type="text"
                placeholder="Search reports, documents..."
                className="bg-transparent border-none outline-none text-[14px] text-obsidian placeholder-ash-light w-full"
              />
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              <button className="relative text-ash hover:text-obsidian transition-colors">
                <span className="text-[20px]">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-bone text-[10px] font-mono flex items-center justify-center rounded-full">2</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-antique rounded-full flex items-center justify-center text-[14px] font-medium text-obsidian">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-[14px] font-medium">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}