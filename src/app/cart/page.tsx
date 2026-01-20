'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import checkoutService from '@/services/checkoutService';
import MainLayout from '@/components/layout/MainLayout';
import QuickPicks from '@/components/cart/QuickPicks';
import '@/styles/components/cart/Cart.css';

// Discount thresholds
const THRESHOLD_10_PERCENT = 2000;
const THRESHOLD_15_PERCENT = 4000;

// Helper function to get valid image URL
const getValidImageUrl = (images: any[] | undefined, fallback: string = '/images/logo.jpg'): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  const firstImage = images[0];
  
  // Handle both string array and object array formats
  if (typeof firstImage === 'string') {
    // If it's a string, use it directly
    if (firstImage.trim() === '' || firstImage === 'undefined' || firstImage === 'null') {
      return fallback;
    }
    return firstImage;
  } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    // If it's an object with url property, use the url
    if (firstImage.url.trim() === '' || firstImage.url === 'undefined' || firstImage.url === 'null') {
      return fallback;
    }
    return firstImage.url;
  }
  
  return fallback;
};

export default function CartPage() {
  const router = useRouter();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCouponDetails, setAppliedCouponDetails] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue?: number;
    maxDiscount?: number;
  } | null>(null);
  const [showCouponConfetti, setShowCouponConfetti] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { 
    cart, 
    localCart,
    isLoading, 
    error, 
    itemCount, 
    totalQuantity, 
    subtotal, 
    total, 
    currency,
    updateCartItem, 
    removeFromCart, 
    clearError,
    getCartItems
  } = useCart();

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveFromCart = async (productId: string, variantId?: string) => {
    setRemovingItemId(productId);
    try {
      await removeFromCart(productId, variantId);
    } catch (error) {
      // Error removing item
    } finally {
      setRemovingItemId(null);
    }
  };

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const handleUpdateQuantity = async (e: React.MouseEvent<HTMLButtonElement>, productId: string, newQuantity: number, variantId?: string) => {
    // Prevent all default behaviors
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    if (newQuantity < 1) return;
    
    // Set updating state to prevent multiple clicks
    const itemKey = `${productId}_${variantId || 'none'}`;
    if (updatingItemId === itemKey) return; // Already updating
    
    setUpdatingItemId(itemKey);
    
    try {
      // Call the update function - it will update the context state
      await updateCartItem(productId, newQuantity, variantId);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Error is already handled by the cart context
    } finally {
      // Clear updating state after a short delay to allow UI to update
      setTimeout(() => {
        setUpdatingItemId(null);
      }, 100);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      // Show error animation for empty code as well
      const couponInput = document.getElementById('coupon-input');
      if (couponInput) {
        couponInput.classList.add('error-shake');
        setTimeout(() => {
          couponInput.classList.remove('error-shake');
        }, 500);
      }
      return;
    }

    try {
      setCouponApplying(true);
      // Call backend coupon apply endpoint
      const response = await checkoutService.applyCoupon(couponCode.trim(), subtotal);

      // Backend returns { success, data: { discount, ... } }
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Invalid coupon code');
      }

      const discountFromCoupon = response.data?.discount || 0;
      if (discountFromCoupon <= 0) {
        throw new Error('Invalid coupon discount');
      }

      setCouponDiscountAmount(discountFromCoupon);
      setCouponApplied(true);
      setAppliedCouponDetails({
        code: response.data?.code || couponCode.trim().toUpperCase(),
        discountType: response.data?.discountType || 'fixed',
        discountValue: response.data?.discountValue,
        maxDiscount: response.data?.maxDiscount,
      });
      setShowCouponConfetti(true);
      setTimeout(() => setShowCouponConfetti(false), 900);
      // Normalize displayed code to actual applied code from backend
      if (response.data?.code) {
        setCouponCode(response.data.code);
      }
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      setCouponDiscountAmount(0);
      setCouponApplied(false);
      setAppliedCouponDetails(null);

      const couponInput = document.getElementById('coupon-input');
      if (couponInput) {
        couponInput.classList.add('error-shake');
        setTimeout(() => {
          couponInput.classList.remove('error-shake');
        }, 500);
      }
    } finally {
      setCouponApplying(false);
    }
  };

  // Use cart data from context - get local cart items if not authenticated
  const cartItems = isAuthenticated ? (cart?.items || []) : getCartItems();
  
  // Calculate threshold-based discount (auto-applied based on subtotal)
  const getThresholdDiscount = () => {
    if (subtotal >= THRESHOLD_15_PERCENT) {
      return { rate: 0.15, label: '15%' };
    } else if (subtotal >= THRESHOLD_10_PERCENT) {
      return { rate: 0.10, label: '10%' };
    }
    return { rate: 0, label: '' };
  };
  
  const thresholdDiscount = getThresholdDiscount();
  const thresholdDiscountAmount = subtotal * thresholdDiscount.rate;
  // Use the higher of coupon discount (absolute) or threshold discount
  const discountAmount = Math.max(couponDiscountAmount, thresholdDiscountAmount);
  const finalTotal = subtotal - discountAmount;
  // Shipping should be based on original subtotal, not discounted total
  const shipping = finalTotal > 0 ? (subtotal >= 1000 ? 0 : 99) : 0;
  const grandTotal = finalTotal + shipping;

  // Calculate threshold messaging for Order Summary
  const getThresholdMessage = () => {
    if (subtotal >= THRESHOLD_15_PERCENT) {
      return {
        type: 'success' as const,
        message: '🎉 15% OFF unlocked!',
        savings: `You're saving ₹${(subtotal * 0.15).toFixed(0)}`,
      };
    } else if (subtotal >= THRESHOLD_10_PERCENT) {
      const amountToNext = THRESHOLD_15_PERCENT - subtotal;
      return {
        type: 'warning' as const,
        message: `Add ₹${amountToNext.toFixed(0)} more for 15% OFF!`,
        savings: `Currently saving ₹${(subtotal * 0.10).toFixed(0)} (10%)`,
      };
    } else {
      const amountToNext = THRESHOLD_10_PERCENT - subtotal;
      return {
        type: 'info' as const,
        message: `Add ₹${amountToNext.toFixed(0)} more to unlock 10% OFF!`,
        savings: `You'll save ₹${(THRESHOLD_10_PERCENT * 0.10).toFixed(0)}`,
      };
    }
  };

  const thresholdMessage = getThresholdMessage();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // No redirect - allow viewing cart without login

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-primary font-medium">Loading your cart...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <FiShoppingBag className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-medium text-primary mb-2">Error loading cart</h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white py-3 px-8 rounded-md hover:bg-accent transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-cormorant text-accent">Shopping Cart</h1>
          <div className="w-24 h-1 bg-accent mx-auto mt-2 rounded-full"></div>
          <p className="text-primary mt-4">
            {itemCount > 0 
              ? `You have ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart` 
              : "Your cart is empty"}
          </p>
        </motion.div>

        {cartItems.length > 0 ? (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cart Items */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg shadow-soft overflow-hidden flex flex-col">
                <div className="p-6 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-primary">Cart Items</h2>
                </div>
                
                {/* Scrollable Cart Items Container */}
                <div className="cart-items-scrollable">
                  <div className="px-6 py-4 pb-6">
                    <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-gray-500 mb-4 pb-2 border-b">
                      <div className="col-span-6">Product</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    
                    <AnimatePresence>
                      {cartItems.map((cartItem) => (
                        <motion.div
                          key={cartItem._id}
                          variants={item as any}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                          className="cart-item border-b last:border-b-0 py-4"
                        >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Product */}
                          <div className="md:col-span-6 flex items-center space-x-4">
                            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={getValidImageUrl(cartItem.product?.images)}
                                alt={cartItem.product?.name || 'Product'}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div>
                              <Link href={`/product/${cartItem.product?.slug || '#'}`} className="font-medium text-primary hover:text-accent transition-colors">
                                {cartItem.product?.name || 'Product'}
                              </Link>
                              {cartItem.variant && (
                                <p className="text-sm text-gray-500">Variant: {cartItem.variant?.name || 'Unknown'}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="md:col-span-2 text-left md:text-center">
                            <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                            <div className="font-medium">₹{cartItem.price.toFixed(2)}</div>
                          </div>
                          
                          {/* Quantity */}
                          <div className="md:col-span-2 text-left md:text-center">
                            <div className="md:hidden text-sm text-gray-500 mb-1">Quantity:</div>
                            <div className="flex items-center md:justify-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateQuantity(e, cartItem.product._id, cartItem.quantity - 1, cartItem.variant?._id);
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || cartItem.quantity <= 1 || updatingItemId === `${cartItem.product._id}_${cartItem.variant?._id || 'none'}`}
                              >
                                {updatingItemId === `${cartItem.product._id}_${cartItem.variant?._id || 'none'}` && cartItem.quantity > 1 ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiMinus className="w-3 h-3" />
                                )}
                              </button>
                              <span className="w-10 text-center">{cartItem.quantity}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateQuantity(e, cartItem.product._id, cartItem.quantity + 1, cartItem.variant?._id);
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || updatingItemId === `${cartItem.product._id}_${cartItem.variant?._id || 'none'}`}
                              >
                                {updatingItemId === `${cartItem.product._id}_${cartItem.variant?._id || 'none'}` ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiPlus className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Total */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                            <div className="md:hidden text-sm text-gray-500">Total:</div>
                            <div className="font-medium text-accent">₹{cartItem.total.toFixed(2)}</div>
                          </div>
                          
                          {/* Remove Button - Mobile */}
                          <div className="flex md:hidden mt-2">
                            <button
                              onClick={() => handleRemoveFromCart(cartItem.product._id, cartItem.variant?._id)}
                              className="text-sm text-gray-500 hover:text-accent transition-colors flex items-center"
                              disabled={removingItemId === cartItem.product._id || isLoading}
                            >
                              {removingItemId === cartItem.product._id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4 mr-1" />
                              )}
                              Remove
                            </button>
                          </div>
                          
                          {/* Remove Button - Desktop */}
                          <div className="hidden md:block absolute right-0 top-0 mt-4 mr-4">
                            <button
                              onClick={() => handleRemoveFromCart(cartItem.product._id, cartItem.variant?._id)}
                              className="text-gray-400 hover:text-accent transition-colors"
                              disabled={removingItemId === cartItem.product._id || isLoading}
                            >
                              {removingItemId === cartItem.product._id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-soft overflow-hidden sticky top-32">
                <div className="p-6">
                  <h2 className="text-xl font-medium text-primary mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Discount 
                          {thresholdDiscount.rate > 0 && thresholdDiscountAmount >= couponDiscountAmount && (
                            <span className="text-xs ml-1">({thresholdDiscount.label} threshold)</span>
                          )} 
                          {couponDiscountAmount > thresholdDiscountAmount && couponApplied && (
                            <span className="text-xs ml-1">(coupon)</span>
                          )}
                        </span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span className="text-accent">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Threshold Discount Banner */}
                  <div className={`mb-4 p-3 rounded-lg border ${
                    thresholdMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : thresholdMessage.type === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <p className={`font-semibold text-sm ${
                      thresholdMessage.type === 'success' 
                        ? 'text-green-700' 
                        : thresholdMessage.type === 'warning'
                        ? 'text-amber-700'
                        : 'text-purple-700'
                    }`}>
                      {thresholdMessage.message}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      thresholdMessage.type === 'success' 
                        ? 'text-green-600' 
                        : thresholdMessage.type === 'warning'
                        ? 'text-amber-600'
                        : 'text-purple-600'
                    }`}>
                      {thresholdMessage.savings}
                    </p>
                    {thresholdMessage.type !== 'success' && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              thresholdMessage.type === 'warning' ? 'bg-amber-500' : 'bg-purple-500'
                            }`}
                            style={{ 
                              width: `${Math.min(
                                thresholdMessage.type === 'warning'
                                  ? ((subtotal - THRESHOLD_10_PERCENT) / (THRESHOLD_15_PERCENT - THRESHOLD_10_PERCENT)) * 100
                                  : (subtotal / THRESHOLD_10_PERCENT) * 100,
                                100
                              )}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Coupon Code */}
                  {!couponApplied ? (
                    <div className="mb-6">
                      <label htmlFor="coupon-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Apply Coupon Code
                      </label>
                      <div className="flex">
                        <input
                          id="coupon-input"
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        <button
                          onClick={applyCoupon}
                          className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-accent transition-colors"
                          disabled={couponApplying}
                        >
                          {couponApplying ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1" hidden={true}>Try code: FEFA10 for 10% off</p>
                    </div>
                  ) : (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3 flex justify-between items-center relative coupon-success">
                      {showCouponConfetti && (
                        <div className="coupon-confetti">
                          <span className="coupon-confetti-piece" />
                          <span className="coupon-confetti-piece" />
                          <span className="coupon-confetti-piece" />
                          <span className="coupon-confetti-piece" />
                          <span className="coupon-confetti-piece" />
                          <span className="coupon-confetti-piece" />
                        </div>
                      )}
                      <div>
                        <p className="text-green-700 font-medium">Coupon Applied!</p>
                        <p className="text-green-600 text-sm">
                          {appliedCouponDetails?.discountType === 'percentage' && appliedCouponDetails.discountValue
                            ? `${appliedCouponDetails.discountValue}% off`
                            : `₹${couponDiscountAmount.toFixed(2)} off`}
                          {appliedCouponDetails?.maxDiscount
                            ? ` (max ₹${appliedCouponDetails.maxDiscount})`
                            : ''}
                        </p>
                        <p className="text-green-600 text-xs">
                          Code: {couponCode.toUpperCase()} • Saving ₹{couponDiscountAmount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCouponApplied(false);
                          setCouponDiscountAmount(0);
                          setCouponCode('');
                          setAppliedCouponDetails(null);
                          setShowCouponConfetti(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        // Open login modal with redirect to checkout
                        openLoginModal('/checkout');
                      } else {
                        router.push('/checkout');
                      }
                    }}
                    className="w-full bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                  
                  {/* Continue Shopping */}
                  <Link
                    href="/collections"
                    className="block text-center text-primary hover:text-accent transition-colors mt-4 text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Quick Picks Section - Full Width */}
          <QuickPicks cartSubtotal={subtotal} />
        </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-20 h-20 bg-soft-pink-100 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="w-10 h-10 text-accent empty-cart-icon" />
            </div>
            <h2 className="text-2xl font-medium text-primary mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Looks like you haven't added any jewelry to your cart yet.
            </p>
            <Link
              href="/collections"
              className="bg-primary text-white py-3 px-8 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
            >
              <span>Start Shopping</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
