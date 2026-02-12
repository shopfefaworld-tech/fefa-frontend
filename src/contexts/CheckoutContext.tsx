'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import checkoutService from '../services/checkoutService';
import authService from '../services/authService';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  postalCode?: string;
  country: string;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  details?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardName?: string;
    upiId?: string;
    bankName?: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface CheckoutContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  shippingAddress: ShippingAddress;
  setShippingAddress: (address: ShippingAddress) => void;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  order: Order | null;
  setOrder: (order: Order) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceedToNext: () => boolean;
  createOrder: () => Promise<void>;
  processPayment: (razorpayResponse?: any) => Promise<boolean>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cart, subtotal, total, itemCount } = useCart();
  const { user } = useAuth();
  const [savedAddressesCount, setSavedAddressesCount] = useState<number | null>(null);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !shippingAddress.email) {
      setShippingAddress(prev => ({ ...prev, email: user.email }));
    }
  }, [user, shippingAddress.email]);

  // Pre-fill shipping address from saved default address (if any)
  useEffect(() => {
    const prefillFromSavedAddress = async () => {
      if (!user) return;

      try {
        const { accessToken } = authService.getStoredTokens();
        if (!accessToken) return;

        const response = await authService.getProfile(accessToken);
        const profileUser = (response as any).user || (response as any).data?.user || response;
        const addresses = profileUser?.addresses || [];

        setSavedAddressesCount(addresses.length);

        if (!addresses.length) return;

        const defaultAddress =
          addresses.find((addr: any) => addr.isDefault) || addresses[0];

        if (!defaultAddress) return;

        setShippingAddress(prev => ({
          ...prev,
          firstName: defaultAddress.firstName || prev.firstName,
          lastName: defaultAddress.lastName || prev.lastName,
          email: prev.email || profileUser.email || '',
          phone: defaultAddress.phone || prev.phone,
          address: defaultAddress.addressLine1 || prev.address,
          addressLine1: defaultAddress.addressLine1 || prev.addressLine1,
          addressLine2: defaultAddress.addressLine2 || prev.addressLine2,
          city: defaultAddress.city || prev.city,
          state: defaultAddress.state || prev.state,
          zipCode: defaultAddress.postalCode || prev.zipCode,
          postalCode: defaultAddress.postalCode || prev.postalCode,
          country: defaultAddress.country || prev.country || 'India',
        }));
      } catch (err) {
        console.error('Failed to prefill shipping address from saved address:', err);
      }
    };

    prefillFromSavedAddress();
    // Only when authenticated user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const clearError = () => setError(null);

  const nextStep = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1: // Shipping Information
        return !!(
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.email &&
          shippingAddress.phone &&
          shippingAddress.address &&
          shippingAddress.city &&
          shippingAddress.state &&
          shippingAddress.zipCode
        );
      case 2: // Order Review (payment via Razorpay after Place Order)
        return true;
      case 3: // Order Confirmation
        return false;
      default:
        return false;
    }
  };

  const createOrder = async (): Promise<void> => {
    if (!shippingAddress?.address && !shippingAddress?.addressLine1) {
      throw new Error('Shipping address not available');
    }
    // Default to online (Razorpay) when no payment step — customer pays in Razorpay modal
    const methodToUse = paymentMethod || { type: 'upi' as const };
    if (!paymentMethod) setPaymentMethod(methodToUse);

    // Check if we have cart items (either from cart context or need to get them)
    const cartItems = cart?.items || [];
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Format shipping address for API
      const formattedShippingAddress = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.address || shippingAddress.addressLine1 || '',
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.zipCode || shippingAddress.postalCode || '',
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone,
      };

      // Best-effort: save shipping address as a saved address for future orders
      try {
        const { accessToken } = authService.getStoredTokens();
        if (accessToken) {
          const addressPayload = {
            type: 'home',
            firstName: formattedShippingAddress.firstName,
            lastName: formattedShippingAddress.lastName,
            company: undefined as string | undefined,
            addressLine1: formattedShippingAddress.addressLine1,
            addressLine2: formattedShippingAddress.addressLine2 || undefined,
            city: formattedShippingAddress.city,
            state: formattedShippingAddress.state,
            postalCode: formattedShippingAddress.postalCode,
            country: formattedShippingAddress.country || 'India',
            phone: formattedShippingAddress.phone,
            // Make the first ever address default; otherwise respect existing defaults
            isDefault: savedAddressesCount === 0,
          };

          const hasRequiredFields =
            addressPayload.firstName &&
            addressPayload.lastName &&
            addressPayload.addressLine1 &&
            addressPayload.city &&
            addressPayload.state &&
            addressPayload.postalCode &&
            addressPayload.phone;

          if (hasRequiredFields) {
            await authService.addAddress(accessToken, addressPayload);
          }
        }
      } catch (addressError) {
        // Do not block checkout if saving address fails
        console.error('Failed to save shipping address to saved addresses:', addressError);
      }

      // Format cart items as fallback for backend (in case MongoDB cart sync failed)
      const formattedItems = cartItems.map(item => ({
        productId: typeof item.product === 'string' ? item.product : item.product._id,
        variantId: item.variant ? (typeof item.variant === 'string' ? item.variant : item.variant._id) : undefined,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create order via API (include items as fallback)
      const response = await checkoutService.createOrder({
        shippingAddress: formattedShippingAddress,
        billingAddress: formattedShippingAddress, // Using same address for billing
        paymentMethod: { type: methodToUse.type },
        items: formattedItems, // Fallback items from frontend
      });

      if (!response.success || !response.order) {
        throw new Error(response.message || 'Failed to create order');
      }

      // Map API response to Order interface
      const apiPricing = (response as any).order?.pricing;
      const apiTotal =
        (apiPricing && typeof apiPricing.total === 'number' ? apiPricing.total : undefined) ??
        (typeof response.order.total === 'number' ? response.order.total : undefined);

      const newOrder: Order = {
        id: response.order._id || response.order.orderNumber,
        items: cartItems.map(item => ({
          productId: typeof item.product === 'string' ? item.product : item.product._id,
          productName: typeof item.product === 'string' ? '' : item.product.name,
          variantId: item.variant ? (typeof item.variant === 'string' ? item.variant : item.variant._id) : undefined,
          variantName: item.variant && typeof item.variant !== 'string' ? item.variant.name : undefined,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          image: typeof item.product === 'string' 
            ? undefined 
            : (typeof item.product.images?.[0] === 'string' 
              ? item.product.images[0] 
              : item.product.images?.[0]?.url)
        })),
        shippingAddress,
        paymentMethod: methodToUse,
        subtotal:
          typeof apiPricing?.subtotal === 'number'
            ? apiPricing.subtotal
            : subtotal,
        discount:
          typeof apiPricing?.discount === 'number'
            ? apiPricing.discount
            : 0,
        shipping:
          typeof apiPricing?.shipping === 'number'
            ? apiPricing.shipping
            : (subtotal >= 1000 ? 0 : 99),
        // Prefer backend-computed total (includes shipping), fall back to cart total
        total:
          typeof apiTotal === 'number'
            ? apiTotal
            : subtotal + (subtotal >= 1000 ? 0 : 99),
        status: response.order.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store order ID for payment processing
      (newOrder as any).dbOrderId = response.order._id;

      setOrder(newOrder);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (razorpayResponse?: any): Promise<boolean> => {
    if (!order || !paymentMethod) {
      throw new Error('Order or payment method not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (!razorpayResponse) {
        throw new Error('Payment response required. Please complete payment through Razorpay.');
      }

      const dbOrderId = (order as any).dbOrderId || order.id;
      const verifyResponse = await checkoutService.verifyPayment(
        razorpayResponse.razorpay_order_id,
        razorpayResponse.razorpay_payment_id,
        razorpayResponse.razorpay_signature,
        dbOrderId
      );

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || 'Payment verification failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const value: CheckoutContextType = {
    currentStep,
    setCurrentStep,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    order,
    setOrder,
    isProcessing,
    setIsProcessing,
    error,
    setError,
    clearError,
    nextStep,
    prevStep,
    canProceedToNext,
    createOrder,
    processPayment
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
