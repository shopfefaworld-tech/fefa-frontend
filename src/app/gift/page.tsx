'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface GiftOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function GiftPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/gifts`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((g: any) => ({
            id: g._id,
            name: g.name,
            description: g.description,
            price: g.price,
            image: g.image,
          }));
          setGiftOptions(mapped);
        }
      } catch (error) {
        console.error('Failed to load gift options', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      alert('Please select a gift wrapping option');
      return;
    }

    // Save gift preferences to localStorage for checkout
    const giftPreferences = {
      option: selectedOption,
      message: giftMessage,
      recipientName,
      senderName,
      price: giftOptions.find(o => o.id === selectedOption)?.price || 0
    };
    
    localStorage.setItem('fefa_gift_preferences', JSON.stringify(giftPreferences));
    setSubmitted(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" 
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-cormorant text-gray-800 mb-3">
              Gift Services
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Make your gift extra special with our premium wrapping and personalized message options
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-xl mx-auto"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Gift Options Saved!</h2>
              <p className="text-gray-600 mb-6">
                Your gift preferences have been saved. They will be applied at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/collections">Continue Shopping</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false);
                    setSelectedOption(null);
                    setGiftMessage('');
                    setRecipientName('');
                    setSenderName('');
                    localStorage.removeItem('fefa_gift_preferences');
                  }}
                >
                  Change Options
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Gift Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Gift Wrapping</h2>
                <div className="space-y-4">
                  {giftOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      onClick={() => setSelectedOption(option.id)}
                      className={`relative bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedOption === option.id 
                          ? 'ring-2 ring-rose-400 shadow-lg' 
                          : 'hover:ring-1 hover:ring-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-800">{option.name}</h3>
                            <span className="font-semibold text-rose-500">{formatPrice(option.price)}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOption === option.id 
                            ? 'border-rose-400 bg-rose-400' 
                            : 'border-gray-300'
                        }`}>
                          {selectedOption === option.id && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* No gift wrap option */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    onClick={() => setSelectedOption('none')}
                    className={`relative bg-gray-50 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedOption === 'none' 
                        ? 'ring-2 ring-gray-400' 
                        : 'hover:ring-1 hover:ring-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">Standard Packaging</h3>
                        <p className="text-sm text-gray-500 mt-1">Free standard jewelry box packaging</p>
                      </div>
                      <span className="text-gray-600 font-medium">Free</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedOption === 'none' 
                          ? 'border-gray-400 bg-gray-400' 
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === 'none' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Personalization Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Personalize Your Gift</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient's Name (optional)
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Who is this gift for?"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name (optional)
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="From..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Message (optional)
                      </label>
                      <textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Write a heartfelt message for your loved one..."
                        rows={4}
                        maxLength={200}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all resize-none"
                      />
                      <p className="text-sm text-gray-400 mt-1 text-right">
                        {giftMessage.length}/200 characters
                      </p>
                    </div>
                  </div>

                  {/* Preview Card */}
                  {(recipientName || senderName || giftMessage) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border border-rose-100"
                    >
                      <p className="text-xs text-rose-400 uppercase tracking-wider mb-2">Message Preview</p>
                      <div className="font-serif text-gray-700">
                        {recipientName && <p className="text-lg">Dear {recipientName},</p>}
                        {giftMessage && <p className="mt-2 italic">{giftMessage}</p>}
                        {senderName && <p className="mt-3 text-right">— {senderName}</p>}
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button type="submit" className="flex-1">
                      Save Gift Options
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      href="/cart"
                      className="flex-1"
                    >
                      Go to Cart
                    </Button>
                  </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">How it works</p>
                      <p className="text-amber-700">
                        Your gift options will be saved and automatically applied when you proceed to checkout. 
                        The gift wrapping charge will be added to your order total.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
