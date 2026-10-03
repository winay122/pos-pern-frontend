import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, KeyRound, ArrowRight, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [mode, setMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setErrorMessage('');
      setIsSendingOtp(true);
      const res = await authApi.sendOtp(phoneNumber);
      setSuccessMessage(res.message || 'OTP sent successfully! Check terminal/SMS.');
      setCountdown(30);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP. Is the shop registered?');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    if (mode === 'PASSWORD' && !password) {
      setErrorMessage('Please enter your password');
      return;
    }

    if (mode === 'OTP' && (!otp || otp.length !== 6)) {
      setErrorMessage('Please enter the 6-digit OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = mode === 'PASSWORD' ? { phoneNumber, password } : { phoneNumber, otp };
      const response = await authApi.login(payload);

      const { shop, accessToken, refreshToken } = response.data;
      setAuth(shop, accessToken, refreshToken);
      navigate('/billing');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Login failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/70 border-2 border-emerald-500/50 bg-slate-900 mb-4 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="ViRa POS Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            ViRa <span className="text-emerald-400">POS</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Fast, smart, offline-ready retail & kirana billing
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('PASSWORD');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'PASSWORD'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('OTP');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'OTP'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OTP Login / ओ.टी.पी.
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs sm:text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs sm:text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Number Input */}
            <Input
              label="Phone Number / मोबाइल नंबर"
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              leftIcon={<Phone className="w-5 h-5" />}
              autoComplete="tel"
              required
            />

            {/* Mode 1: Password Input */}
            {mode === 'PASSWORD' ? (
              <Input
                label="Password / पासवर्ड"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter shop password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            ) : (
              /* Mode 2: OTP Input & Send OTP Trigger */
              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="6-Digit OTP / ओ.टी.पी."
                      type="text"
                      placeholder="6-digit code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      leftIcon={<KeyRound className="w-5 h-5" />}
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || countdown > 0 || phoneNumber.length !== 10}
                    className="h-[48px] px-3.5 text-xs whitespace-nowrap"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Send OTP'}
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full mt-2"
            >
              {mode === 'PASSWORD' ? 'Login / लॉगिन करें' : 'Verify & Login'}
            </Button>
          </form>

          {/* Quick toggle link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'PASSWORD' ? 'OTP' : 'PASSWORD');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mode === 'PASSWORD' ? 'Get OTP instead (बिना पासवर्ड लॉगिन)' : 'Login with Password instead'}</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New shopkeeper?{' '}
              <Link to="/register" className="text-emerald-400 font-bold hover:underline">
                Register your shop (दुकान जोड़ें)
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Admin Link */}
        <div className="mt-6 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors inline-flex items-center space-x-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
