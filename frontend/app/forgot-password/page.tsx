'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { forgotPassword, resetPassword } from '@/lib/api';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for OTP resend
  const startCountdown = () => {
    setCountdown(60);
  };

  // Countdown timer effect
  if (countdown > 0) {
    setTimeout(() => setCountdown(countdown - 1), 1000);
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || isResending || countdown > 0) {
      return;
    }
    
    setError('');
    setIsResending(true);
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      
      // Show OTP in development mode
      if (response.otp_code) {
        const otpMsg = `✅ Password reset OTP sent to ${email}\n\nYour OTP is: ${response.otp_code}\n\n(Valid for 10 minutes)`;
        setSuccessMessage(otpMsg);
      } else {
        setSuccessMessage('If an account exists with this email, a password reset OTP has been sent');
      }
      
      setStep('otp');
      startCountdown();
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
      // Just verify OTP is valid by attempting reset
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(email, otp, newPassword);
      setSuccessMessage(response.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone text-obsidian flex items-center justify-center px-6 py-12">
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
            Reset Password
          </motion.h1>
          <motion.p
            className="text-ash text-[15px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'reset' && 'Create a new password'}
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
                style={{ background: '#14532D', border: '1px solid #22C55E', color: '#F8F6F0', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', whiteSpace: 'pre-line' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {successMessage}
              </motion.div>
            )}

            {step === 'email' && (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #C9A227',
                      background: '#1C1A19',
                      color: '#F8F6F0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: '#C9A227',
                    color: '#0C0B0A',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? '0.5' : '1',
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="otp" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>
                    Enter 6-digit OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #C9A227',
                      background: '#1C1A19',
                      color: '#F8F6F0',
                      fontSize: '14px',
                      outline: 'none',
                      letterSpacing: '8px',
                      textAlign: 'center',
                    }}
                    placeholder="000000"
                  />
                  <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '6px' }}>
                    OTP sent to {email}. Valid for 10 minutes.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: '#C9A227',
                    color: '#0C0B0A',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? '0.5' : '1',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                {countdown > 0 ? (
                  <p style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center' }}>
                    Resend OTP in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || isResending || countdown > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9A227',
                      fontSize: '13px',
                      cursor: (loading || isResending || countdown > 0) ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      width: '100%',
                      opacity: (loading || isResending || countdown > 0) ? '0.5' : '1',
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="newPassword" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #C9A227',
                      background: '#1C1A19',
                      color: '#F8F6F0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="••••••••"
                  />
                  <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '6px' }}>Must be at least 8 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#C9A227' }}>
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #C9A227',
                      background: '#1C1A19',
                      color: '#F8F6F0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: '#C9A227',
                    color: '#0C0B0A',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? '0.5' : '1',
                  }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
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
            Remember your password?{' '}
            <Link href="/login" className="text-obsidian font-medium hover:text-[#C9A227] transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}