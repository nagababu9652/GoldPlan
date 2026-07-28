'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Floating goal icons
const goals = [
  { icon: '🏠', label: 'Dream Home' },
  { icon: '🎓', label: 'Education' },
  { icon: '✈️', label: 'Travel' },
  { icon: '💰', label: 'Wealth' },
  { icon: '🏥', label: 'Health' },
  { icon: '🎯', label: 'Retirement' },
  { icon: '🚗', label: 'Car' },
  { icon: '💍', label: 'Wedding' },
];

// Reduce particles for better performance
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const particleCount = isMobile ? 4 : 6;
const displayGoals = goals.slice(0, particleCount);

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  scale: number;
  rotation: number;
}

type Step = 'email' | 'otp' | 'details';

async function handleApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
    if (typeof data.detail === 'object') return JSON.stringify(data.detail);
    return 'Request failed';
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    pan_number: '',
    aadhaar_number: '',
    legal_name: '',
    remarks: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize floating particles
  useEffect(() => {
    const initialParticles = goals.map((goal, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      emoji: goal.icon,
      scale: 1.2 + Math.random() * 1.0,
      rotation: Math.random() * 360,
    }));
    setParticles(initialParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        const dx = (Math.random() - 0.5) * 12;
        const dy = (Math.random() - 0.5) * 12;
        return {
          ...p,
          x: Math.max(0, Math.min(100, p.x + dx)),
          y: Math.max(0, Math.min(100, p.y + dy)),
          rotation: p.rotation + (Math.random() - 0.5) * 20,
        };
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleParticleClick = (index: number) => {
    setParticles(prev => prev.map((p, i) => 
      i === index ? { ...p, scale: p.scale * 1.5 } : p
    ));
    setTimeout(() => {
      setParticles(prev => prev.map((p, i) => 
        i === index ? { ...p, scale: p.scale / 1.5 } : p
      ));
    }, 300);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isResending || countdown > 0) return;
    
    setError('');
    setIsResending(true);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'registration' }),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      
      if (data.otp_code) {
        setSuccessMessage(`✅ OTP sent to ${email}\n\nYour OTP is: ${data.otp_code}\n\n(Valid for 10 minutes)`);
      } else {
        setSuccessMessage('OTP sent successfully! Please check your email.');
      }
      
      setOtpSent(true);
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp, purpose: 'registration' }),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      setStep('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFocus = (fieldName: string) => setFocusedField(fieldName);
  const handleFieldBlur = () => setFocusedField(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, phone, ...rest } = formData;
      const userData = {
        ...rest,
        email,
        mobile_number: phone || undefined,
        role: 'advisor',
      };
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      setSuccessMessage('Account created successfully! Please login with your credentials.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone text-obsidian overflow-hidden" ref={containerRef}>
      {/* Floating Goals Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((particle, index) => (
          <motion.div
            key={particle.id}
            className="absolute cursor-pointer pointer-events-auto"
            style={{ zIndex: Math.floor(particle.scale * 10) }}
            animate={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              rotate: particle.rotation,
              scale: particle.scale,
            }}
            transition={{ 
              left: { duration: 0.8, ease: 'easeInOut' },
              top: { duration: 0.8, ease: 'easeInOut' },
              rotate: { duration: 0.8, ease: 'easeInOut' },
              scale: { duration: 0.3, ease: 'easeOut' },
            }}
            onClick={() => handleParticleClick(index)}
            whileHover={{ scale: particle.scale * 1.4, opacity: 1 }}
            whileTap={{ scale: particle.scale * 0.8 }}
          >
            <div className="relative flex items-center justify-center">
              <span className="text-5xl lg:text-6xl select-none drop-shadow-lg hover:drop-shadow-2xl transition-all duration-200">
                {particle.emoji}
              </span>
              <div className="absolute inset-0 bg-[#C9A227]/20 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <motion.div
                className="w-10 h-10 border-2 border-[#C9A227] bg-obsidian text-bone flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-serif text-[24px] leading-none text-[#C9A227]">F</span>
              </motion.div>
              <div className="leading-none text-left">
                <div className="font-serif text-[20px] tracking-tight">FinPlan<span className="text-[#C9A227]">.</span></div>
              </div>
            </Link>
            <motion.h1
              className="font-serif text-[32px] lg:text-[40px] leading-tight mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Create your account
            </motion.h1>
            <motion.p
              className="text-ash text-[15px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {step === 'email' && 'Enter your email to get started'}
              {step === 'otp' && 'Verify your email address'}
              {step === 'details' && 'Complete your profile'}
            </motion.p>
          </div>

          <motion.div
            style={{ border: '1px solid #C9A227', background: '#0C0B0A', padding: '16px 20px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ border: '1px solid #C9A227', padding: '16px 20px', background: '#0C0B0A' }}>
              {error && (
                <motion.div
                  style={{ background: '#7C2D12', border: '1px solid #C9A227', color: '#F8F6F0', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {error}
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  style={{ background: '#14532D', border: '1px solid #22C55E', color: '#F8F6F0', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {successMessage}
                </motion.div>
              )}

              {step === 'email' && (
                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Email Address</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 20px', background: '#C9A227', color: '#0C0B0A', fontSize: '14px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? '0.5' : '1' }}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="otp" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Enter 6-digit OTP</label>
                    <input id="otp" type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none', letterSpacing: '8px', textAlign: 'center' }} placeholder="000000" />
                    <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '6px' }}>OTP sent to {email}. Valid for 10 minutes.</p>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 20px', background: '#C9A227', color: '#0C0B0A', fontSize: '14px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? '0.5' : '1' }}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  {countdown > 0 ? (
                    <p style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center' }}>Resend OTP in {countdown}s</p>
                  ) : (
                    <button type="button" onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)} disabled={loading || isResending || countdown > 0} style={{ background: 'none', border: 'none', color: '#C9A227', fontSize: '13px', cursor: (loading || isResending || countdown > 0) ? 'not-allowed' : 'pointer', textAlign: 'center', width: '100%', opacity: (loading || isResending || countdown > 0) ? '0.5' : '1' }}>
                      Resend OTP
                    </button>
                  )}
                </form>
              )}

              {step === 'details' && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="first_name" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>First Name</label>
                      <input id="first_name" name="first_name" type="text" required value={formData.first_name} onChange={handleChange} onFocus={() => handleFieldFocus('first_name')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="John" />
                    </div>
                    <div>
                      <label htmlFor="last_name" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Last Name</label>
                      <input id="last_name" name="last_name" type="text" required value={formData.last_name} onChange={handleChange} onFocus={() => handleFieldFocus('last_name')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Phone Number (Optional)</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} onFocus={() => handleFieldFocus('phone')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="+91 9876543210" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="pan_number" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>PAN</label>
                      <input id="pan_number" name="pan_number" type="text" value={formData.pan_number} onChange={handleChange} onFocus={() => handleFieldFocus('pan_number')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="ABCDE1234F" />
                    </div>
                    <div>
                      <label htmlFor="aadhaar_number" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Aadhaar</label>
                      <input id="aadhaar_number" name="aadhaar_number" type="text" value={formData.aadhaar_number} onChange={handleChange} onFocus={() => handleFieldFocus('aadhaar_number')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="1234 5678 9012" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="legal_name" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Legal Name (Optional)</label>
                    <input id="legal_name" name="legal_name" type="text" value={formData.legal_name} onChange={handleChange} onFocus={() => handleFieldFocus('legal_name')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Business or legal name" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="address_line1" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Address Line 1</label>
                      <input id="address_line1" name="address_line1" type="text" value={formData.address_line1} onChange={handleChange} onFocus={() => handleFieldFocus('address_line1')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Flat / House / Building" />
                    </div>
                    <div>
                      <label htmlFor="address_line2" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Address Line 2</label>
                      <input id="address_line2" name="address_line2" type="text" value={formData.address_line2} onChange={handleChange} onFocus={() => handleFieldFocus('address_line2')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Area / Landmark" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="city" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>City</label>
                      <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} onFocus={() => handleFieldFocus('city')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Mumbai" />
                    </div>
                    <div>
                      <label htmlFor="state" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>State</label>
                      <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} onFocus={() => handleFieldFocus('state')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Maharashtra" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pincode" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>PIN Code</label>
                    <input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handleChange} onFocus={() => handleFieldFocus('pincode')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="400001" />
                  </div>
                  <div>
                    <label htmlFor="remarks" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Notes (Optional)</label>
                    <input id="remarks" name="remarks" type="text" value={formData.remarks} onChange={handleChange} onFocus={() => handleFieldFocus('remarks')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="Additional context" />
                  </div>
                  <div>
                    <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Password</label>
                    <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} onFocus={() => handleFieldFocus('password')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="••••••••" />
                    <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '6px' }}>Must be at least 8 characters long</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>Confirm Password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} onFocus={() => handleFieldFocus('confirmPassword')} onBlur={handleFieldBlur} style={{ width: '100%', padding: '10px 14px', border: '1px solid #C9A227', background: '#1C1A19', color: '#F8F6F0', fontSize: '14px', outline: 'none' }} placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 20px', background: '#C9A227', color: '#0C0B0A', fontSize: '14px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? '0.5' : '1' }}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div
            className="mt-6 pt-6 border-t border-line text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-[14px] text-ash">
              Already have an account?{' '}
              <Link href="/login" className="text-obsidian font-medium hover:text-[#C9A227] transition-colors">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}