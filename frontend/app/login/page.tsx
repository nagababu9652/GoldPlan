'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email === 'admin' && password === 'admin') {
      localStorage.setItem('finplan_user', JSON.stringify({
        email: 'admin@finplan.in',
        name: 'Admin User',
        token: 'demo-jwt-token-12345'
      }));
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use demo: admin / admin');
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
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mb-10 max-w-md">
                Sign in to access your goals, portfolio, and advisor sessions.
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
                  <a href="#" className="u-link text-obsidian hover:text-antique-dark transition-colors">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-obsidian w-full justify-center disabled:opacity-50"
                  style={{ padding: '14px 24px' }}
                  data-testid="login-submit"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
                  <div className="relative flex justify-center"><span className="bg-bone px-4 label-mono text-ash">or</span></div>
                </div>

                <button type="button" className="btn-outline w-full justify-center" style={{ padding: '14px 24px' }} data-testid="login-otp">Sign in with OTP</button>
              </form>

              <p className="mt-10 text-[14px] text-ash text-center">
                Don&rsquo;t have an account?{' '}
                <a href="#" className="u-link text-obsidian hover:text-antique-dark transition-colors font-medium">Create one free</a>
              </p>
            </div>

            {/* Right: Info panel */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="border border-obsidian bg-bone-deep" style={{ padding: '32px 40px' }}>
                <div className="label-mono text-ash mb-6">Why FinPlan India</div>
                <div className="space-y-8">

                  {[
                    { title: 'Secure & Compliant', desc: 'Bank-grade encryption, SEBI-registered advisors.' },
                    { title: 'Goal-Based Planning', desc: 'Map every rupee to a goal — retirement, education, home, or wealth.' },
                    { title: 'Expert Human Guidance', desc: 'A SEBI-registered advisor reviews your portfolio every quarter.' },
                    { title: 'One Dashboard', desc: 'Link mutual funds, PPF, EPF, NPS, FDs, and insurance in one place.' },
                  ].map((item, i) => (
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
                  <div className="label-mono text-ash mb-3">New here?</div>
                  <p className="text-[14px] text-ash leading-relaxed mb-5">Join 50,000+ families who plan with FinPlan India.</p>
                  <a href="#" className="btn-obsidian inline-flex" data-testid="login-cta-signup">
                    Create free account
                  </a>
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