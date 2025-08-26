import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Animated, Dimensions, Modal, RefreshControl, PermissionsAndroid, Platform, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Geolocation from "react-native-geolocation-service";
import { useSocket } from "../context/SocketContext";

const ProfileScreen = () => {
const { width } = Dimensions.get("window");
  const navigation = useNavigation();
  const { theme, user, isAuthenticated, logout, isDarkMode, toggleTheme, cart, favorites, updateUser, products, getImageUrl, toggleFavorite, refreshUser, orders } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarContentKey, setSidebarContentKey] = useState(null); 
  const [isLocationLoading, setLocationLoading] = useState(false);
  const {notifications} = useSocket();
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };
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
        updateUser(updated);
        await AsyncStorage.setItem("user", JSON.stringify(updated));
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
  const openSidebar = (key) => { 
    setSidebarContentKey(key);
    setSidebarVisible(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };
  const closeSidebar = () => {
    Animated.timing(slideAnim, { toValue: width, duration: 300, useNativeDriver: true }).start(() => {
      setSidebarVisible(false);
      setSidebarContentKey(null);
    });
  };
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json` );
      const data = await response.json();
      return data?.display_name || "Unknown location";
    } catch (error) { return "Could not fetch address"; }
  };
  const getCurrentLocation = async () => {
    const perm = Platform.OS === 'android' ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) : 'granted';
    if (perm !== PermissionsAndroid.RESULTS.GRANTED && Platform.OS === 'android') return Toast.show({ type: 'info', text1: 'Location permission denied' });
    
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoords(latitude, longitude);
        const token = await AsyncStorage.getItem("token");
        try {
          const response = await fetch(`https://furniro-back-production.up.railway.app/api/auth/users/${user.id}/location`, {
            method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ location: { lat: latitude, lng: longitude, address } } )
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data?.msg || "Failed to update location");
          const updatedUser = { ...user, location: { lat: latitude, lng: longitude, address } };
          updateUser(updatedUser);
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          Toast.show({ type: "success", text1: "Location updated", text2: address });
        } catch (error) { Toast.show({ type: "error", text1: "Update failed", text2: error.message }); }
        finally { setLocationLoading(false); }
      },
      (error) => {
        Toast.show({ type: "error", text1: "Location error", text2: error.message });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  const renderSidebarContent = () => { 
    switch (sidebarContentKey) {
      case 'favorites': return <SidebarFavoritesContent />;
      case 'history': return <SidebarHistoryContent />;
      case 'location': return <SidebarLocationContent />;
      case 'notifications': return <SidebarNotificationsContent />;
      case 'addresses': return <SidebarGenericContent title="Addresses" icon="location-on" />;
      case 'payment': return <SidebarGenericContent title="Payment Methods" icon="payment" />;
      case 'help': return <SidebarGenericContent title="Help & Support" icon="help" />;
      default: return null;
    }
  };
  const SidebarHeader = ({ title }) => (
    <View style={tw`flex-row justify-between items-center mb-6`}>
      <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>{title}</Text>
      <TouchableOpacity onPress={closeSidebar}><Icon name="close" size={24} color={theme.darkGray} /></TouchableOpacity>
    </View>
  );
  const EmptyContent = ({ icon, title, subtitle }) => (
    <View style={tw`flex-1 justify-center items-center py-20`}>
      <Icon name={icon} size={60} color={theme.darkGray} />
      <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>{title}</Text>
      <Text style={[tw`text-sm mt-2 text-center`, { color: theme.darkGray }]}>{subtitle}</Text>
    </View>
  );
  const SidebarFavoritesContent = () => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title="My Favorites" />
      <ScrollView>
        {favoriteProducts.length > 0 ? favoriteProducts.map((item) => (
          <View key={item.id} style={[tw`flex-row p-4 mb-3 rounded-lg items-center`, { backgroundColor: theme.semiWhite }]}>
            <Image source={{ uri: getImageUrl(item.image) }} style={tw`w-15 h-15 rounded-lg`} />
            <View style={tw`ml-3 flex-1`}>
              <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.name}</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>${item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Icon name={favorites.includes(item.id) ? "favorite" : "favorite-border"} size={24} color={theme.red} />
            </TouchableOpacity>
          </View>
        )) : <EmptyContent icon="favorite-border" title="No Favorites" subtitle="Add items to your favorites" />}
      </ScrollView>
    </View>
  );
  const SidebarLocationContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>My Location</Text>
        <TouchableOpacity onPress={closeSidebar}> <Icon name="close" size={24} color={theme.darkGray} /> </TouchableOpacity>
      </View>
      {isLocationLoading && !user?.location?.address ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[tw`mt-4`, { color: theme.darkGray }]}>Updating Location...</Text>
        </View>
      ) : user?.location?.address ? (
        <View style={tw`items-center justify-center flex-1`}>
          <Icon name="location-on" size={60} color={theme.primary} />
          <Text style={[ tw`text-lg font-bold mt-4 mb-2 text-center`, { color: theme.black } ]}> Current Location Saved </Text>
          <Text style={[ tw`text-base text-center px-4`, { color: theme.darkGray } ]}> {user.location.address} </Text>
          <TouchableOpacity onPress={getCurrentLocation} disabled={isLocationLoading} style={[ tw`mt-8 py-3 px-6 rounded-lg border flex-row items-center justify-center`, { borderColor: theme.primary } ]} >
            {isLocationLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />) : ( <Text style={[tw`font-semibold`, { color: theme.primary }]} >Update My Location </Text>)}
          </TouchableOpacity>
        </View>) : (
        <View style={tw`items-center justify-center flex-1`}>
          <Icon name="location-off" size={60} color={theme.darkGray} />
          <Text style={[ tw`text-lg font-semibold mt-4`, { color: theme.darkGray } ]}> No Location Found </Text>
          <Text style={[tw`text-sm mt-1 text-center px-6`, { color: theme.darkGray } ]}> Set your location to get better service. </Text>
          <TouchableOpacity onPress={getCurrentLocation} disabled={isLocationLoading} style={[ tw`mt-6 py-3 px-6 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary } ]}>
            {isLocationLoading ? ( <ActivityIndicator size="small" color="#fff" /> ) : ( <Text style={[tw`text-white font-semibold`]}> Set My Location </Text>)}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  const SidebarHistoryContent = () => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title="Orders History" />
      <ScrollView>
        {orders && orders.length > 0 ? orders.map((order) => (
          <View key={order._id} style={[tw`p-4 mb-3 rounded-lg`, {backgroundColor: theme.semiWhite}]}>
            <Text style={[tw`text-base font-bold`, {color: theme.black}]}>Order ID: {order._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, {color: theme.darkGray}]}>Date: {new Date(order.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, {color: theme.primary}]}>Total: ${order.total}</Text>
          </View>
        )) : <EmptyContent icon="history" title="No Orders Yet" subtitle="Your order history is empty." />}
      </ScrollView>
    </View>
  );
  const SidebarNotificationsContent = () => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title="Notifications" />
      <ScrollView>
        {notifications.length > 0 ? notifications.map(n => (
          <View key={n.id} style={[tw`p-4 mb-3 rounded-lg`, { backgroundColor: n.read ? theme.semiWhite : theme.lightBeige }]}>
            <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{n.message}</Text>
            <Text style={[tw`text-sm mt-1`, { color: theme.darkGray }]}>{new Date(n.date).toLocaleString()}</Text>
          </View>
        )) : <EmptyContent icon="notifications-off" title="No Notifications" subtitle="You have no new notifications." />}
      </ScrollView>
    </View>
  );
  const SidebarGenericContent = ({ title, icon }) => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title={title} />
      <EmptyContent icon={icon} title="Coming Soon" subtitle="This feature is under development." />
    </View>
  );
  const menuItems = [ { key: 'favorites', icon: "favorite", title: "Favorites", subtitle: `${favorites.length} items` },
    { key: 'history', icon: "history", title: "Order History", subtitle: `${orders.length} orders` },
    { key: 'location', icon: "location-on", title: "My Location", subtitle: user?.location?.lat ? "Location Saved" : "Set location" },
    { key: 'notifications', icon: "notifications", title: "Notifications", subtitle: `${notifications.filter(n=>!n.read).length} new` },
    { key: 'addresses', icon: "pin-drop", title: "Addresses", subtitle: "Manage delivery" },
    { key: 'payment', icon: "payment", title: "Payment", subtitle: "Manage cards" },
    { key: 'help', icon: "help", title: "Help & Support", subtitle: "FAQs" },
  ];
  if (!isAuthenticated) {
    return (
      <View style={[tw`flex-1 justify-center items-center px-6`, { backgroundColor: theme.white }]}>
        <Header title="Profile" />
        <Icon name="person-off" size={80} color={theme.darkGray} />
        <Text style={[tw`text-xl font-bold mt-4`, { color: theme.black }]}>Welcome</Text>
        <Text style={[tw`text-base mt-2 text-center`, { color: theme.darkGray }]}>Sign in to access your profile</Text>
        <TouchableOpacity style={[tw`py-3 px-8 mt-6 rounded-lg w-full`, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate("Login")}>
          <Text style={[tw`text-lg font-semibold text-center`, { color: theme.white }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Profile" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary}/>}>
        <View style={[tw`p-6 items-center`, { backgroundColor: theme.lightBeige }]}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading} style={[tw`w-24 h-24 rounded-full items-center justify-center mb-4`, { backgroundColor: theme.primary }]}>
            {user?.image ? <Image source={{ uri: user.image }} style={tw`w-24 h-24 rounded-full`} /> : <Icon name="person" size={40} color={theme.white} />}
            {isUploading && <View style={[tw`absolute inset-0 items-center justify-center rounded-full`, { backgroundColor: "rgba(0,0,0,0.5)" }]}><ActivityIndicator color={theme.white} /></View>}
            <View style={[tw`absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center border-2 border-white`, { backgroundColor: theme.primary }]}><Icon name="camera-alt" size={14} color={theme.white} /></View>
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold mb-1`, { color: theme.black }]}>{user?.name}</Text>
          <Text style={[tw`text-base`, { color: theme.darkGray }]}>{user?.email}</Text>
          <View style={tw`flex-row mt-4`}>
            <View style={tw`items-center mx-4`}>
              <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>{cart.length}</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>In Cart</Text>
            </View>
            <View style={tw`items-center mx-4`}>
              <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>{favorites.length}</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Favorites</Text>
            </View>
          </View>
        </View>
        <View style={[tw`flex-row justify-between p-4 py-6 mx-4 mt-4 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
          <View style={tw`flex-row items-center`}>
            <Icon name={isDarkMode ? "dark-mode" : "light-mode"} size={24} color={theme.primary} />
            <Text style={[tw`text-base font-semibold ml-3`, { color: theme.black }]}>Dark Mode</Text>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: theme.lightGray, true: theme.primary }} thumbColor={theme.white} />
        </View>
        <View style={tw`px-4 mt-2`}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.key} onPress={() => openSidebar(item.key)} style={[tw`flex-row items-center p-4 mb-2 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
              <Icon name={item.icon} size={24} color={theme.primary} />
              <View style={tw`flex-1 ml-3`}>
                <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.title}</Text>
                <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.darkGray} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={[tw`flex-row items-center justify-center p-4 mx-4 mt-4 mb-8 rounded-lg`, { backgroundColor: theme.red }]}>
          <Icon name="logout" size={20} color={theme.white} />
          <Text style={[tw`ml-2 text-base font-semibold`, { color: theme.white }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar}>
        <View style={[tw`flex-1 flex-row`, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <TouchableOpacity style={tw`flex-1`} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[tw`w-4/5 h-full`, { backgroundColor: theme.white, transform: [{ translateX: slideAnim }], elevation: 20 }]}>
            {renderSidebarContent()}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
