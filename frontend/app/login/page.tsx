'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { loginUser, type LoginCredentials } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<'individual' | 'advisor'>('individual');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    const userStr = localStorage.getItem('finplan_user');
    if (token) {
      let role = '';
      if (userStr) {
        try { role = JSON.parse(userStr).role || ''; } catch (e) {}
      }
      if (role === 'advisor') router.push('/advisor-dashboard');
      else router.push('/dashboard');
    }
  }, [router]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ email, password, role: loginRole });

      // Get user info to determine role
      const token = response.access_token;
      // Decode JWT payload to get role
      let userRole = 'user';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload.role || 'user';
      } catch (e) {
        // ignore
      }

      // Validate role matches selected portal
      if (loginRole === 'advisor' && userRole !== 'advisor') {
        setError('This account is not registered as an advisor. Please use Individual Investor login or contact support to upgrade your account.');
        setLoading(false);
        return;
      }

      if (loginRole === 'individual' && userRole === 'advisor') {
        setError('Advisor accounts must login through the Advisor Portal. Please select Advisor Portal to login.');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('finplan_token', response.access_token);
      localStorage.setItem('finplan_refresh_token', response.refresh_token);
      localStorage.setItem('finplan_user', JSON.stringify({
        email: email,
        role: userRole,
        token: response.access_token,
        expires_in: response.expires_in
      }));

      // Redirect based on role
      if (userRole === 'advisor') {
        router.push('/advisor-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bone text-obsidian " data-testid="login-page">
      <Navigation />

      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-20 lg:py-32">
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            {/* Left: Form */}
            <div className="col-span-12 lg:col-span-5">
              <div className="label-mono text-ash mb-4">&mdash; 010 &middot; Sign In</div>
              <h1 className="display text-[44px] lg:text-[64px] mb-6">
                Welcome<br/>back.
              </h1>

              {/* Role Toggle */}
              <div className="flex border border-obsidian mb-8">
                <button
                  type="button"
                  onClick={() => setLoginRole('individual')}
                  className={`flex-1 py-3 px-4 text-[13px] font-mono uppercase tracking-wider2 transition-colors ${
                    loginRole === 'individual'
                      ? 'bg-obsidian text-bone'
                      : 'bg-bone text-obsidian hover:bg-bone-deep'
                  }`}
                >
                  Individual Investor
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('advisor')}
                  className={`flex-1 py-3 px-4 text-[13px] font-mono uppercase tracking-wider2 transition-colors ${
                    loginRole === 'advisor'
                      ? 'bg-obsidian text-bone'
                      : 'bg-bone text-obsidian hover:bg-bone-deep'
                  }`}
                >
                  Advisor Portal
                </button>
              </div>

              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mb-10 max-w-md">
                {loginRole === 'individual'
                  ? 'Sign in to manage your personal finances, goals, and investments.'
                  : 'Sign in to manage your client portfolios and investment advisory services.'}
              </p>

              {error && (
                <div className="mb-6 p-4 border border-red-800 bg-red-50 text-red-900 text-[14px]" data-testid="login-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                <div>
                  <label htmlFor="email" className="label-mono text-ash block" style={{ marginBottom: '12px' }}>Email or Mobile</label>
                  <div style={{ marginTop: '2px', marginBottom: '4px' }}>
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com or +91 98XXX XXXXX"
                      className="w-full border border-obsidian bg-bone text-[15px] focus:border-antique focus:outline-none transition-colors"
                      style={{ padding: '14px 18px' }}
                      data-testid="login-email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="label-mono text-ash block" style={{ marginBottom: '12px' }}>Password</label>
                  <div style={{ marginTop: '2px', marginBottom: '4px' }}>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-obsidian bg-bone text-[15px] focus:border-antique focus:outline-none transition-colors"
                      style={{ padding: '14px 18px' }}
                      data-testid="login-password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[13px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="border border-obsidian w-4 h-4" data-testid="login-remember" />
                    <span className="text-ash">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="u-link text-obsidian hover:text-antique-dark transition-colors">Forgot password?</Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-obsidian w-full justify-center disabled:opacity-50"
                  style={{ padding: '14px 24px' }}
                  data-testid="login-submit"
                >
                  {loading
                    ? 'Signing in...'
                    : loginRole === 'individual'
                      ? 'Sign In'
                      : 'Sign In to Advisor Portal'}
                </button>

                {loginRole === 'individual' && (
                  <>
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
                      <div className="relative flex justify-center"><span className="bg-bone px-4 label-mono text-ash">or</span></div>
                    </div>

                    <button type="button" className="btn-outline w-full justify-center" style={{ padding: '14px 24px' }} data-testid="login-otp">Sign in with OTP</button>
                  </>
                )}
              </form>

              {loginRole === 'individual' && (
                <p className="mt-10 text-[14px] text-ash text-center">
                  Don&rsquo;t have an account?{' '}
                  <Link href="/register" className="u-link text-obsidian hover:text-antique-dark transition-colors font-medium">Create one free</Link>
                </p>
              )}

              {loginRole === 'advisor' && (
                <p className="mt-10 text-[14px] text-ash text-center">
                  Advisor portal is for existing advisors only.{' '}
                  <Link href="/contact" className="u-link text-obsidian hover:text-antique-dark transition-colors font-medium">Contact support</Link>
                </p>
              )}
            </div>

            {/* Right: Info panel */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="border border-obsidian bg-bone-deep" style={{ padding: '32px 40px' }}>
                <div className="label-mono text-ash mb-6">
                  {loginRole === 'individual' ? 'Why FinPlan India' : 'Advisor Portal'}
                </div>
                <div className="space-y-8">

                  {(loginRole === 'individual'
                    ? [
                        { title: 'Secure & Compliant', desc: 'Bank-grade encryption, SEBI-registered advisors.' },
                        { title: 'Goal-Based Planning', desc: 'Map every rupee to a goal — retirement, education, home, or wealth.' },
                        { title: 'Expert Human Guidance', desc: 'A SEBI-registered advisor reviews your portfolio every quarter.' },
                        { title: 'One Dashboard', desc: 'Link mutual funds, PPF, EPF, NPS, FDs, and insurance in one place.' },
                      ]
                    : [
                        { title: 'Client Management', desc: 'Manage multiple client portfolios and investments.' },
                        { title: 'Performance Reports', desc: 'Generate and deliver quarterly and annual reports.' },
                        { title: 'Client Dashboard', desc: 'View and manage all your client information.' },
                        { title: 'Document Hub', desc: 'Access client KYC, agreements, and statements.' },
                      ]
                  ).map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-8 h-8 border border-obsidian flex items-center justify-center shrink-0 text-[11px] font-mono text-ash">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="font-serif text-[22px] leading-tight mb-1.5">{item.title}</div>
                        <p className="text-[14px] text-ash leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-line">
                  <div className="label-mono text-ash mb-3">
                    {loginRole === 'individual' ? 'New here?' : 'Need help?'}
                  </div>
                  <p className="text-[14px] text-ash leading-relaxed mb-5">
                    {loginRole === 'individual'
                      ? 'Join 50,000+ families who plan with FinPlan India.'
                      : 'Contact our support team for assistance with your advisor account.'}
                  </p>
                  {loginRole === 'individual' ? (
                    <Link href="/register" className="btn-obsidian inline-flex" data-testid="login-cta-signup">
                      Create free account
                    </Link>
                  ) : (
                    <Link href="/contact" className="btn-obsidian inline-flex">
                      Contact Support
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
