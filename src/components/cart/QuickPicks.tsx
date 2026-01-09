'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiGift } from 'react-icons/fi';
import QuickPickCard from './QuickPickCard';
import '@/styles/components/cart/QuickPicks.css';

// Mock data for Quick Picks products (under ₹200)
const quickPicksProducts = [
  { _id: 'qp1', name: 'Pearl Stud Mini', price: 49, comparePrice: 99, image: '/images/product-1.png', isActive: true },
  { _id: 'qp2', name: 'Silver Nose Pin', price: 79, comparePrice: 149, image: '/images/product-2.png', isActive: true },
  { _id: 'qp3', name: 'Thread Bracelet', price: 99, comparePrice: 179, image: '/images/product-3.png', isActive: true },
  { _id: 'qp4', name: 'Crystal Pendant', price: 129, comparePrice: 199, image: '/images/product-4.png', isActive: true },
  { _id: 'qp5', name: 'Mini Hoop Set', price: 149, comparePrice: 249, image: '/images/product-5.png', isActive: true },
  { _id: 'qp6', name: 'Charm Anklet', price: 169, comparePrice: 279, image: '/images/product-6.png', isActive: true },
  { _id: 'qp7', name: 'Beaded Ring', price: 59, comparePrice: 99, image: '/images/product-7.png', isActive: true },
  { _id: 'qp8', name: 'Hair Clip Set', price: 199, comparePrice: 349, image: '/images/product-8.png', isActive: true },
];

interface QuickPicksProps {
  cartSubtotal: number;
}

export default function QuickPicks({ cartSubtotal }: QuickPicksProps) {
  // Filter active products
  const activeProducts = quickPicksProducts.filter(p => p.isActive);

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
          {activeProducts.map((product) => (
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
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
