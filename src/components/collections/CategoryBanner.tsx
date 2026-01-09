'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import bannerService from '@/services/bannerService';
import '@/styles/components/collections/CategoryBanner.css';

interface CategoryBannerProps {
  type: 'category' | 'collection' | 'occasion';
  name: string;
  slug?: string; // The slug of the category/collection/occasion
  description?: string;
  imageUrl?: string; // Fallback image from the entity itself
}

interface BannerData {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function CategoryBanner({ 
  type, 
  name,
  slug,
  description, 
  imageUrl 
}: CategoryBannerProps) {
  const [adminBanner, setAdminBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch admin-uploaded banner for this page
  useEffect(() => {
    const fetchBanner = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        // @ts-ignore - bannerService is JS file, accepts string | null | undefined
        const result = await bannerService.getBannersByTarget(type, slug);
        if (result.success && result.data && result.data.length > 0) {
          // Use the first active banner
          setAdminBanner(result.data[0]);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [type, slug]);

  // Get the image to display - prioritize admin banner, then entity image
  const getBannerImage = () => {
    // If admin banner is available and image hasn't errored, use it
    if (adminBanner?.image && !imageError) {
      return adminBanner.image;
    }
    
    // If entity has an image, use that
    if (imageUrl) {
      return imageUrl;
    }
    
    // Return null if no image available (we'll show a gradient instead)
    return null;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const bannerImage = getBannerImage();

  // Don't show anything while loading (to prevent flash)
  if (loading) {
    return (
      <section className="category-banner relative py-0 overflow-hidden w-full">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-100 animate-pulse" />
      </section>
    );
  }

  // If no image at all, show a gradient background with the category name
  if (!bannerImage) {
    return (
      <section className="category-banner relative py-0 overflow-hidden w-full">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 flex items-center justify-center">
          <motion.div 
            className="text-center text-white px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-4">
              {name}
            </h1>
            {description && (
              <p className="text-lg md:text-xl lg:text-2xl font-light">
                {description}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="category-banner relative py-0 overflow-hidden w-full">
      <div className="relative w-full h-full">
        {/* Banner Image - Full Width */}
        <div className="relative w-full">
          <Image
            src={bannerImage}
            alt={adminBanner?.title || name}
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
            sizes="100vw"
            style={{ maxHeight: '600px', objectFit: 'cover' }}
            onError={handleImageError}
          />
          
          {/* Optional: Overlay with title/description from admin banner */}
          {adminBanner && (adminBanner.title || adminBanner.subtitle) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <motion.div 
                className="text-center text-white px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {adminBanner.title && (
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-4">
                    {adminBanner.title}
                  </h1>
                )}
                {adminBanner.subtitle && (
                  <p className="text-lg md:text-xl lg:text-2xl font-light">
                    {adminBanner.subtitle}
                  </p>
                )}
                {adminBanner.buttonText && adminBanner.buttonLink && (
                  <a 
                    href={adminBanner.buttonLink}
                    className="inline-block mt-6 px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                  >
                    {adminBanner.buttonText}
                  </a>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
