'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGift } from 'react-icons/fi';
import QuickPickCard from './QuickPickCard';
import '@/styles/components/cart/QuickPicks.css';

interface QuickPicksProps {
  cartSubtotal: number;
}

export default function QuickPicks({ cartSubtotal }: QuickPicksProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickPicks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/quick-picks`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data.filter((p: any) => p.isActive !== false));
        }
      } catch (error) {
        console.error('Failed to load quick picks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuickPicks();
  }, []);

  const activeProducts = products.filter((p) => p.isActive !== false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="quick-picks-wrapper"
    >
      {/* Section Header */}
      <div className="quick-picks-header-bar">
        <div className="quick-picks-header-content">
          <FiGift className="quick-picks-header-icon" />
          <div>
            <h3 className="quick-picks-header-title">Quick Picks</h3>
            <p className="quick-picks-header-subtitle">
              Complete your look with these perfect additions
            </p>
          </div>
        </div>
      </div>

      {/* Simple Scrollable Carousel */}
      <div className="quick-picks-carousel-container">
        <div className="quick-picks-carousel">
          {loading ? (
            <div className="quick-picks-carousel-item">
              <div className="quick-picks-loading">Loading...</div>
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="quick-picks-carousel-item">
              <div className="quick-picks-empty">No quick picks available</div>
            </div>
          ) : (
            activeProducts.map((product) => (
              <div
                key={product._id}
                className="quick-picks-carousel-item"
              >
                <QuickPickCard
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  comparePrice={product.comparePrice}
                  image={product.image}
                  maxQty={product.inventory?.quantity}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
