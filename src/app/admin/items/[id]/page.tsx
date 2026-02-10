'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MdArrowBack as ArrowLeft,
  MdEdit as Edit,
  MdDelete as Trash,
  MdInventory as InventoryIcon,
  MdTimeline as TimelineIcon,
  MdInfoOutline as InfoIcon,
  MdTune as AdjustIcon,
  MdClose as Close,
} from 'react-icons/md';
import adminService from '@/services/adminService';

type InventoryTimelineEntry = {
  _id: string;
  type: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  movementDate: string;
  referenceType?: string;
};

type ProductDetails = {
  _id: string;
  name: string;
  sku: string;
  category?: { name?: string };
  salesPrice: number;
  purchasePrice: number;
  quantity: number;
  stockValue: number;
  mrp?: number | null;
  description?: string;
  shortDescription?: string;
  inventory?: {
    lowStockThreshold?: number;
  };
  updatedAt?: string;
};

function parseKeyHighlights(value?: string): string[] {
  if (!value) return [];
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.replace(/^[\s•*\-–—]+/, '').trim())
    .filter(Boolean);
}

const tabs = ['Item Timeline', 'Details', 'Stock'];

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [timeline, setTimeline] = useState<InventoryTimelineEntry[]>([]);
  const [activeTab, setActiveTab] = useState('Item Timeline');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustMode, setAdjustMode] = useState<'add' | 'set'>('add');
  const [adjustQty, setAdjustQty] = useState('0');
  const [adjustNote, setAdjustNote] = useState('');

  const keyHighlights = useMemo(() => parseKeyHighlights(product?.shortDescription), [product?.shortDescription]);

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventoryItemById(itemId);
      if (!res.success || !res.data) {
        alert(res.error || 'Failed to load item');
        router.push('/admin/items');
        return;
      }
      setProduct(res.data.product);
      setTimeline(res.data.timeline || []);
    } finally {
      setLoading(false);
    }
  };

  const latestStatus = useMemo(() => {
    if (!product) return 'N/A';
    if (product.quantity <= 0) return 'Out of Stock';
    if (product.quantity <= (product.inventory?.lowStockThreshold || 0)) return 'Low Stock';
    return 'In Stock';
  }, [product]);

  const handleAdjust = async () => {
    if (!product) return;
    const qty = Number(adjustQty);
    if (!Number.isFinite(qty)) {
      alert('Invalid quantity');
      return;
    }

    try {
      setAdjusting(true);
      const res = await adminService.adjustInventory({
        productId: product._id,
        mode: adjustMode,
        quantity: qty,
        note: adjustNote || 'Manual stock adjustment',
      });

      if (!res.success) {
        alert(res.error || 'Failed to adjust stock');
        return;
      }
      setAdjustOpen(false);
      setAdjustNote('');
      setAdjustQty('0');
      setAdjustMode('add');
      await loadItem();
    } finally {
      setAdjusting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!product) return;
    if (!confirm('Delete this item permanently? This cannot be undone.')) return;

    const res = await adminService.deleteProduct(product._id);
    if (!res.success) {
      alert(res.error || 'Failed to delete item');
      return;
    }

    router.push('/admin/items');
  };

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/items')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/items/${product._id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4" />
            Edit Item
          </Link>
          <button
            onClick={handleDeleteItem}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold uppercase tracking-wide text-gray-900">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Category: <span className="font-medium">{product.category?.name || 'Uncategorized'}</span>
            </p>
            <p className="text-sm text-gray-500">Item code: {product.sku}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              latestStatus === 'Out of Stock'
                ? 'bg-red-100 text-red-700'
                : latestStatus === 'Low Stock'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {latestStatus}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Sales Price" value={`Rs ${Number(product.salesPrice || 0).toLocaleString()}`} />
          <Metric label="Purchase Price" value={`Rs ${Number(product.purchasePrice || 0).toLocaleString()}`} />
          <Metric label="Stock Quantity" value={`${product.quantity} PCS`} />
          <Metric label="Stock Value" value={`Rs ${Number(product.stockValue || 0).toLocaleString()}`} />
          <Metric label="MRP" value={product.mrp ? `Rs ${Number(product.mrp).toLocaleString()}` : '--'} />
          <Metric
            label="Low Stock Alert"
            value={`${product.inventory?.lowStockThreshold ?? 0}`}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Item Timeline' && (
        <div className="space-y-3">
          {timeline.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
              <TimelineIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No stock movements recorded yet.</p>
            </div>
          )}
          {timeline.map((entry) => (
            <div key={entry._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{new Date(entry.movementDate).toLocaleDateString()}</p>
                  <p className="text-base font-semibold capitalize text-gray-900">{entry.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">{entry.note || 'No note'}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-base font-semibold ${
                      entry.quantityChange > 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {entry.quantityChange > 0 ? '+' : ''}
                    {entry.quantityChange} PCS
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.previousQuantity} → {entry.newQuantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Details' && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="space-y-3 text-sm">
            <DetailRow label="Item Name" value={product.name} />
            <DetailRow label="Item Code" value={product.sku} />
            <DetailRow label="Category" value={product.category?.name || 'Uncategorized'} />
            <DetailRow label="Description" value={product.description || '--'} />
            {keyHighlights.length > 0 && (
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0">
                <span className="text-gray-500">Key Highlights</span>
                <ul className="max-w-[65%] list-disc space-y-1 pl-5 text-right font-medium text-gray-900">
                  {keyHighlights.map((highlight, idx) => (
                    <li key={idx} className="text-left">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DetailRow label="Last Updated" value={product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '--'} />
          </div>
        </div>
      )}

      {activeTab === 'Stock' && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="space-y-3 text-sm">
            <DetailRow label="Current Quantity" value={`${product.quantity} PCS`} />
            <DetailRow label="Low Stock Threshold" value={`${product.inventory?.lowStockThreshold ?? 0}`} />
            <DetailRow label="Stock Value" value={`Rs ${Number(product.stockValue || 0).toLocaleString()}`} />
            <DetailRow label="Last Stock Status" value={latestStatus} />
          </div>
        </div>
      )}

      <button
        onClick={() => setAdjustOpen(true)}
        className="fixed bottom-5 left-1/2 z-30 w-[min(560px,90vw)] -translate-x-1/2 rounded-full bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
      >
        <AdjustIcon className="mr-2 inline h-4 w-4" />
        Adjust Stock
      </button>

      {adjustOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="w-full rounded-t-2xl bg-white p-4 sm:w-[460px] sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
              <button onClick={() => setAdjustOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <Close className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Mode</span>
                <select
                  value={adjustMode}
                  onChange={(e) => setAdjustMode(e.target.value as 'add' | 'set')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="add">Add / Subtract Quantity</option>
                  <option value="set">Set Exact Quantity</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity {adjustMode === 'add' ? '(use negative for decrease)' : ''}
                </span>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Note</span>
                <textarea
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Reason for adjustment"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setAdjustOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjusting}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {adjusting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}
