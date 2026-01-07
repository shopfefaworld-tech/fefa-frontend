'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Link from 'next/link';
import API_CONFIG from '@/config/api';
import '@/styles/components/layout/TopBanner.css';

// Set CSS variable for header positioning
const setBannerHeight = (height: number) => {
  document.documentElement.style.setProperty('--top-banner-height', `${height}px`);
};

interface TopBannerData {
  text: string;
  link: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

export default function TopBanner() {
  const [bannerData, setBannerData] = useState<TopBannerData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const loadBanner = async () => {
      // Check cache first (10 minute TTL)
      const cacheKey = 'fefa_top_banner_cache';
      const cacheTime = 10 * 60 * 1000; // 10 minutes
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime) {
            const data = cachedData;
            if (data.isActive && data.text && data.text.trim()) {
              const dismissedKey = `topBannerDismissed_${data.text}`;
              const wasDismissed = sessionStorage.getItem(dismissedKey);
              if (!wasDismissed) {
                setBannerData(data);
                setIsVisible(true);
              }
            }
            return; // Use cached data
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/settings/top-banner`);
        
        if (!response.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Top banner API error:', response.status, response.statusText);
          }
          return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const data = result.data;
          
          // Cache the data
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: data,
              timestamp: Date.now()
            }));
          } catch (e) {
            // Cache storage failed, continue
          }
          
          // Only show if active and has text
          if (data.isActive && data.text && data.text.trim()) {
            // Check if banner was dismissed in this session
            const dismissedKey = `topBannerDismissed_${data.text}`;
            const wasDismissed = sessionStorage.getItem(dismissedKey);
            
            if (!wasDismissed) {
              setBannerData(data);
              setIsVisible(true);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading top banner:', error);
        }
      }
    };

    loadBanner();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Store dismissal in session storage
    if (bannerData?.text) {
      const dismissedKey = `topBannerDismissed_${bannerData.text}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
  };

  // Set banner height - must be called before any conditional returns
  useEffect(() => {
    if (isVisible && !isDismissed) {
      // Set banner height (approximately 40px for py-2)
      setBannerHeight(40);
    } else {
      setBannerHeight(0);
    }
  }, [isVisible, isDismissed]);

  if (!bannerData || !isVisible || isDismissed) {
    return null;
  }

  // Prepare text for seamless scrolling (duplicate multiple times)
  const scrollingText = `${bannerData.text} • `;
  const repeatedText = Array(4).fill(scrollingText).join('');

  const bannerContent = (
    <div
      className="w-full py-2 px-4 text-sm font-medium relative overflow-hidden"
      style={{
        backgroundColor: bannerData.backgroundColor,
        color: bannerData.textColor,
        margin: 0,
        marginBottom: 0,
      }}
    >
      <div className="flex items-center gap-4 relative">
        {/* Scrolling text */}
        <div className="flex-1 top-banner-marquee min-w-0">
          <div className="top-banner-marquee-wrapper">
            <span className="top-banner-marquee-content">{repeatedText}</span>
            <span className="top-banner-marquee-content">{repeatedText}</span>
          </div>
        </div>
        {/* Close button - positioned absolutely to stay on right */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:opacity-70 transition-opacity flex-shrink-0 z-20 relative"
          aria-label="Dismiss banner"
          style={{ 
            color: bannerData.textColor,
            backgroundColor: bannerData.backgroundColor
          }}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[60]"
          style={{ margin: 0, marginBottom: 0 }}
        >
          {bannerData.link ? (
            <Link href={bannerData.link} className="block">
              {bannerContent}
            </Link>
          ) : (
            bannerContent
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
