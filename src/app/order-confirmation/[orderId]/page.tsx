'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheck, FiPackage, FiTruck, FiMail, FiDownload, FiHome, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import checkoutService from '@/services/checkoutService';

// Helper function to get valid image URL
const getValidImageUrl = (image: string | undefined, fallback: string = '/images/logo.jpg'): string => {
  if (!image || image.trim() === '' || image === 'undefined' || image === 'null') {
    return fallback;
  }
  return image;
};

// Order item interface matching API response
interface OrderItem {
  product: string | { _id: string; name: string; slug: string; images: any[] };
  variant?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

// Order interface matching API response
interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; firstName: string; lastName: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
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
    method: 'cod' | 'online' | 'wallet' | 'card';
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    transactionId?: string;
    gateway?: string;
    paidAt?: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await checkoutService.getOrder(params.orderId);
        // API returns { success: true, data: {...} }
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Failed to fetch order');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  const formatPaymentMethod = (payment: Order['payment'] | undefined) => {
    if (!payment) return 'Not specified';
    
    switch (payment.method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'online':
        return 'Online Payment (UPI/Net Banking)';
      case 'wallet':
        return 'Digital Wallet';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return payment.method || 'Online Payment';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-primary font-medium">Loading order details...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <FiPackage className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-medium text-primary mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                {error || 'The order you are looking for does not exist or has been removed.'}
              </p>
              <div className="space-y-4">
                <Link
                  href="/account/orders"
                  className="bg-accent text-white py-3 px-8 rounded-md hover:bg-accent/90 transition-colors"
                >
                  View All Orders
                </Link>
                <div>
                  <Link
                    href="/collections"
                    className="text-primary hover:text-accent transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </motion.div>

          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-cormorant text-accent mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-accent font-medium">Order Number: {order.orderNumber}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-accent" />
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  {order.items.map((item: OrderItem, index: number) => (
                    <motion.div
                      key={`${item.product}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-white rounded-lg"
                    >
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={getValidImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary">{item.name}</p>
                        {item.sku && (
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-accent">₹{item.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5 text-accent" />
                  Shipping Information
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p className="mt-2">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  </p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-accent" />
                  Payment Information
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{formatPaymentMethod(order.payment)}</p>
                  <p className={`text-xs mt-1 ${
                    order.payment.status === 'paid' ? 'text-green-600' :
                    order.payment.status === 'pending' ? 'text-yellow-600' :
                    order.payment.status === 'failed' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {getPaymentStatusText(order.payment.status)}
                  </p>
                  {order.payment.transactionId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Transaction ID: {order.payment.transactionId}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Tracking Information (if available) */}
              {order.tracking?.trackingNumber && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                    <FiTruck className="w-5 h-5 text-accent" />
                    Tracking Information
                  </h3>
                  <div className="text-sm text-gray-600">
                    {order.tracking.carrier && (
                      <p><span className="font-medium">Carrier:</span> {order.tracking.carrier}</p>
                    )}
                    <p><span className="font-medium">Tracking Number:</span> {order.tracking.trackingNumber}</p>
                    {order.tracking.trackingUrl && (
                      <a 
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline mt-2 inline-block"
                      >
                        Track Your Package →
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Total & Next Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-32">
                <h3 className="text-lg font-medium text-primary mb-4">Order Total</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{order.pricing.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}

                  {order.pricing.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">₹{order.pricing.tax.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {order.pricing.shipping === 0 ? 'Free' : `₹${order.pricing.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span className="text-accent">₹{order.pricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Order Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-400' :
                      order.status === 'confirmed' ? 'bg-blue-400' :
                      order.status === 'processing' ? 'bg-blue-500' :
                      order.status === 'shipped' ? 'bg-purple-400' :
                      order.status === 'delivered' ? 'bg-green-400' :
                      order.status === 'cancelled' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary">What's Next?</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>You'll receive an order confirmation email shortly</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>We'll prepare your order for shipping</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>You'll get tracking information once shipped</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Expected delivery: 3-5 business days</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handlePrintReceipt}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                  
                  <Link
                    href="/account/orders"
                    className="block w-full bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition-colors text-center"
                  >
                    View All Orders
                  </Link>
                  
                  <Link
                    href="/collections"
                    className="block w-full text-center text-primary hover:text-accent transition-colors py-2"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
