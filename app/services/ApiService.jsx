import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:3001";

export class ApiService {
  static async getAuthHeaders() {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  static async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/db`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  static async getProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/db/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  static async searchProducts(query) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/db/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  static async getProductsByCategory(category) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/db/category/${encodeURIComponent(category)}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.msg || "Login failed" };
      }

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: "Network error" };
    }
  }

  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.msg || "Registration failed" };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Error registering:", error);
      return { success: false, message: "Network error" };
    }
  }

  static async getRatings(productId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/ratings/${productId}`, {
        headers,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching ratings:", error);
      throw error;
    }
  }

  static async addRating(productId, rating, comment, userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userid: userId,
          productid: productId,
          rate: rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error adding rating:", error);
      throw error;
    }
  }

  static getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }
}
