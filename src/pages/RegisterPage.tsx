import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Phone, Lock, MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ShopCategory } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    phoneNumber: '',
    password: '',
    shopCategory: 'GENERAL_STORE' as ShopCategory,
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categoryOptions = [
    { value: 'GENERAL_STORE', label: 'Kirana / General Store (किराना दुकान)' },
    { value: 'CLOTH', label: 'Cloth & Garments (कपड़ा दुकान)' },
    { value: 'COSMETICS', label: 'Cosmetics & Beauty (श्रृंगार एवं सौंदर्य)' },
    { value: 'OTHER', label: 'Other Retail Store (अन्य खुदरा)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.register(formData);
      const { shop, accessToken, refreshToken } = response.data;
      setAuth(shop, accessToken, refreshToken);
      navigate('/billing');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-emerald-950/60 border border-emerald-500/40 bg-slate-900 mb-3">
            <img src="/logo.png" alt="ViRa POS" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Register on ViRa POS
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            अपनी दुकान का खाता बनाएं और तेज बिलिंग शुरू करें
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop Name / दुकान का नाम"
                placeholder="e.g. Laxmi Retail Store"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                leftIcon={<Store className="w-5 h-5" />}
                required
              />

              <Input
                label="Owner Name / दुकानदार का नाम"
                placeholder="e.g. Ramesh Kumar"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number / मोबाइल नंबर"
                type="tel"
                placeholder="10-digit number"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                leftIcon={<Phone className="w-5 h-5" />}
                required
              />

              <Input
                label="Password / पासवर्ड"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            <Select
              label="Shop Category / दुकान का प्रकार"
              options={categoryOptions}
              value={formData.shopCategory}
              onChange={(e) => setFormData({ ...formData, shopCategory: e.target.value as ShopCategory })}
            />

            <Input
              label="Shop Address / Location (दुकान का पता)"
              placeholder="e.g. Main Market, City Center"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              leftIcon={<MapPin className="w-5 h-5" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full mt-2"
            >
              Create Shop Account / दुकान बनाएं
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-emerald-400 font-bold hover:underline">
                Login here (लॉगिन करें)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
