'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack as ArrowLeft,
  MdPerson as User,
  MdLocationOn as MapPin,
  MdPhone as Phone,
  MdEmail as Mail,
  MdInventory as Package,
  MdAttachMoney as DollarSign,
  MdCalendarToday as Calendar
} from 'react-icons/md';
import PrintableReceipt, { type PrintableReceiptData } from '@/components/orders/PrintableReceipt';

interface OrderItem {
  product: any;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  variant?: any;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: any;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    gateway?: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  status: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    url?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [requestingPickup, setRequestingPickup] = useState(false);
  const [refreshingTracking, setRefreshingTracking] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError(data.message || 'Failed to load order');
      }
    } catch (err) {
      setError('Failed to load order');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!order) return;

    try {
      setCreatingShipment(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping/create-shipment/${orderId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
          },
          body: JSON.stringify({
            weight: 0.5, // Default weight in kg
            autoPickup: true
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`Shipment created successfully!\nAWB: ${data.data.awbCode}\nCourier: ${data.data.courierName}`);
        // Reload order to get updated tracking info
        loadOrder();
      } else {
        alert(data.message || 'Failed to create shipment');
      }
    } catch (err) {
      alert('Failed to create shipment');
      console.error('Error creating shipment:', err);
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleRequestPickup = async () => {
    if (!order) return;
    try {
      setRequestingPickup(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping/admin/request-pickup/${orderId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Pickup requested successfully');
        loadOrder();
      } else {
        alert(data.message || 'Failed to request pickup');
      }
    } catch (error) {
      console.error('Request pickup error:', error);
      alert('Failed to request pickup');
    } finally {
      setRequestingPickup(false);
    }
  };

  const handleRefreshTracking = async () => {
    if (!order) return;
    try {
      setRefreshingTracking(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping/admin/refresh-tracking/${orderId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Tracking refreshed successfully');
        loadOrder();
      } else {
        alert(data.message || 'Failed to refresh tracking');
      }
    } catch (error) {
      console.error('Refresh tracking error:', error);
      alert('Failed to refresh tracking');
    } finally {
      setRefreshingTracking(false);
    }
  };

  const handleGenerateLabel = async () => {
    if (!order) return;
    try {
      setGeneratingLabel(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping/generate-label/${orderId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success && data.data?.labelUrl) {
        window.open(data.data.labelUrl, '_blank');
      } else {
        alert(data.message || 'Failed to generate label');
      }
    } catch (error) {
      console.error('Generate label error:', error);
      alert('Failed to generate label');
    } finally {
      setGeneratingLabel(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    // Prints the dedicated delivery receipt view.
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Order not found'}</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const formatVariantSummary = (variant: any) => {
    if (!variant) return undefined;
    if (typeof variant === 'string') return variant;
    if (typeof variant !== 'object') return undefined;
    const entries = Object.entries(variant)
      .map(([key, value]: [string, any]) => `${key}: ${value}`)
      .join(', ');
    return entries || undefined;
  };

  const receiptData: PrintableReceiptData = {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.payment.status,
    paymentMethod: order.payment.method,
    customer: order.user
      ? {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email,
          phone: order.user.phone,
        }
      : undefined,
    shippingAddress: {
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      phone: order.shippingAddress.phone,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    billingAddress: order.billingAddress
      ? {
          name: `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.trim(),
          phone: order.billingAddress.phone,
          addressLine1: order.billingAddress.addressLine1,
          addressLine2: order.billingAddress.addressLine2,
          city: order.billingAddress.city,
          state: order.billingAddress.state,
          postalCode: order.billingAddress.postalCode,
          country: order.billingAddress.country,
        }
      : undefined,
    tracking: {
      carrier: order.tracking?.carrier,
      trackingNumber: order.tracking?.trackingNumber,
      trackingUrl: order.tracking?.trackingUrl || order.tracking?.url,
    },
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
      variantSummary: formatVariantSummary(item.variant),
    })),
    pricing: {
      subtotal: order.pricing.subtotal,
      tax: order.pricing.tax,
      shipping: order.pricing.shipping,
      discount: order.pricing.discount,
      total: order.pricing.total,
      currency: order.pricing.currency,
    },
  };

  return (
    <>
      <div className="hidden print:block">
        <PrintableReceipt
          data={receiptData}
          title="Delivery Box Receipt"
          subtitle="Place this inside the package"
        />
      </div>
      <div className="space-y-6 print:hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/orders"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="hidden sm:inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Print Delivery Receipt
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
            {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex-shrink-0 h-16 w-16">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.variant).map(([key, value]: [string, any]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{order.pricing.subtotal.toLocaleString()}</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-₹{order.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">₹{order.pricing.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">₹{order.pricing.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{order.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Timeline</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.timeline.map((event, eventIdx) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== order.timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(event.status)}`}>
                              <Calendar className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </p>
                              {event.note && (
                                <p className="text-sm text-gray-500 mt-0.5">{event.note}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Customer</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'User not found'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{order.user?.email || 'N/A'}</span>
                </div>
                {order.user?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{order.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping Address</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-900">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Status Source</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Status updates are managed by Delhivery events and tracking sync. Manual status edits are disabled.
                </p>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Current status:</span>{' '}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                  <p className="mt-1 text-sm text-blue-900">
                    <span className="font-medium">Tracking:</span>{' '}
                    {order.tracking?.trackingNumber || 'Not assigned yet'}
                  </p>
                </div>
                <button
                  onClick={handleRefreshTracking}
                  disabled={refreshingTracking || !order.tracking?.trackingNumber}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refreshingTracking ? 'Syncing...' : 'Sync Status from Delhivery'}
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Shipment */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Shipment Details</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {order.tracking?.trackingNumber ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">AWB Number</span>
                    <span className="text-sm font-medium text-gray-900">{order.tracking.trackingNumber}</span>
                  </div>
                  {order.tracking.carrier && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Carrier</span>
                      <span className="text-sm font-medium text-gray-900">{order.tracking.carrier}</span>
                    </div>
                  )}
                  {(order.tracking.trackingUrl || order.tracking.url) && (
                    <a
                      href={order.tracking.trackingUrl || order.tracking.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                    >
                      Track Package
                    </a>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={handleRequestPickup}
                      disabled={requestingPickup}
                      className="inline-flex justify-center items-center px-3 py-2 border border-green-600 text-green-700 rounded-md hover:bg-green-50 transition-colors text-sm disabled:opacity-50"
                    >
                      {requestingPickup ? 'Requesting...' : 'Request Pickup'}
                    </button>
                    <button
                      onClick={handleGenerateLabel}
                      disabled={generatingLabel}
                      className="inline-flex justify-center items-center px-3 py-2 border border-blue-600 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
                    >
                      {generatingLabel ? 'Generating...' : 'Generate Label'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    No shipment created yet. Create a shipment to get AWB and tracking.
                  </p>
                  <button
                    onClick={handleCreateShipment}
                    disabled={creatingShipment || order.status === 'pending' || order.status === 'cancelled'}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingShipment ? 'Creating Shipment...' : 'Create Shipment'}
                  </button>
                  {(order.status === 'pending' || order.payment.status === 'pending') && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Payment must be confirmed before creating shipment
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
