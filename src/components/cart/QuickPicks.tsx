'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Filter active products and duplicate for infinite scroll
  const activeProducts = quickPicksProducts.filter(p => p.isActive);
  // Triple the products for seamless infinite scroll
  const duplicatedProducts = [...activeProducts, ...activeProducts, ...activeProducts];

  // Auto-scroll effect - scrolls from right to left
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || activeProducts.length === 0) return;

    let animationId: number | null = null;
    const scrollSpeed = 0.5; // pixels per frame
    // Calculate single set width: (card width + gap) * number of products
    const cardWidth = 130; // matches CSS
    const gap = 16; // matches CSS gap-4 (1rem = 16px)
    const singleSetWidth = (cardWidth + gap) * activeProducts.length;
    
    // Initialize scroll position after layout
    const initializeScroll = () => {
      // Start from the right - position at the start of the 3rd set (index 2)
      // This shows content starting from the right side
      const startPosition = singleSetWidth * 2;
      scrollContainer.scrollLeft = startPosition;
      return startPosition;
    };

    // Wait for next frame to ensure layout is ready
    requestAnimationFrame(() => {
      let scrollPosition = initializeScroll();

      const animate = () => {
        const container = scrollRef.current;
        if (!container) {
          if (animationId) cancelAnimationFrame(animationId);
          return;
        }

        if (!isPaused) {
          // Scroll left (decrease position) - content moves from right to left
          scrollPosition -= scrollSpeed;
          
          // Reset to right when we've scrolled past the start of 2nd set
          if (scrollPosition <= singleSetWidth) {
            scrollPosition = singleSetWidth * 2; // Reset to start of 3rd set
            container.scrollLeft = scrollPosition;
          } else {
            container.scrollLeft = scrollPosition;
          }
        }
        
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, activeProducts.length]);

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

      {/* Infinite Carousel */}
      <div 
        className="quick-picks-carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="quick-picks-carousel-gradient left" />
        <div 
          ref={scrollRef}
          className="quick-picks-carousel"
        >
          {duplicatedProducts.map((product, index) => (
            <div
              key={`${product._id}-${index}`}
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
        <div className="quick-picks-carousel-gradient right" />
      </div>
    </motion.div>
  );
}
