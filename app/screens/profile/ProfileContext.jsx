import React, { createContext, useContext, useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  // FIX: استدعاء جميع الـ Hooks في المستوى الأعلى
  const navigation = useNavigation();
  const appContext = useAppContext();
  const { theme, logout, favorites, products, getImageUrl, toggleFavorite, orders, cancelOrder, loadingCancel, updateUser } = appContext;
  const { user } = useAuth();
  const { notifications, formatDate } = useSocket();

  // Local State
  const [activeTab, setActiveTab] = useState("favorites");
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationLoading, setLocationLoading] = useState(false);

  // Derived State
  const favoriteProducts = useMemo(() => products.filter((p) => favorites.includes(p.id)), [products, favorites]);

  // --- Functions (تم نقلها من ProfileScreen) ---

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "info", text1: "Permission required" });
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) await uploadImage(result.assets[0]);
  };

  const uploadImage = async (image) => {
    if (!image) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", { uri: image.uri, name: image.fileName || `avatar.jpg`, type: "image/jpeg" });
    try {
      const res = await fetch(`https://furniro-back-production.up.railway.app/api/upload/${user?.id}/update-image`, { method: "PATCH", headers: { Authorization: `Bearer ${user?.token}` }, body: formData } );
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, image: data.imageUrl };
        updateUser(updated)
        Toast.show({ type: "success", text1: "Image Updated" });
      } else Toast.show({ type: "error", text1: data.message || "Upload Failed" });
    } catch (err) { Toast.show({ type: "error", text1: "Check Your Connection" }); }
    finally { setIsUploading(false); }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { headers: { "User-Agent": "furniro-app/1.0" } }
       );
      const data = await res.json();
      return data?.display_name || "Unknown location";
    } catch {
      return "Could not fetch address";
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Toast.show({ type: "info", text1: "Location permission denied" });

      setLocationLoading(true);
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const address = await getAddressFromCoords(coords.latitude, coords.longitude);

      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`https://furniro-back-production.up.railway.app/api/auth/users/${user.id}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ location: address } ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to update location");
      updateUser({ ...user, location: address });
      Toast.show({ type: "success", text1: "Location updated", text2: address });
    } catch (e) {
      Toast.show({ type: "error", text1: "Update failed", text2: e.message, position: "top" });
    } finally {
      setLocationLoading(false);
    }
  };

  const updatePhone = async (userId, newPhone) => {
    const res = await fetch(`https://furniro-back-production.up.railway.app/api/auth/users/${userId}/phone`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: newPhone } ) });
    const data = await res.json();
    if (res.ok) {
      const updatedUser = { ...user, phoneNumber: data.phoneNumber };
      updateUser(updatedUser);
      return true; // Return success
    } else { 
      Toast.show({ type: "error", text1: data?.msg || "Failed to update phone" });
      return false; // Return failure
    }
  };

  const contextValue = useMemo(() => ({
    // حالات ودوال عامة (من السياقات الأخرى)
    theme,
    user,
    isDarkMode: appContext.isDarkMode, // FIX: تم تمرير القيمة من appContext
    toggleTheme: appContext.toggleTheme, // FIX: تم تمرير الدالة من appContext
    getImageUrl,
    favoriteProducts,
    orders,
    loadingCancel,
    notifications,
    formatDate,
    toggleFavorite,
    cancelOrder,

    // حالات ودوال شاشة البروفايل
    activeTab,
    setActiveTab,
    isUploading,
    isLocationLoading,
    
    // الدوال المعقدة
    pickImage,
    handleLogout,
    getCurrentLocation,
    updatePhone,
  }), [
    // FIX: تحديث مصفوفة التبعيات
    theme, user, appContext.isDarkMode, appContext.toggleTheme, getImageUrl, favoriteProducts, orders, loadingCancel, notifications, formatDate, toggleFavorite, cancelOrder,
    activeTab, isUploading, isLocationLoading,
    pickImage, handleLogout, getCurrentLocation, updatePhone,
  ]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};
