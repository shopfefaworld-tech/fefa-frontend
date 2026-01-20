'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiSearch, FiTag, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { Product, CollectionCategory } from '@/types/data';
import '@/styles/components/ui/SearchSuggestions.css';

interface SearchSuggestionsProps {
  searchTerm: string;
  products: Product[];
  categories: CollectionCategory[];
  onSuggestionClick: (suggestion: string, type?: 'product' | 'category', slug?: string) => void;
  onProductClick?: (productSlug: string) => void;
  onSearchAll: () => void;
  onClose: () => void;
  isVisible: boolean;
}

interface SuggestionItem {
  text: string;
  type: 'product' | 'category';
  image?: string;
  price?: number;
  slug?: string;
  matchScore: number;
}

export default function SearchSuggestions({
  searchTerm,
  products,
  categories,
  onSuggestionClick,
  onProductClick,
  onSearchAll,
  onClose,
  isVisible
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 means nothing selected
  const [hasUsedArrowKeys, setHasUsedArrowKeys] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate suggestions based on search term
  const suggestions: SuggestionItem[] = [];

  if (searchTerm.length >= 1) {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Add matching categories (limit to 3)
    const categorySuggestions = categories
      .filter(category => 
        category.value !== 'all' &&
        category.name.toLowerCase().includes(searchLower)
      )
      .slice(0, 3)
      .map(category => {
        // Special case: show 'Rings' for finger-rings category in UI
        const displayName =
          category.value === 'finger-rings' || category.name.toLowerCase() === 'finger rings'
            ? 'Rings'
            : category.name;

        const nameLower = displayName.toLowerCase();

        return {
          text: displayName,
          type: 'category' as const,
          slug: category.value,
          matchScore:
            nameLower === searchLower ? 100 :
            nameLower.startsWith(searchLower) ? 80 : 50
        };
      });

    // Add matching products (limit to 5)
    const productSuggestions = products
      .filter(product => {
        const name = product.name.toLowerCase();
        const category = typeof product.category === 'string' 
          ? product.category.toLowerCase()
          : product.category?.name?.toLowerCase() || '';

        // Only treat as a name match if the query matches a whole word
        // e.g. "ring" matches "ring", "rings", "ring set" but NOT "shimmering"
        const nameWords = name.split(/[^a-z0-9]+/);
        const hasNameMatch = nameWords.some(word => 
          word === searchLower || word.startsWith(searchLower)
        );

        const hasCategoryMatch = category.includes(searchLower);

        return hasNameMatch || hasCategoryMatch;
      })
      .slice(0, 5)
      .map(product => {
        const name = product.name.toLowerCase();
        const hasExactName = name === searchLower;
        const hasPrefixName = name.startsWith(searchLower);

        return {
          text: product.name,
          type: 'product' as const,
          image: product.images?.[0]?.url || '/images/product-1.png',
          price: product.price,
          slug: product.slug || product._id,
          matchScore: hasExactName ? 100 : hasPrefixName ? 80 : 60
        };
      });

    // Sort by match score and combine
    suggestions.push(...categorySuggestions.sort((a, b) => b.matchScore - a.matchScore));
    suggestions.push(...productSuggestions.sort((a, b) => b.matchScore - a.matchScore));
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHasUsedArrowKeys(true);
          setSelectedIndex(prev => {
            const maxIndex = suggestions.length; // +1 for "Search All" button
            return prev < maxIndex - 1 ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHasUsedArrowKeys(true);
          setSelectedIndex(prev => {
            const maxIndex = suggestions.length;
            return prev > 0 ? prev - 1 : maxIndex - 1;
          });
          break;
        case 'Enter':
          // Only intercept Enter if user has used arrow keys to select something
          if (hasUsedArrowKeys && selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault();
            const selected = suggestions[selectedIndex];
            if (selected.type === 'product' && selected.slug && onProductClick) {
              onProductClick(selected.slug);
            } else {
              onSuggestionClick(selected.text, selected.type, selected.slug);
            }
          }
          // If no selection, let the form handle Enter naturally
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, hasUsedArrowKeys, onSuggestionClick, onProductClick, onClose]);

  // Reset selection when search term changes
  useEffect(() => {
    setSelectedIndex(-1);
    setHasUsedArrowKeys(false);
  }, [searchTerm]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || searchTerm.length < 1) {
    return null;
  }

  const handleItemClick = (e: React.MouseEvent, item: SuggestionItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.type === 'product' && item.slug && onProductClick) {
      onProductClick(item.slug);
    } else {
      onSuggestionClick(item.text, item.type, item.slug);
    }
  };
  
  const handleSearchAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSearchAll();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="search-suggestions"
      >
        {suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map((item, index) => (
              <motion.div
                key={`${item.type}-${item.text}-${index}`}
                ref={el => { itemRefs.current[index] = el; }}
                className={`suggestion-item ${
                  index === selectedIndex ? 'selected' : ''
                } ${item.type === 'product' ? 'product-item' : ''}`}
                onMouseDown={(e) => handleItemClick(e, item)}
                onMouseEnter={() => {
                  setSelectedIndex(index);
                  setHasUsedArrowKeys(true);
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.15 }}
              >
                {item.type === 'product' ? (
                  <>
                    <div className="product-image">
                      <Image
                        src={item.image || '/images/product-1.png'}
                        alt={item.text}
                        width={44}
                        height={44}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="product-info">
                      <span className="product-name">{highlightMatch(item.text, searchTerm)}</span>
                      {item.price && (
                        <span className="product-price">₹{item.price.toLocaleString()}</span>
                      )}
                    </div>
                    <FiArrowRight className="item-arrow" />
                  </>
                ) : (
                  <>
                    <div className="category-icon">
                      <FiTag />
                    </div>
                    <span className="category-name">{highlightMatch(item.text, searchTerm)}</span>
                    <span className="category-badge">Category</span>
                    <FiArrowRight className="item-arrow" />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <FiSearch className="no-results-icon" />
            <p>No matching products or categories</p>
          </div>
        )}

        {/* Search All Button */}
        <motion.button
          className={`search-all-button ${selectedIndex === suggestions.length ? 'selected' : ''}`}
          onMouseDown={handleSearchAllClick}
          onMouseEnter={() => {
            setSelectedIndex(suggestions.length);
            setHasUsedArrowKeys(true);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FiSearch className="search-all-icon" />
          <span>Search for "<strong>{searchTerm}</strong>"</span>
          <FiArrowRight className="arrow-icon" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="highlight">{part}</mark>
    ) : (
      part
    )
  );
}
