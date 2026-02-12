import { 
  loadCategoriesData,
  loadFeaturesData, 
  loadStylesData, 
  loadProductsData, 
  loadTrendingData, 
  loadTestimonialsData,
  loadCollectionsCategoriesData,
  loadCollectionsProductsData
} from '../utils/dataLoader';
import { API_HELPERS } from '../config/api';

class DataService {
  constructor() {
    // API integration - carousel and categories from backend only, others with local fallback
  }

  // Data endpoints - Carousel only from backend API
  async getCarousel() {
    try {
      const apiResponse = await API_HELPERS.getActiveBanners();
      if (apiResponse.success && apiResponse.data) {
        return { success: true, data: apiResponse.data };
      } else {
        return { 
          success: false, 
          error: 'No carousel data available from API',
          field: 'carousel',
          message: 'Carousel data loading failed'
        };
      }
    } catch (apiError) {
      console.error('Failed to load carousel data from API:', apiError);
      return { 
        success: false, 
        error: 'Failed to load carousel data from API',
        field: 'carousel',
        message: 'Carousel data loading failed'
      };
    }
  }

  // Data endpoints - Categories only from backend API
  async getCategories() {
    try {
      const categories = await loadCategoriesData();
      if (Array.isArray(categories)) {
        return { success: true, data: categories };
      }
      return { 
        success: false, 
        error: 'No categories data available',
        field: 'categories',
        message: 'Categories data loading failed'
      };
    } catch (apiError) {
      console.error('Failed to load categories data:', apiError);
      return { 
        success: false, 
        error: 'Failed to load categories data from API and local fallback',
        field: 'categories',
        message: 'Categories data loading failed'
      };
    }
  }

  async getCollectionsCategories() {
    try {
      const localData = await loadCollectionsCategoriesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load collections categories data:', error);
      return { success: false, error: 'Failed to load collections categories data from local files' };
    }
  }

  async getCollectionsOccasions() {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/occasions?sortBy=sortOrder&sortOrder=asc`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { success: true, data: data.data || [] };
        } else {
          return { success: false, error: data.message || 'Failed to load occasions' };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Failed to load collections occasions data:', error);
      return { success: false, error: error.message || 'Failed to load collections occasions data' };
    }
  }

  async getCollectionsProducts() {
    try {
      const localData = await loadCollectionsProductsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load collections products data:', error);
      return { success: false, error: 'Failed to load collections products data from local files' };
    }
  }

  async getFeatures() {
    try {
      const localData = await loadFeaturesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load features data:', error);
      return { success: false, error: 'Failed to load features data from local files' };
    }
  }

  async getProducts() {
    try {
      // Try API first
      const apiResponse = await API_HELPERS.getProducts();
      if (apiResponse.success && apiResponse.data) {
        return { success: true, data: apiResponse.data };
      }
    } catch (apiError) {
      console.warn('API call failed, falling back to local data:', apiError);
    }
    
    // Fallback to local data
    try {
      const localData = await loadProductsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load products data:', error);
      return { success: false, error: 'Failed to load products data from both API and local files' };
    }
  }

  async getFeaturedProducts(limit = 20) {
    try {
      // Try API first
      const apiResponse = await API_HELPERS.getFeaturedProducts(limit);
      if (apiResponse.success && apiResponse.data) {
        // Filter to ensure only featured products are returned
        const featuredProducts = apiResponse.data.filter((product) => product.isFeatured === true);
        return { success: true, data: featuredProducts };
      }
    } catch (apiError) {
      console.warn('API call failed, falling back to local data:', apiError);
    }
    
    // Fallback to local data - filter featured products
    try {
      const localData = await loadProductsData();
      const featuredProducts = Array.isArray(localData) 
        ? localData.filter((product) => product.isFeatured === true).slice(0, limit)
        : [];
      return { success: true, data: featuredProducts };
    } catch (error) {
      console.error('Failed to load featured products data:', error);
      return { success: false, error: 'Failed to load featured products data from both API and local files' };
    }
  }

  async getStyles() {
    try {
      const localData = await loadStylesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load styles data:', error);
      return { success: false, error: 'Failed to load styles data from local files' };
    }
  }

  async getTestimonials() {
    try {
      const localData = await loadTestimonialsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load testimonials data:', error);
      return { success: false, error: 'Failed to load testimonials data from local files' };
    }
  }

  async getTrending() {
    try {
      const localData = await loadTrendingData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load trending data:', error);
      return { success: false, error: 'Failed to load trending data from local files' };
    }
  }

  // Get all data at once - optimized for parallel loading
  async getAllData() {
    try {
      // Skip carousel - it's loaded separately in page.tsx to avoid duplicate requests
      const carousel = { success: false, data: null };
      
      // Skip collections - loaded separately in page.tsx
      const collectionsCategories = { success: false, data: null };
      const collectionsOccasions = { success: false, data: null };
      
      // Load all data in parallel for maximum speed
      // Group API calls and local file loads together
      const [
        categories,
        collectionsProducts,
        features,
        styles,
        testimonials,
        trending,
        products
      ] = await Promise.all([
        this.getCategories(),
        this.getCollectionsProducts(),
        this.getFeatures(),
        this.getStyles(),
        this.getTestimonials(),
        this.getTrending(),
        this.getProducts()
      ]);

      return {
        success: true,
        data: {
          carousel: carousel.success ? carousel.data : null,
          categories: categories.success ? categories.data : null,
          collectionsCategories: collectionsCategories.success ? collectionsCategories.data : null,
          collectionsOccasions: collectionsOccasions.success ? collectionsOccasions.data : null,
          collectionsProducts: collectionsProducts.success ? collectionsProducts.data : null,
          features: features.success ? features.data : null,
          products: products.success ? products.data : null,
          styles: styles.success ? styles.data : null,
          testimonials: testimonials.success ? testimonials.data : null,
          trending: trending.success ? trending.data : null
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch all data:', error);
      }
      return { success: false, error: error.message };
    }
  }

  // Note: Authentication methods removed as we're using local data only
  // If authentication is needed in the future, implement local storage or other client-side solutions
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
