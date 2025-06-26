import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService.jsx';

export class DataService {
  static async getProducts() {
    try {
      // Get from API
      const products = await ApiService.getProducts();
      // Cache the products for offline use
      await AsyncStorage.setItem('products', JSON.stringify(products));
      return products;
    } catch (apiError) {
      console.warn('API call failed, trying cached data:', apiError);
      
      // If API fails, try to get from local storage (offline mode)
      const cachedProducts = await AsyncStorage.getItem('products');
      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }
      
      // Return empty array if everything fails
      console.error('No cached data available');
      return [];
    }
  }

  static async getProductById(id) {
    try {
      // Try API first
      return await ApiService.getProductById(id);
    } catch (apiError) {
      console.warn('API call failed, using cached data:', apiError);
      const cachedProducts = await AsyncStorage.getItem('products');
      if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        return products.find(product => product.id === id);
      }
      return null;
    }
  }

  static async searchProducts(query) {
    try {
      // Try API first
      return await ApiService.searchProducts(query);
    } catch (apiError) {
      console.warn('API call failed, using cached search:', apiError);
      const cachedProducts = await AsyncStorage.getItem('products');
      if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        return products.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.des.toLowerCase().includes(query.toLowerCase())
        );
      }
      return [];
    }
  }

  static async getProductsByCategory(category) {
    try {
      // Try API first
      return await ApiService.getProductsByCategory(category);
    } catch (apiError) {
      console.warn('API call failed, using cached data:', apiError);
      const cachedProducts = await AsyncStorage.getItem('products');
      if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        // Filter by category
        return products.filter(product => 
          product.des.toLowerCase().includes(category.toLowerCase())
        );
      }
      return [];
    }
  }

  // Helper method to get the correct image URL
  static getImageUrl(imagePath) {
    return ApiService.getImageUrl(imagePath);
  }
}

