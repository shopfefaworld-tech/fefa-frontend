'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

interface QuickPickCardProps {
  _id: string;
  name: string;
  price: number;
  comparePrice: number;
  image: string;
}

export default function QuickPickCard({
  _id,
  name,
  price,
  comparePrice,
  image,
}: QuickPickCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const discountPercent = comparePrice > price 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || isAdded) return;

    try {
      setIsAdding(true);
      await addToCart(_id, 1, undefined, {
        name,
        image,
        slug: _id,
        price,
      });
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="quick-pick-card"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="quick-pick-badge">
          -{discountPercent}%
        </div>
      )}

      {/* Product Image */}
      <div className="quick-pick-image">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="100px"
        />
      </div>

      {/* Product Info */}
      <div className="quick-pick-info">
        <h4 className="quick-pick-name" title={name}>
          {name}
        </h4>
        
        <div className="quick-pick-price">
          <span className="quick-pick-current-price">₹{price}</span>
          {comparePrice > price && (
            <span className="quick-pick-compare-price">₹{comparePrice}</span>
          )}
        </div>
      </div>

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAddToCart}
        disabled={isAdding || isAdded}
        className={`quick-pick-add-btn ${isAdded ? 'added' : ''}`}
      >
        {isAdded ? (
          <>
            <FiCheck className="w-3 h-3" />
            <span>Added</span>
          </>
        ) : isAdding ? (
          <div className="quick-pick-spinner" />
        ) : (
          <>
            <FiPlus className="w-3 h-3" />
            <span>Add</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
