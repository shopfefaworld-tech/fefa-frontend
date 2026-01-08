'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import '@/styles/components/collections/CategoryBanner.css';

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

  return (
    <section className="category-banner relative py-0 overflow-hidden w-full">
      <div className="relative w-full h-full">
        {/* Banner Image - Full Width */}
        <div className="relative w-full">
          <Image
            src={getPlaceholderImage()}
            alt={name}
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
            sizes="100vw"
            style={{ maxHeight: '600px', objectFit: 'cover' }}
          />
        </div>
      </div>
    </section>
  );
}
