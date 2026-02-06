'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MdArrowForwardIos as ArrowRight,
  MdCalendarToday as Calendar,
  MdRefresh as Refresh,
  MdReceiptLong as Bill,
  MdPayments as Payment,
  MdAdd as Plus,
} from 'react-icons/md';
import adminService from '@/services/adminService';

type DashboardOrder = {
  _id: string;
  orderNumber?: string;
  status?: string;
  payment?: { status?: string };
  pricing?: { total?: number };
  user?: { firstName?: string; lastName?: string; email?: string };
  createdAt?: string;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [inventoryTotals, setInventoryTotals] = useState({
    totalStockValue: 0,
    totalItems: 0,
  });
  const [toCollect, setToCollect] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [statsRes, recentOrdersRes, inventoryRes, pendingOrdersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentOrders(5),
        adminService.getInventorySummary({ limit: 1 }),
        adminService.getAllOrders({ status: 'pending', limit: 100 }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (recentOrdersRes.success) setRecentOrders(recentOrdersRes.data || []);
      if (inventoryRes.success) {
        setInventoryTotals({
          totalStockValue: inventoryRes.data?.totals?.totalStockValue || 0,
          totalItems: inventoryRes.data?.totals?.totalItems || 0,
        });
      }
      if (pendingOrdersRes.success) {
        const pendingTotal = (pendingOrdersRes.data || []).reduce(
          (sum: number, order: any) => sum + Number(order?.pricing?.total || 0),
          0
        );
        setToCollect(pendingTotal);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const thisWeekSales = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return recentOrders
      .filter((o) => {
        const createdAt = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return createdAt >= weekAgo;
      })
      .reduce((sum, order) => sum + Number(order?.pricing?.total || 0), 0);
  }, [recentOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fefa World</h1>
          <p className="text-sm text-gray-500">Admin dashboard overview</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Refresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DashboardCard
          title={`Rs ${toCollect.toLocaleString()}`}
          subtitle="To Collect"
          subtitleClass="text-emerald-700"
          href="/admin/orders?status=pending"
        />
        <DashboardCard
          title="Rs 0"
          subtitle="To Pay"
          subtitleClass="text-rose-700"
          href="/admin/orders"
        />
        <DashboardCard
          title="Stock Value"
          subtitle={`Rs ${Number(inventoryTotals.totalStockValue || 0).toLocaleString()}`}
          href="/admin/items/stock-summary"
        />
        <DashboardCard
          title="This week's sale"
          subtitle={`Rs ${thisWeekSales.toLocaleString()}`}
          href="/admin/orders"
        />
        <DashboardCard
          title="Total Balance"
          subtitle={`Rs ${Number(stats?.totalRevenue || 0).toLocaleString()}`}
          href="/admin/analytics"
        />
        <DashboardCard title="Reports" subtitle="Sales, Customer, Stock" href="/admin/analytics" />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
            <Calendar className="h-4 w-4" />
            Last 365 days
          </button>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => {
            const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Customer';
            const amount = Number(order.pricing?.total || 0);
            const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '--';
            return (
              <div key={order._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-500">Invoice #{order.orderNumber || order._id?.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-gray-500">{createdDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">Rs {amount.toLocaleString()}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {order.payment?.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                  <button className="font-medium text-indigo-700 hover:underline">Record Manually</button>
                  <button className="font-medium text-emerald-700 hover:underline">Share Payment Link</button>
                </div>
              </div>
            );
          })}
          {recentOrders.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 z-30 flex w-[min(920px,92vw)] -translate-x-1/2 items-center gap-3">
        <button className="flex-1 rounded-full bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-slate-800">
          <Payment className="mr-2 inline h-4 w-4" />
          Received Payment
        </button>
        <button className="rounded-full bg-emerald-200 p-4 text-emerald-900 shadow-lg">
          <Plus className="h-5 w-5" />
        </button>
        <Link
          href="/admin/items/create"
          className="flex-1 rounded-full bg-indigo-600 px-5 py-4 text-center text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
        >
          <Bill className="mr-2 inline h-4 w-4" />
          + Bill / Invoice
        </Link>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  subtitleClass = 'text-gray-600',
  href,
}: {
  title: string;
  subtitle: string;
  subtitleClass?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{title}</p>
          <p className={`mt-1 text-sm font-medium ${subtitleClass}`}>{subtitle}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:text-gray-600" />
      </div>
    </Link>
  );
}

