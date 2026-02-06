'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MdAdd as Plus,
  MdFilterList as Filter,
  MdSearch as Search,
  MdArrowForwardIos as ChevronRight,
  MdTune as Sliders,
  MdOutlineInventory2 as InventoryIcon,
  MdClose as Close,
  MdCheckCircle as CircleChecked,
  MdRadioButtonUnchecked as CircleUnchecked,
  MdSummarize as SummaryIcon,
} from 'react-icons/md';
import adminService from '@/services/adminService';

type InventoryItem = {
  _id: string;
  name: string;
  sku: string;
  category?: { _id?: string; name?: string };
  quantity: number;
  purchasePrice: number;
  salesPrice: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  image?: string;
};

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl) {
      setSearch(searchFromUrl);
      setDebouncedSearch(searchFromUrl);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, selectedCategory, lowStockOnly, sortBy, sortOrder]);

  const loadCategories = async () => {
    const res = await adminService.getAllCategories({ limit: 200, sortBy: 'name', sortOrder: 'asc' });
    if (res.success) {
      setCategories(res.data || []);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventoryItems({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        lowStock: lowStockOnly,
        sortBy,
        sortOrder,
      });
      if (!res.success) {
        throw new Error(res.error || 'Failed to load items');
      }
      setItems(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.totalItems || 0);
    } catch (error: any) {
      alert(error.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All Categories';
    return categories.find((c) => c._id === selectedCategory)?.name || 'Category';
  }, [selectedCategory, categories]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulkAdjust = async () => {
    if (selectedIds.size === 0) return;
    const value = prompt('Enter stock adjustment quantity (e.g. 5 or -3):', '1');
    if (!value) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      alert('Invalid quantity');
      return;
    }

    try {
      setBulkLoading(true);
      const adjustments = [...selectedIds].map((id) => ({
        productId: id,
        mode: 'add',
        quantity: parsed,
      }));
      const res = await adminService.bulkAdjustInventory(adjustments, 'Bulk adjustment from items list');
      if (!res.success) {
        alert(res.error || 'Bulk action failed');
        return;
      }
      await loadItems();
      setSelectedIds(new Set());
      setBulkMode(false);
      alert('Bulk stock update completed');
    } finally {
      setBulkLoading(false);
    }
  };

  const isSelected = (id: string) => selectedIds.has(id);

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
        <Link
          href="/admin/items/stock-summary"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SummaryIcon className="h-4 w-4" />
          Stock Summary
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item name or code"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              lowStockOnly ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock
          </button>

          <button
            onClick={() => setShowCategorySheet(true)}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {selectedCategoryLabel}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <Filter className="h-4 w-4" />
              Filter By
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                {[
                  { label: 'Recently Updated', by: 'updatedAt', order: 'desc' },
                  { label: 'Name A-Z', by: 'name', order: 'asc' },
                  { label: 'Stock Low to High', by: 'inventory.quantity', order: 'asc' },
                  { label: 'Stock High to Low', by: 'inventory.quantity', order: 'desc' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSortBy(item.by);
                      setSortOrder(item.order as 'asc' | 'desc');
                      setShowSortMenu(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600">
          {loading ? 'Loading items...' : `${totalItems} items`}
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item._id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                {bulkMode ? (
                  <button onClick={() => toggleSelect(item._id)} className="pt-1">
                    {isSelected(item._id) ? (
                      <CircleChecked className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <CircleUnchecked className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                ) : null}

                <button
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  onClick={() => router.push(`/admin/items/${item._id}`)}
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500">
                        {item.name?.[0]?.toUpperCase() || 'I'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold uppercase tracking-wide text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.category?.name || 'Uncategorized'} · {item.sku}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Sales Price</p>
                        <p className="font-semibold text-gray-900">Rs {Number(item.salesPrice || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Purchase Price</p>
                        <p className="font-semibold text-gray-900">Rs {Number(item.purchasePrice || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-1 flex flex-col items-end gap-2">
                    <p
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.stockStatus === 'out_of_stock'
                          ? 'bg-red-100 text-red-700'
                          : item.stockStatus === 'low_stock'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.quantity} PCS
                    </p>
                    <Sliders className="h-4 w-4 text-indigo-600" />
                  </div>
                </button>

                {!bulkMode ? <ChevronRight className="mt-1 h-4 w-4 text-gray-400" /> : null}
              </div>
            </div>
          ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="px-4 py-14 text-center">
            <InventoryIcon className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No items found for the selected filters.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-30 flex w-[min(900px,92vw)] -translate-x-1/2 items-center gap-3">
        <button
          onClick={() => router.push('/admin/items/create')}
          className="flex-1 rounded-full bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Create New Item
        </button>
        <button
          onClick={() => {
            if (bulkMode) {
              runBulkAdjust();
              return;
            }
            setBulkMode(true);
            setSelectedIds(new Set());
          }}
          disabled={bulkLoading}
          className="flex-1 rounded-full bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
        >
          {bulkMode ? `Apply Bulk (${selectedIds.size})` : 'Bulk Action'}
        </button>
      </div>

      {bulkMode && (
        <button
          onClick={() => {
            setBulkMode(false);
            setSelectedIds(new Set());
          }}
          className="fixed bottom-24 right-4 z-30 rounded-full border border-gray-300 bg-white p-2 text-gray-600 shadow-md"
        >
          <Close className="h-5 w-5" />
        </button>
      )}

      {showCategorySheet && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="w-full rounded-t-2xl bg-white p-4 sm:w-[480px] sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Item Category</h3>
              <button onClick={() => setShowCategorySheet(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <Close className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-1 overflow-y-auto">
              <CategoryRow
                label="All Categories"
                selected={selectedCategory === 'all'}
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                  setShowCategorySheet(false);
                }}
              />
              {categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  label={category.name}
                  selected={selectedCategory === category._id}
                  onClick={() => {
                    setSelectedCategory(category._id);
                    setPage(1);
                    setShowCategorySheet(false);
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
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-gray-50"
    >
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {selected ? (
        <CircleChecked className="h-5 w-5 text-indigo-600" />
      ) : (
        <CircleUnchecked className="h-5 w-5 text-gray-300" />
      )}
    </button>
  );
}
