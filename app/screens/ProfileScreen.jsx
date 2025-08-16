import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Animated, Dimensions, Modal, RefreshControl, PermissionsAndroid, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Geolocation from "react-native-geolocation-service";
const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const navigation = useNavigation(), { theme, user, isAuthenticated, logout, isDarkMode, toggleTheme, cart, favorites, updateUser, products, getImageUrl, toggleFavorite, refreshUser, orders } = useAppContext(),
    [isUploading, setIsUploading] = useState(false), [sidebarVisible, setSidebarVisible] = useState(false), [sidebarContent, setSidebarContent] = useState(null),
    [notifications, setNotifications] = useState([]), slideAnim = useRef(new Animated.Value(width)).current, favoriteProducts = products.filter((p) => favorites.includes(p.id)), [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => { setRefreshing(true); const success = await refreshUser(); setRefreshing(false); if (!success) Toast.show({ type: "error", text1: "Failed to refresh user data" }); };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Toast.show({ type: "success", text1: "Permission required", text2: "Access your gallery" });
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets?.length > 0) await uploadImage(result.assets[0]);
  };
  const uploadImage = async (image) => {
    if (!image) return; setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", { uri: image.uri, name: image.fileName || `avatar_${Date.now()}.jpg`, type: image.type?.includes("/") ? image.type : "image/jpeg" });
    try {
      const res = await fetch(`https://furniro-back-2-production.up.railway.app/api/upload/${user?.id}/update-image`, {
        method: "PATCH", headers: { Authorization: `Bearer ${user?.token}` }, body: formData,
      }), data = await res.json();
      if (data.success && data.imageUrl) {
        const updated = { ...user, image: data.imageUrl }; updateUser(updated); await AsyncStorage.setItem("user", JSON.stringify(updated));
        Toast.show({ type: "success", text1: "Image Updated" });
      } else Toast.show({ type: "success", text1: data.message || "Upload Failed" });
    } catch (err) {
      console.error("Upload error:", err); Toast.show({ type: "error", text1: "Check Your Connection" });
    } finally { setIsUploading(false); }
  };
  const fetchNotifications = async () => {
      const token = await  AsyncStorage.getItem("token");
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!token || !user?.id) return;
      const res = await fetch("https://furniro-back-production.up.railway.app/api/notifications", {headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }});
      if (res.ok) {
        const data = await res.json();
        const userNotifications = (data.notifications || []).filter(n => n.userId === user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      }
  };
  useEffect(()=>{
    fetchNotifications()
  },[])
  const handleLogout = async () => { await AsyncStorage.removeItem("user"); logout(); navigation.reset({ index: 0, routes: [{ name: "Login" }] }); };
  const openSidebar = (content) => { setSidebarContent(content); setSidebarVisible(true); Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(); };
  const closeSidebar = () => { Animated.timing(slideAnim, { toValue: width, duration: 300, useNativeDriver: true }).start(() => { setSidebarVisible(false); setSidebarContent(null); }); };
  const renderEmptyContent = (icon, title, subtitle) => (
    <View style={tw`flex-1 justify-center items-center py-20`}>
      <Icon name={icon} size={60} color={theme.darkGray} />
      <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>{title}</Text>
      <Text style={[tw`text-sm mt-2 text-center`, { color: theme.darkGray }]}>{subtitle}</Text>
    </View>
  );
  const renderFavoritesContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>My Favorites</Text>
        <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
      </View>
      <ScrollView>
        {favoriteProducts.length > 0 ? favoriteProducts.map((item, i) => (
          <View key={i} style={[tw`flex-row p-4 mb-3 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
            <Image source={{ uri: getImageUrl(item.image) }} style={tw`w-15 h-15 rounded-lg`} />
            <View style={tw`ml-3 flex-1`}>
              <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.name}</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>${item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}><Icon name={favorites.includes(item.id) ? "favorite" : "favorite-border"} size={24} color={favorites.includes(item.id) ? theme.red : theme.darkGray} /></TouchableOpacity>
          </View>
        )) : renderEmptyContent("favorite-border", "No Favorites", "Add items to favorites")}
      </ScrollView>
    </View>
  );
  const renderNotificationsContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>Notifications</Text>
        <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={tw`pb-4`}>
        {notifications.length > 0 ? notifications.map(n => (
          <View key={n.id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between`, { backgroundColor: n.read ? theme.semiWhite : theme.lightBeige }]}>
            <View style={tw`flex-1 pr-2`}>
              <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{n.message}</Text>
              <Text style={[tw`text-sm mt-1`, { color: theme.darkGray }]}>{new Date(n.date).toLocaleString()}</Text>
            </View>
            <Icon name={n.read ? "notifications-none" : "notifications"} size={24} color={theme.primary} />
          </View>
        )) : renderEmptyContent("notifications-none","No Notifications","You have no notifications yet")}
      </ScrollView>
    </View>
  );
  const renderGenericContent = (title, icon) => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>{title}</Text>
        <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
      </View>
      {renderEmptyContent(icon, "Coming Soon", "This feature will be available soon")}
    </View>
  );
  const renderHistoryContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>Orders History</Text>
        <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
      </View>
      <ScrollView>
        {orders.map((order) => (
          <View key={order._id} style={tw`p-4 mb-3 rounded-lg bg-gray-100`}>
            <Text style={tw`text-base font-bold`}>Order ID: {order._id}</Text>
            <Text style={tw`text-sm`}>Date: {new Date(order.date).toLocaleDateString()}</Text>
            <Text style={tw`text-sm`}>Total: ${order.total}</Text>
            <View style={tw`mt-2`}>
              {order.products.map((product) => (
                <Text key={product._id} style={tw`text-sm text-gray-700`}>{product.name} × {product.quantity} = ${product.price * product.quantity}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        title: "Location Permission", message: "App needs access to your location", buttonNeutral: "Ask Me Later", buttonNegative: "Cancel", buttonPositive: "OK"
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  const getCurrentLocation = async () => {
    if (!await requestLocationPermission()) return;
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords, token = await AsyncStorage.getItem("token"), address = await getAddressFromCoords(latitude, longitude),
          response = await fetch(`https://furniro-back-production.up.railway.app/api/auth/users/${user.id}/location`, {
            method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ location: { lat: latitude, lng: longitude, address } })
          }), text = await response.text(), data = JSON.parse(text);
        if (!response.ok) throw new Error(data?.msg || "Failed to update location");
        const updatedUser = { ...user, location: { lat: latitude, lng: longitude, address } }; updateUser(updatedUser); await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        Toast.show({ type: "success", text1: "Location updated", text2: address });
      },
      (error) => { console.error(error); Toast.show({ type: "error", text1: "Location error", text2: error.message }); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  const renderLocationContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>My Location</Text>
        <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
      </View>
      {user?.location ? (
        <View style={[tw`p-4`, { color: theme.black }]}>
          <Icon name="location-on" size={60} color={theme.primary} />
          <Text style={[tw`text-base font-bold mb-2`, { color: theme.black }]}>Current Location</Text>
          {user.location.address ? <Text style={[tw`text-sm`, { color: theme.black }]}>{user.location.address}</Text> : (
            <>
              <Text style={[tw`text-sm`, { color: theme.black }]}>Latitude: {user.location.lat}</Text>
              <Text style={[tw`text-sm`, { color: theme.black }]}>Longitude: {user.location.lng}</Text>
            </>
          )}
        </View>
      ) : (
        <View style={tw`items-center`}>
          <Icon name="location-on" size={60} color={theme.primary} />
          <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>No Location Found</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={[tw`mt-6 py-3 px-6 rounded-lg`, { backgroundColor: theme.primary }]}>
            <Text style={[tw`text-white font-semibold`]}>Set My Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  const getAddressFromCoords = async (lat, lng) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json(); return data?.display_name || "Unknown location";
  };
  const menuItems = [
    { icon: "favorite", title: "Favorites", subtitle: `${favorites.length} items`, onPress: () => openSidebar(renderFavoritesContent()) },
    { icon: "history", title: "Order History", subtitle: "Your previous orders", onPress: () => openSidebar(renderHistoryContent()) },
    { icon: "location-on", title: "Addresses", subtitle: "Manage delivery", onPress: () => openSidebar(renderGenericContent("Addresses", "location-on")) },
    { icon: "payment", title: "Payment", subtitle: "Manage cards", onPress: () => openSidebar(renderGenericContent("Payment Methods", "payment")) },
    { icon: "notifications", title: "Notifications", subtitle: "Notification settings", onPress: () => openSidebar(renderNotificationsContent()) },
    { icon: "help", title: "Help & Support", subtitle: "FAQs", onPress: () => openSidebar(renderGenericContent("Help & Support", "help")) },
    { icon: "info", title: "About App", subtitle: "App info", onPress: () => Toast.show({ type: "success", text1: "Modern Furniture App" }) },
    { icon: "location-on", title: "My Location", subtitle: user?.location ? "Location saved" : "No location yet", onPress: () => openSidebar(renderLocationContent()) },
  ];
  if (!isAuthenticated) return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Profile" />
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <Icon name="person" size={80} color={theme.darkGray} />
        <Text style={[tw`text-xl font-bold mt-4`, { color: theme.black }]}>Welcome</Text>
        <Text style={[tw`text-base mt-2 text-center`, { color: theme.darkGray }]}>Sign in to access profile</Text>
        <TouchableOpacity style={[tw`py-4 px-8 mt-6 rounded-lg`, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate("Login")}><Text style={[tw`text-lg font-semibold`, { color: theme.white }]}>Sign In</Text></TouchableOpacity>
        <TouchableOpacity style={[tw`py-3 px-8 mt-3 border rounded-lg`, { borderColor: theme.primary }]} onPress={() => navigation.navigate("Register")}><Text style={[tw`text-base font-semibold`, { color: theme.primary }]}>Create Account</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Profile" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={[tw`p-6 items-center`, { backgroundColor: theme.lightBeige }]}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading}>
            <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-4`, { backgroundColor: theme.primary }]}>
              {user?.image ? <Image source={{ uri: user.image }} style={tw`w-24 h-24 rounded-full`} /> : <Icon name="person" size={40} color={theme.white} />}
              {isUploading && <View style={[tw`absolute inset-0 items-center justify-center`, { backgroundColor: "rgba(0,0,0,0.5)" }]}><Icon name="cloud-upload" size={24} color={theme.white} /></View>}
              <View style={[tw`absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center`, { backgroundColor: theme.primary }]}><Icon name="camera-alt" size={12} color={theme.white} /></View>
            </View>
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold mb-1`, { color: theme.black }]}>{user?.name}</Text>
          <Text style={[tw`text-base`, { color: theme.darkGray }]}>{user?.email}</Text>
          <View style={tw`flex-row mt-4`}>
            {[{ label: "In Cart", value: cart.length }, { label: "Favorites", value: favorites.length }].map((item, i) => (
              <View key={i} style={tw`items-center mx-4`}>
                <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>{item.value}</Text>
                <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[tw`flex-row justify-between p-4 mx-4 mt-4 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
          <View style={tw`flex-row items-center`}>
            <Icon name={isDarkMode ? "dark-mode" : "light-mode"} size={24} color={theme.primary} />
            <View style={tw`ml-3`}>
              <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>Dark Mode</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{isDarkMode ? "Enabled" : "Disabled"}</Text>
            </View>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: theme.lightGray, true: theme.primary }} thumbColor={theme.white} />
        </View>
        <View style={tw`px-4 mt-4`}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} style={[tw`flex-row items-center p-4 mb-2 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
              <Icon name={item.icon} size={24} color={theme.primary} />
              <View style={tw`flex-1 ml-3`}>
                <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.title}</Text>
                <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.darkGray} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={[tw`flex-row items-center justify-center p-4 mx-4 mt-6 mb-8 rounded-lg`, { backgroundColor: theme.red }]}>
          <Icon name="logout" size={20} color={theme.white} />
          <Text style={[tw`ml-2 text-base font-semibold`, { color: theme.white }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar}>
        <View style={[tw`flex-1 flex-row`, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <TouchableOpacity style={tw`flex-1`} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[tw`w-4/5 h-full`, { backgroundColor: theme.white, transform: [{ translateX: slideAnim }], elevation: 5 }]}>{sidebarContent}</Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;