import React from 'react';

type ReceiptAddress = {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type ReceiptItem = {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  variantSummary?: string;
};

type ReceiptTracking = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

export type PrintableReceiptData = {
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress: ReceiptAddress;
  billingAddress?: ReceiptAddress;
  tracking?: ReceiptTracking;
  items: ReceiptItem[];
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency?: string;
  };
};

interface PrintableReceiptProps {
  data: PrintableReceiptData;
  title?: string;
  subtitle?: string;
}

const formatCurrency = (amount: number, currency = 'INR') => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `INR ${safeAmount.toFixed(2)}`;
  }
};

const formatDate = (value: string | Date) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const titleCase = (value?: string) => {
  if (!value) return '-';
  return value
    .split('_')
    .join(' ')
    .split(' ')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
    .join(' ');
};

const AddressBlock = ({ label, address }: { label: string; address?: ReceiptAddress }) => {
  if (!address) return null;

  return (
    <div className="rounded-md border border-neutral-200 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{label}</p>
      <div className="mt-2 space-y-0.5 text-sm text-neutral-900">
        {address.name && <p className="font-medium">{address.name}</p>}
        {address.addressLine1 && <p>{address.addressLine1}</p>}
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        {(address.city || address.state || address.postalCode) && (
          <p>
            {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
          </p>
        )}
        {address.country && <p>{address.country}</p>}
        {address.phone && <p>Phone: {address.phone}</p>}
        {address.email && <p>Email: {address.email}</p>}
      </div>
    </div>
  );
};

export default function PrintableReceipt({
  data,
  title = 'Order Receipt',
  subtitle = 'Customer copy for delivery box',
}: PrintableReceiptProps) {
  const currency = data.pricing.currency || 'INR';

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
      <section className="mx-auto w-full max-w-5xl border border-neutral-300 bg-white p-6 text-neutral-900 print:max-w-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-300 pb-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight">FEFA Jewelry</p>
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold">{title}</p>
            <p className="mt-1 text-sm text-neutral-600">Order #{data.orderNumber}</p>
            <p className="text-sm text-neutral-600">{formatDate(data.createdAt)}</p>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1 rounded-md border border-neutral-200 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Order Snapshot</p>
            <p>
              <span className="font-medium">Status:</span> {titleCase(data.status)}
            </p>
            {data.paymentStatus && (
              <p>
                <span className="font-medium">Payment:</span> {titleCase(data.paymentStatus)}
              </p>
            )}
            {data.paymentMethod && (
              <p>
                <span className="font-medium">Method:</span> {titleCase(data.paymentMethod)}
              </p>
            )}
            {data.tracking?.trackingNumber && (
              <p>
                <span className="font-medium">Tracking:</span> {data.tracking.trackingNumber}
              </p>
            )}
          </div>

          <div className="space-y-1 rounded-md border border-neutral-200 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Customer</p>
            {data.customer?.name && <p className="font-medium">{data.customer.name}</p>}
            {data.customer?.phone && <p>{data.customer.phone}</p>}
            {data.customer?.email && <p>{data.customer.email}</p>}
            {data.tracking?.carrier && (
              <p>
                <span className="font-medium">Carrier:</span> {data.tracking.carrier}
              </p>
            )}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <AddressBlock label="Shipping Address" address={data.shippingAddress} />
          <AddressBlock label="Billing Address" address={data.billingAddress || data.shippingAddress} />
        </section>

        <section className="mt-5 overflow-hidden rounded-md border border-neutral-300">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-neutral-700">Item</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-700">SKU</th>
                <th className="px-3 py-2 text-right font-semibold text-neutral-700">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-neutral-700">Price</th>
                <th className="px-3 py-2 text-right font-semibold text-neutral-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={`${item.sku || item.name}-${index}`} className="border-t border-neutral-200">
                  <td className="px-3 py-2 align-top">
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    {item.variantSummary && <p className="text-xs text-neutral-600">{item.variantSummary}</p>}
                  </td>
                  <td className="px-3 py-2 align-top text-neutral-700">{item.sku || '-'}</td>
                  <td className="px-3 py-2 text-right align-top">{item.quantity}</td>
                  <td className="px-3 py-2 text-right align-top">
                    {formatCurrency(item.unitPrice, currency)}
                  </td>
                  <td className="px-3 py-2 text-right align-top font-medium">
                    {formatCurrency(item.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-5 flex justify-end">
          <div className="w-full max-w-xs space-y-1 rounded-md border border-neutral-200 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Subtotal</span>
              <span>{formatCurrency(data.pricing.subtotal, currency)}</span>
            </div>
            {data.pricing.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Discount</span>
                <span>-{formatCurrency(data.pricing.discount, currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Shipping</span>
              <span>{formatCurrency(data.pricing.shipping, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Tax</span>
              <span>{formatCurrency(data.pricing.tax, currency)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-neutral-300 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(data.pricing.total, currency)}</span>
            </div>
          </div>
        </section>

        <footer className="mt-6 border-t border-neutral-200 pt-3 text-xs text-neutral-600">
          <p>Generated on {formatDate(new Date())}. Keep this receipt with the shipment.</p>
        </footer>
      </section>
    </>
  );
}
