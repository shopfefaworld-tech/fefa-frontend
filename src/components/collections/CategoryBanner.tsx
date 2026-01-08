'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface CategoryBannerProps {
  type: 'category' | 'collection' | 'occasion';
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoryBanner({ 
  type, 
  name, 
  description, 
  imageUrl 
}: CategoryBannerProps) {
  // Placeholder image URLs - replace these with actual image paths
  const getPlaceholderImage = () => {
    if (imageUrl) return imageUrl;
    
    // Default placeholder based on type
    switch (type) {
      case 'category':
        return '/images/placeholders/category-banner.jpg';
      case 'collection':
        return '/images/placeholders/collection-banner.jpg';
      case 'occasion':
        return '/images/placeholders/occasion-banner.jpg';
      default:
        return '/images/placeholders/default-banner.jpg';
    }
  };

  // Get tagline based on type
  const getTagline = () => {
    if (description) return description;
    
    switch (type) {
      case 'category':
        return `Discover our exquisite collection of ${name.toLowerCase()}`;
      case 'collection':
        return `Adorn yourself with luxurious heritage`;
      case 'occasion':
        return `Find the perfect jewelry for ${name.toLowerCase()}`;
      default:
        return 'Discover our handcrafted jewelry';
    }
  };

  return (
    <section className="relative py-0 overflow-hidden h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh]">
      <div className="absolute inset-0 w-full h-full">
        {/* Background with warm peach/beige color */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #F5E6D3 0%, #F0D9C4 50%, #E8D0B8 100%)'
          }}
        />
        
        {/* Background Image - Left Side */}
        <div className="absolute left-0 top-0 bottom-0 w-1/2 md:w-2/5 lg:w-2/5">
          <Image
            src={getPlaceholderImage()}
            alt={name}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 50vw, 40vw"
          />
        </div>
      </div>

      {/* Content Overlay - Right Side */}
      <div className="container mx-auto px-4 relative z-10 flex items-center h-full">
        <div className="ml-auto w-full md:w-3/5 lg:w-3/5 flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-lg"
          >
            {/* NEW LAUNCH Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span 
                className="px-4 py-2 text-sm sm:text-base font-semibold text-white uppercase tracking-wider"
                style={{
                  backgroundColor: '#1a237e', // Dark blue
                  display: 'inline-block'
                }}
              >
                {type === 'collection' ? 'NEW LAUNCH' : type === 'occasion' ? 'SPECIAL OCCASION' : 'NEW COLLECTION'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant mb-3 sm:mb-4"
              style={{
                color: '#1a237e' // Dark blue/black
              }}
            >
              {name}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl font-light"
              style={{
                color: '#1a237e' // Dark blue/black
              }}
            >
              {getTagline()}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
