'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack as ArrowLeft,
  MdPictureAsPdf as PdfIcon,
  MdGridOn as ExcelIcon,
  MdExpandMore as ChevronDown,
  MdClose as Close,
  MdCheckCircle as CircleChecked,
  MdRadioButtonUnchecked as CircleUnchecked,
} from 'react-icons/md';
import adminService from '@/services/adminService';

type SummaryRow = {
  _id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  value: number;
  category?: { _id?: string; name?: string };
};

export default function StockSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalStockValue: 0,
    lowStockItems: 0,
  });
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadSummary();
  }, [selectedCategory]);

  const loadCategories = async () => {
    const res = await adminService.getAllCategories({ limit: 200, sortBy: 'name', sortOrder: 'asc' });
    if (res.success) setCategories(res.data || []);
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventorySummary({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 300,
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load stock summary');
      }
      setRows(res.data.rows || []);
      setTotals(res.data.totals || totals);
    } catch (error: any) {
      alert(error.message || 'Failed to load stock summary');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All Categories';
    return categories.find((c) => c._id === selectedCategory)?.name || 'Category';
  }, [selectedCategory, categories]);

  const exportCsv = async () => {
    try {
      setExporting(true);
      const res = await adminService.downloadInventoryExport({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      });
      if (!res.success || !res.blob) {
        throw new Error(res.error || 'Export failed');
      }

      const url = URL.createObjectURL(res.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `stock-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/items')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Stock Summary</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
          >
            <PdfIcon className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            <ExcelIcon className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowCategoryModal(true)}
        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
      >
        {selectedCategoryLabel}
        <ChevronDown className="h-4 w-4" />
      </button>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Total Stock Value</p>
            <p className="text-3xl font-bold text-gray-900">Rs {Number(totals.totalStockValue || 0).toLocaleString()}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Items: {totals.totalItems}</p>
            <p>Total Qty: {totals.totalQuantity}</p>
            <p>Low Stock: {totals.lowStockItems}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">Loading summary...</div>
        )}
        {!loading &&
          rows.map((row) => (
            <div key={row._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">{row.itemCode}</p>
                  <p className="text-lg font-semibold uppercase tracking-wide text-gray-900">{row.itemName}</p>
                  <p className="text-xs text-gray-500">{row.category?.name || 'Uncategorized'}</p>
                </div>
                <div className="sm:text-center">
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="text-xl font-bold text-gray-900">
                    {row.quantity} {row.unit}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-500">Value</p>
                  <p className="text-xl font-bold text-gray-900">Rs {Number(row.value || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">No stock items found for this category.</p>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="w-full rounded-t-2xl bg-white p-4 sm:w-[460px] sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Item Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <Close className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-1 overflow-y-auto">
              <CategoryRow
                label="All Categories"
                selected={selectedCategory === 'all'}
                onClick={() => {
                  setSelectedCategory('all');
                  setShowCategoryModal(false);
                }}
              />
              {categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  label={category.name}
                  selected={selectedCategory === category._id}
                  onClick={() => {
                    setSelectedCategory(category._id);
                    setShowCategoryModal(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {selected ? <CircleChecked className="h-5 w-5 text-indigo-600" /> : <CircleUnchecked className="h-5 w-5 text-gray-300" />}
    </button>
  );
}

