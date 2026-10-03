import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Store, User, Phone, Lock, MapPin, ArrowRight } from 'lucide-react';
import { ShopCategory } from '../../types';

export const CreateShopPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phoneNumber: '',
    password: 'Shop@1234',
    shopCategory: 'GENERAL_STORE' as ShopCategory,
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categoryOptions = [
    { value: 'GENERAL_STORE', label: 'Kirana / General Store' },
    { value: 'CLOTH', label: 'Cloth & Garments' },
    { value: 'COSMETICS', label: 'Cosmetics & Beauty' },
    { value: 'OTHER', label: 'Other Retail' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setErrorMessage('Please provide a valid 10-digit phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminApi.createShop(formData);
      setSuccessMessage(`Shop "${formData.shopName}" created successfully!`);
      setTimeout(() => navigate('/admin/shops'), 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to create shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Onboard New Shop</h1>
        <p className="text-slate-400 text-sm mt-1">
          Create a shop account on behalf of a shopkeeper without requiring self-registration
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {errorMessage && (
          <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shop Name"
              placeholder="e.g. Mahaveer Kirana"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              leftIcon={<Store className="w-5 h-5" />}
              required
            />

            <Input
              label="Owner Name"
              placeholder="e.g. Surendra Sharma"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              leftIcon={<User className="w-5 h-5" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number (Login ID)"
              type="tel"
              placeholder="10-digit number"
              maxLength={10}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
              leftIcon={<Phone className="w-5 h-5" />}
              required
            />

            <Input
              label="Initial Password"
              placeholder="Default: Shop@1234"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />
          </div>

          <Select
            label="Shop Category"
            options={categoryOptions}
            value={formData.shopCategory}
            onChange={(e) => setFormData({ ...formData, shopCategory: e.target.value as ShopCategory })}
          />

          <Input
            label="Shop Address / Location"
            placeholder="e.g. Main Chowk, Market Road"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            leftIcon={<MapPin className="w-5 h-5" />}
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/shops')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40"
            >
              Create Shop Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
