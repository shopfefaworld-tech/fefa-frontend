'use client';

import { useEffect, useState } from 'react';
import {
  MdLocalOffer as LocalOffer,
  MdAdd as Add,
  MdEdit as Edit,
  MdDelete as DeleteIcon,
  MdRefresh as Refresh,
  MdCheckCircle as CheckCircle,
  MdCancel as Cancel,
} from 'react-icons/md';
import adminService from '../../../services/adminService';

type Coupon = {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt?: string;
};

const emptyForm: Omit<Coupon, '_id' | 'usedCount' | 'createdAt'> = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscount: undefined,
  usageLimit: 0,
  isActive: true,
  expiresAt: undefined,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAllCoupons();
      if (!res.success) {
        setError(res.error || 'Failed to load coupons');
        return;
      }
      setCoupons(res.data || []);
    } catch (e: any) {
      console.error('Load coupons error:', e);
      setError(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit ?? 0,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : undefined,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      alert('Coupon code is required');
      return;
    }
    if (!form.discountValue || form.discountValue <= 0) {
      alert('Discount value must be greater than 0');
      return;
    }

    const payload: any = {
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      isActive: form.isActive,
    };

    if (form.maxDiscount !== undefined && form.maxDiscount !== null && form.maxDiscount !== 0) {
      payload.maxDiscount = Number(form.maxDiscount);
    }

    if (form.expiresAt) {
      payload.expiresAt = new Date(form.expiresAt);
    }

    try {
      setSaving(true);
      setError(null);

      let result;
      if (editingId) {
        result = await adminService.updateCoupon(editingId, payload);
      } else {
        result = await adminService.createCoupon(payload);
      }

      if (!result.success) {
        if (result.requiresAuth) {
          alert(result.error || 'Authentication required. Please log in again.');
        } else {
          alert(result.error || 'Failed to save coupon');
        }
        return;
      }

      await loadCoupons();
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      console.error('Save coupon error:', e);
      alert(e.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      setDeletingId(id);
      const res = await adminService.deleteCoupon(id);
      if (!res.success) {
        alert(res.error || 'Failed to delete coupon');
        return;
      }
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (e: any) {
      console.error('Delete coupon error:', e);
      alert(e.message || 'Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return 'No expiry';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ''}`;
    }
    return `₹${coupon.discountValue}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Coupons</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
              Manage discount codes and promotions
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading coupons...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Coupons</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
            Create and manage coupon codes for your store
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadCoupons}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Add className="h-4 w-4 mr-2" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.code}
                  onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. FEFA10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount Type
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.discountType}
                  onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value as any }))}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount Value
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.discountValue}
                  onChange={e => setForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Discount (₹, optional)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.maxDiscount ?? ''}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      maxDiscount: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.minOrderAmount}
                  onChange={e => setForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usage Limit (0 = unlimited)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.usageLimit}
                  onChange={e => setForm(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={form.expiresAt ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value || undefined }))}
                />
              </div>

              <div className="flex items-center mt-2">
                <input
                  id="coupon-active"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="coupon-active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {saving ? (
                  <>
                    <Refresh className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Coupon
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 flex items-center">
            <LocalOffer className="h-5 w-5 mr-2 text-purple-600" />
            Existing Coupons ({coupons.length})
          </h3>
        </div>
        {coupons.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No coupons created yet. Click "New Coupon" to add one.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {coupons.map(coupon => (
              <li key={coupon._id}>
                <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 tracking-wider">
                        {coupon.code}
                      </span>
                      {coupon.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 space-x-2">
                      <span>{formatDiscount(coupon)}</span>
                      <span>•</span>
                      <span>
                        Min order: ₹{(coupon.minOrderAmount ?? 0).toFixed(0)}
                      </span>
                      <span>•</span>
                      <span>
                        Usage: {coupon.usageLimit === 0 ? 'Unlimited' : `${coupon.usedCount}/${coupon.usageLimit}`}
                      </span>
                      <span>•</span>
                      <span>Expires: {formatDate(coupon.expiresAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      disabled={deletingId === coupon._id}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === coupon._id ? (
                        <>
                          <Refresh className="h-4 w-4 mr-1 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <DeleteIcon className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

