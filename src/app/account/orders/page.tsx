'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import '@/styles/components/account/Orders.css';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: Array<{ url: string } | string>;
  } | string;
  variant?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  timeline: TimelineEvent[];
}

export default function OrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fefa_access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
      case 'confirmed':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
        return 'status-processing';
      default:
        return 'status-processing';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return 'Processing';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getItemImage = (item: OrderItem): string => {
    // If item has direct image
    if (item.image) return item.image;
    
    // If product is populated object
    if (typeof item.product === 'object' && item.product?.images?.length > 0) {
      const firstImage = item.product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    
    // Fallback placeholder
    return '/images/product-placeholder.png';
  };

  const getItemName = (item: OrderItem): string => {
    if (item.name) return item.name;
    if (typeof item.product === 'object' && item.product?.name) {
      return item.product.name;
    }
    return 'Product';
  };

  const formatAddress = (addr: Order['shippingAddress']): string => {
    const parts = [
      addr.addressLine1,
      addr.addressLine2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getOrderCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    };
  };

  const counts = getOrderCounts();

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-dark-gray">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-cormorant text-primary mb-2 sm:mb-4">My Orders</h1>
              <p className="text-dark-gray text-base sm:text-lg px-4">
                Track and manage your jewelry orders
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="orders-filter-tabs mb-6 sm:mb-8">
              <button
                className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                All Orders ({counts.all})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('processing')}
              >
                Processing ({counts.processing + counts.pending})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('shipped')}
              >
                Shipped ({counts.shipped})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('delivered')}
              >
                Delivered ({counts.delivered})
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="empty-orders">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-dark-gray">Loading your orders...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="empty-orders">
                <div className="empty-icon">⚠️</div>
                <h3 className="empty-title">Failed to load orders</h3>
                <p className="empty-description">{error}</p>
                <Button onClick={fetchOrders} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {/* Orders List */}
            {!loading && !error && (
              <div className="orders-container">
                {filteredOrders.length === 0 ? (
                  <div className="empty-orders">
                    <div className="empty-icon">📦</div>
                    <h3 className="empty-title">No orders found</h3>
                    <p className="empty-description">
                      {selectedFilter === 'all' 
                        ? "You haven't placed any orders yet." 
                        : `No ${selectedFilter} orders found.`
                      }
                    </p>
                    <Button href="/collections" className="mt-4">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      {/* Order Header */}
                      <div className="order-header">
                        <div className="order-info">
                          <h3 className="order-id">Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="order-total">₹{order.pricing.total.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <div className="item-image">
                              <Image
                                src={getItemImage(item)}
                                alt={getItemName(item)}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
                                }}
                              />
                            </div>
                            <div className="item-details">
                              <h4 className="item-name">{getItemName(item)}</h4>
                              {item.sku && <p className="item-size">SKU: {item.sku}</p>}
                              <p className="item-quantity">Qty: {item.quantity}</p>
                            </div>
                            <div className="item-price">
                              <p className="price">₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="order-actions">
                        <div className="order-details">
                          <p className="shipping-address">
                            <strong>Shipping to:</strong> {formatAddress(order.shippingAddress)}
                          </p>
                          {order.tracking?.trackingNumber && (
                            <p className="tracking-number">
                              <strong>Tracking:</strong> {order.tracking.trackingNumber}
                              {order.tracking.carrier && ` (${order.tracking.carrier})`}
                            </p>
                          )}
                        </div>
                        <div className="action-buttons">
                          <Button
                            variant="outline"
                            className="action-btn"
                            onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                          >
                            {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" className="action-btn">
                              Reorder
                            </Button>
                          )}
                          {order.status === 'shipped' && order.tracking?.trackingUrl && (
                            <Button 
                              variant="outline" 
                              className="action-btn"
                              onClick={() => window.open(order.tracking?.trackingUrl, '_blank')}
                            >
                              Track Package
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedOrder === order._id && (
                        <div className="order-expanded">
                          <div className="expanded-section">
                            <h4>Order Timeline</h4>
                            <div className="timeline">
                              {order.timeline?.length > 0 ? (
                                order.timeline.map((event, idx) => (
                                  <div key={idx} className={`timeline-item completed`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <p className="timeline-title">{getStatusText(event.status)}</p>
                                      <p className="timeline-date">{formatDate(event.timestamp)}</p>
                                      {event.note && <p className="timeline-note">{event.note}</p>}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div className="timeline-item completed">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <p className="timeline-title">Order Placed</p>
                                      <p className="timeline-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                  </div>
                                  <div className={`timeline-item ${order.status === 'processing' || order.status === 'confirmed' ? 'current' : order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <p className="timeline-title">Processing</p>
                                      <p className="timeline-date">
                                        {order.status === 'processing' || order.status === 'confirmed' ? 'In Progress' : order.status === 'shipped' || order.status === 'delivered' ? 'Completed' : 'Pending'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`timeline-item ${order.status === 'shipped' ? 'current' : order.status === 'delivered' ? 'completed' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <p className="timeline-title">Shipped</p>
                                      <p className="timeline-date">
                                        {order.status === 'shipped' ? 'In Transit' : order.status === 'delivered' ? 'Completed' : 'Pending'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                      <p className="timeline-title">Delivered</p>
                                      <p className="timeline-date">
                                        {order.status === 'delivered' ? 'Completed' : 'Pending'}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          <div className="expanded-section mt-4">
                            <h4>Order Summary</h4>
                            <div className="pricing-breakdown">
                              <div className="pricing-row">
                                <span>Subtotal</span>
                                <span>₹{order.pricing.subtotal.toLocaleString()}</span>
                              </div>
                              {order.pricing.tax > 0 && (
                                <div className="pricing-row">
                                  <span>Tax</span>
                                  <span>₹{order.pricing.tax.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="pricing-row">
                                <span>Shipping</span>
                                <span>{order.pricing.shipping > 0 ? `₹${order.pricing.shipping.toLocaleString()}` : 'Free'}</span>
                              </div>
                              {order.pricing.discount > 0 && (
                                <div className="pricing-row discount">
                                  <span>Discount</span>
                                  <span>-₹{order.pricing.discount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="pricing-row total">
                                <span>Total</span>
                                <span>₹{order.pricing.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
