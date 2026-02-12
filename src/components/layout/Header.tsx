'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiGift, FiSettings, FiLogOut } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import UserDropdown from '@/components/auth/UserDropdown';
import SearchSuggestions from '@/components/ui/SearchSuggestions';
import { loadCollectionsProductsData, loadCollectionsCategoriesData } from '@/utils/dataLoader';
import { Product, CollectionCategory } from '@/types/data';
import '@/styles/components/layout/Header.css';

const navigation = [
  { 
    name: 'HOME', 
    href: '/',
    hasDropdown: false
  },
  { 
    name: 'COLLECTIONS', 
    href: '/collections',
    hasDropdown: false
  },
  { 
    name: 'GIFT', 
    href: '/gift',
    isIcon: true,
    hasDropdown: false
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasLoadedSuggestions, setHasLoadedSuggestions] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { setSearchQuery } = useSearch();
  const { totalQuantity } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      // Always show header at the top of the page
      if (currentScrollY < 10) {
        setIsScrolled(false);
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      // Track scroll state for styling
      setIsScrolled(true);
      
      // Hide header when scrolling down, show when scrolling up
      // Only hide if scrolled more than 100px down
      if (currentScrollY > 100) {
        if (scrollDifference > 5) {
          // Scrolling down - hide header
          setIsVisible(false);
        } else if (scrollDifference < -5) {
          // Scrolling up - show header
          setIsVisible(true);
        }
      } else {
        // Near top - always show
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load data for suggestions once on first search interaction
  useEffect(() => {
    if (!(searchInput.length >= 1 || showSuggestions)) return;
    if (hasLoadedSuggestions || isLoadingSuggestions) return;

    const loadSuggestionsData = async () => {
      try {
        setIsLoadingSuggestions(true);
        const [productsData, categoriesData] = await Promise.all([
          loadCollectionsProductsData(),
          loadCollectionsCategoriesData()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setHasLoadedSuggestions(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading suggestions data:', error);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestionsData();
  }, [searchInput, showSuggestions, hasLoadedSuggestions, isLoadingSuggestions]);

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      router.push(`/collections?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(value.length >= 1);
  };

  const handleSuggestionClick = (
    suggestion: string,
    type?: 'product' | 'category',
    slug?: string
  ) => {
    setSearchInput('');
    setShowSuggestions(false);
    
    if (type === 'category') {
      // Navigate to category page
      // Prefer explicit slug from suggestions, then fall back to lookup by name
      const matchedCategory = categories.find(c => 
        c.value === slug ||
        c.name === suggestion ||
        c.value === suggestion.toLowerCase()
      );

      const categorySlug = slug || matchedCategory?.value || suggestion.toLowerCase();
      router.push(`/collections?category=${encodeURIComponent(categorySlug)}`);
    } else {
      // Search for the suggestion text
      setSearchQuery(suggestion);
      router.push(`/collections?search=${encodeURIComponent(suggestion)}`);
    }
  };

  const handleProductClick = (productSlug: string) => {
    setSearchInput('');
    setShowSuggestions(false);
    router.push(`/product/${productSlug}`);
  };

  const handleSearchAll = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      router.push(`/collections?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchInput.length >= 1) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };


  return (
      <header 
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-[#470031] shadow-lg py-2 sm:py-3 border-[#470031]' 
            : 'bg-[#470031] py-3 sm:py-4 border-[#470031]'
        } ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          backgroundColor: '#470031',
          top: 'var(--top-banner-height, 0px)',
          margin: 0,
          marginTop: 0,
          marginBottom: 0
        }}
      >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Layout - Logo first, then search input, then search icon */}
          <form onSubmit={handleSearch} className="lg:hidden flex items-center flex-1 gap-3 sm:gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full flex items-center"
                >
                  <Image
                    src="/images/fefa_logo_transparent_4k.png"
                    alt="FEFA Logo"
                    width={200}
                    height={100}
                    className="h-full max-h-12 sm:max-h-16 md:max-h-20 w-auto object-contain"
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* Search input with gold underline - functional search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={handleSearchInputChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full bg-transparent text-[#DBC078] placeholder-[#dcc996] text-sm sm:text-base focus:outline-none border-b border-[#DBC078] focus:border-[#cfb570] pb-1 sm:pb-1.5"
                suppressHydrationWarning
              />
              <SearchSuggestions
                searchTerm={searchInput}
                products={products}
                categories={categories}
                onSuggestionClick={handleSuggestionClick}
                onProductClick={handleProductClick}
                onSearchAll={handleSearchAll}
                onClose={() => setShowSuggestions(false)}
                isVisible={showSuggestions && !isLoadingSuggestions}
              />
            </div>

            {/* Mobile search icon - submit search */}
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="p-2 text-[#DBC078] focus:outline-none hover:text-[#cfb570] transition-colors"
                aria-label="Search products"
                suppressHydrationWarning
              >
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </form>

          {/* Desktop Logo - unchanged */}
          <div className="hidden lg:flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center h-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-full flex items-center"
              >
                <Image
                  src="/images/fefa_logo_transparent_4k.png"
                  alt="FEFA Logo"
                  width={200}
                  height={100}
                  className="h-full max-h-24 w-auto object-contain"
                  priority
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation and Search */}
          <div className="hidden lg:flex items-center flex-1 justify-end gap-6 xl:gap-8">
            {/* Navigation Links */}
            <nav className="flex items-center gap-6 xl:gap-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="text-xs xl:text-sm font-medium uppercase tracking-wide transition-colors hover:text-[#cfb570] text-[#DBC078]"
                    aria-label={item.isIcon ? 'Gift collections' : item.name}
                    onMouseEnter={() => item.hasDropdown && handleDropdownToggle(item.name)}
                  >
                    {item.isIcon ? (
                      <motion.div
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                        whileTap={{ 
                          scale: 0.95,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.2 }
                        }}
                        className="p-2"
                      >
                         <FiGift className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#DBC078]" />
                      </motion.div>
                    ) : (
                      item.name
                    )}
                  </Link>
                  
                  {/* Mega Dropdown Menu */}
                  {item.hasDropdown && openDropdown === item.name && 'dropdown' in item && (item as any).dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`fixed left-0 right-0 bg-[#F8E4EB] shadow-lg py-3 sm:py-5 z-50 transition-transform duration-300 ${
                        isVisible ? 'translate-y-0' : '-translate-y-full'
                      }`}
                      style={{ 
                        top: `calc(var(--top-banner-height, 0px) + ${isScrolled ? '60px' : '70px'})`
                      }}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="container mx-auto px-4">
                        <div className={`${item.name === 'GIFT' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-3 sm:gap-4 lg:gap-5`}>
                          {(item as any).dropdown.categories.map((category: any, index: number) => (
                            <div key={index} className="space-y-4">
                              <h3 className="text-[#4B006E] text-lg sm:text-xl font-cormorant mb-1 sm:mb-2 border-b border-[#4B006E] pb-1 sm:pb-2">
                                {category.title}
                              </h3>
                              {category.items.length > 0 ? (
                                <ul className="space-y-3">
                                  {category.items.map((subItem: any, subIndex: number) => (
                                    <li key={subIndex}>
                        <Link
                                        href={subItem.href}
                                        className="text-[#4B006E] hover:text-[#D4AF37] transition-colors block py-1 text-xs sm:text-sm font-medium hover:font-semibold"
                                      >
                                        {subItem.name}
                        </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-[#4B006E] text-xs sm:text-sm font-medium py-2">
                                  Coming Soon
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Search and Right icons */}
            <div className="flex items-center gap-4 xl:gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <form onSubmit={handleSearch} className="relative w-40 xl:w-52">
                 <FiSearch className="w-3 h-3 sm:w-4 sm:h-4 text-[#DBC078] absolute left-3 top-1/2 transform -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search"
                   value={searchInput}
                   onChange={handleSearchInputChange}
                   onFocus={handleSearchFocus}
                   onBlur={handleSearchBlur}
                   className="pl-10 pr-4 py-2 text-sm border-b border-[#DBC078] focus:outline-none focus:border-[#cfb570] bg-transparent text-[#DBC078] placeholder-[#dcc996] w-full"
                   suppressHydrationWarning
                 />
              </form>
              
            <SearchSuggestions
              searchTerm={searchInput}
              products={products}
              categories={categories}
              onSuggestionClick={handleSuggestionClick}
              onProductClick={handleProductClick}
              onSearchAll={handleSearchAll}
              onClose={() => setShowSuggestions(false)}
              isVisible={showSuggestions && !isLoadingSuggestions}
            />
          </div>
          
          {/* User Icons */}
          <div className="flex items-center gap-3 xl:gap-4">
             <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-[#DBC078] hover:text-[#cfb570] transition-colors relative">
               <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
               {wishlistCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#cfb570] text-[#470031] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                   {wishlistCount > 99 ? '99+' : wishlistCount}
                 </span>
               )}
             </Link>
             <Link href="/cart" aria-label="Cart" className="p-2 text-[#DBC078] hover:text-[#cfb570] transition-colors relative">
               <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
               {totalQuantity > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#cfb570] text-[#470031] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                   {totalQuantity > 99 ? '99+' : totalQuantity}
                 </span>
               )}
             </Link>
            </div>
            
            {/* Auth Section */}
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/auth/login" 
                    className="px-4 py-2 text-sm font-medium text-[#DBC078] hover:text-[#cfb570] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
