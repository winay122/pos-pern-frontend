import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminAuth } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      setIsSubmitting(true);
      const response = await adminApi.login({ email, password });
      const { admin, accessToken } = response.data;
      setAdminAuth(admin, accessToken);
      navigate('/admin');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Admin authentication failed. Invalid email or password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/70 border-2 border-indigo-500/50 bg-slate-900 mb-4">
            <img src="/logo.png" alt="ViRa POS Admin" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-slate-100">
            ViRa <span className="text-indigo-400">Admin</span>
          </h1>
          <p className="text-indigo-400 text-sm mt-1.5 font-medium">
            Platform administration & shop management
          </p>
        </div>

        <div className="bg-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@posvillage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Admin Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40"
            >
              Sign In to Admin
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shopkeeper Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
