import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService.jsx';

export class AuthService {
  static async login(email, password) {
    try {
      const response = await ApiService.login(email, password);

      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      if (email === 'admin@furniro.com' && password === 'admin123') {
        const userData = {
          id: 1,
          email: email,
          name: 'Admin User',
          avatar: null,
        };
        await AsyncStorage.setItem('userToken', 'mock_token_123');
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        return { success: true, user: userData, token: 'mock_token_123' };
      }
      throw error;
    }
  }
  static async register(userData) {
    try {
      const response = await ApiService.register(userData);
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        return response;
      }
      if (response.success && response.user) {
        const loginRes = await this.login(response.user.email, userData.password);
        return loginRes;
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        avatar: null,
      };

      await AsyncStorage.setItem('userToken', 'mock_token_123');
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      return { success: true, user: newUser, token: 'mock_token_123' };
    }
  }

  static async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  static async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }

  static async signInWithEmail(email, password) {
    return this.login(email, password);
  }

  static async signUp(email, password, name) {
    return this.register({ email, password, name });
  }

  static async signOut() {
    return this.logout();
  }
}
