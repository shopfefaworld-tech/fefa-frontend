'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack as ArrowLeft,
  MdPerson as User,
  MdLocationOn as MapPin,
  MdPhone as Phone,
  MdEmail as Mail,
  MdInventory as Package,
  MdLocalShipping as Truck,
  MdAttachMoney as DollarSign,
  MdCalendarToday as Calendar
} from 'react-icons/md';
import adminService from '../../../../services/adminService';

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
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [requestingPickup, setRequestingPickup] = useState(false);
  const [refreshingTracking, setRefreshingTracking] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: '',
    trackingNumber: '',
    url: ''
  });

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
        setNewStatus(data.data.status);
        if (data.data.tracking) {
          setTrackingInfo({
            carrier: data.data.tracking.carrier || '',
            trackingNumber: data.data.tracking.trackingNumber || '',
            url: data.data.tracking.trackingUrl || data.data.tracking.url || ''
          });
        }
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

  const handleUpdateOrder = async () => {
    if (!order) return;
    
    try {
      setUpdating(true);
      
      const updateData: any = {};
      
      if (newStatus !== order.status) {
        updateData.status = newStatus;
        updateData.note = statusNote || `Status updated to ${newStatus}`;
      }
      
      if (trackingInfo.trackingNumber) {
        updateData.tracking = {
          ...trackingInfo,
          trackingUrl: trackingInfo.url,
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fefa_access_token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        setStatusNote('');
        alert('Order updated successfully');
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert('Failed to update order');
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
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

  return (
    <div className="space-y-6">
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
        <div className="flex space-x-2">
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

          {/* Update Order Status */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Update Order</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Note (optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Add a note about this status change"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Carrier
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.carrier}
                    onChange={(e) => setTrackingInfo({...trackingInfo, carrier: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g., FedEx, Blue Dart"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking URL
                  </label>
                  <input
                    type="url"
                    value={trackingInfo.url}
                    onChange={(e) => setTrackingInfo({...trackingInfo, url: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://..."
                  />
                </div>

                <button
                  onClick={handleUpdateOrder}
                  disabled={updating}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </div>
          </div>

          {/* Blue Dart Shipment */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Blue Dart Shipment</h3>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
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
                    <button
                      onClick={handleRefreshTracking}
                      disabled={refreshingTracking}
                      className="inline-flex justify-center items-center px-3 py-2 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                    >
                      {refreshingTracking ? 'Refreshing...' : 'Refresh Tracking'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    No shipment created yet. Create a Blue Dart shipment to get AWB and tracking.
                  </p>
                  <button
                    onClick={handleCreateShipment}
                    disabled={creatingShipment || order.status === 'pending' || order.status === 'cancelled'}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingShipment ? 'Creating Shipment...' : 'Create Blue Dart Shipment'}
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
  );
}
