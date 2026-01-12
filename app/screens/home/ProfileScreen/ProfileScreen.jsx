import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, Animated, Modal, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../../context/AppContext";
import Header from "../../../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { fetchInstance } from "../../../context/api";
import ProfileHeader from "./components/ProfileHeader";
import SidebarFavoritesContent from "./components/SidebarFavoritesContent";
import SidebarHistoryContent from "./components/SidebarHistoryContent";
import SidebarLocationContent from "./components/SidebarLocationContent";
import SidebarNotificationsContent from "./components/SidebarNotificationsContent";
import SidebarPhoneContent from "./components/SidebarPhoneContent";
import SidebarGenericContent from "./components/SidebarGenericContent";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, logout, isDarkMode, toggleTheme, favorites, products, getImageUrl, toggleFavorite, orders, cancelOrder, loadingCancel, updateUser } = useAppContext();
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { notifications, formatDate } = useSocket();

  const [isUploading, setIsUploading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarContentKey, setSidebarContentKey] = useState(null);
  const [isLocationLoading, setLocationLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(500)).current;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const openSidebar = (key) => {
    setSidebarContentKey(key);
    setSidebarVisible(true);
    Animated.timing(slideAnim, { 
      toValue: 0, 
      duration: 300, 
      useNativeDriver: true 
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, { 
      toValue: 500, 
      duration: 300, 
      useNativeDriver: true 
    }).start(() => {
      setSidebarVisible(false);
      setSidebarContentKey(null);
    });
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Toast.show({ type: "info", text1: "Permission required" });

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        setIsUploading(true);
        
        const formData = new FormData();
        
        // Fix for image URI on Android and ensuring correct structure
        const uri = Platform.OS === "android" ? image.uri : image.uri.replace("file://", "");
        const fileName = image.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("avatar", {
          uri: uri,
          name: fileName || "avatar.jpg",
          type: type || "image/jpeg",
        });

        // Using the specific update-image endpoint
        const data = await fetchInstance(`/auth/${user.id}/update-image`, {
          method: "PATCH",
          headers: { "Content-Type": "multipart/form-data" },
          body: formData,
        });
        
        updateUser({ ...user, image: data.imageUrl || data.user?.image });
        Toast.show({ type: "success", text1: data.msg || "Image Updated" });
      }
    } catch (err) {
      console.error("PickImage Error:", err);
      Toast.show({ type: "error", text1: "Upload Failed", text2: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const updateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Toast.show({ type: "info", text1: "Location permission denied" });

      setLocationLoading(true);
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=en`, { headers: { "User-Agent": "furniro-app/1.0" } });
      const geoData = await geoRes.json();
      const address = geoData?.display_name || "Unknown location";

      await fetchInstance(`/auth/users/${user.id}/location`, {
        method: "PATCH",
        body: JSON.stringify({ location: address }),
      });
      
      updateUser({ ...user, location: address });
      Toast.show({ type: "success", text1: "Location updated", text2: address });
      closeSidebar();
    } catch (e) {
      Toast.show({ type: "error", text1: "Update failed", text2: e.message });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSavePhone = async (newPhone) => {
    try {
      const data = await fetchInstance(`/auth/users/${user.id}/phone`, {
        method: "PATCH",
        body: JSON.stringify({ phoneNumber: newPhone }),
      });
      
      updateUser({ ...user, phoneNumber: data.phoneNumber || newPhone });
      Toast.show({ type: "success", text1: "Phone updated" });
      closeSidebar();
    } catch (err) {
      Toast.show({ type: "error", text1: err.message });
    }
  };

  const renderSidebarContent = () => {
    const commonProps = { theme, onClose: closeSidebar };
    switch (sidebarContentKey) {
      case 'favorites': return <SidebarFavoritesContent {...commonProps} favoriteProducts={favoriteProducts} getImageUrl={getImageUrl} toggleFavorite={toggleFavorite} favorites={favorites} />;
      case 'history': return <SidebarHistoryContent {...commonProps} orders={orders} loadingCancel={loadingCancel} cancelOrder={cancelOrder} navigation={navigation} />;
      case 'location': return <SidebarLocationContent {...commonProps} user={user} isLocationLoading={isLocationLoading} onUpdateLocation={updateLocation} />;
      case 'notifications': return <SidebarNotificationsContent {...commonProps} notifications={notifications} formatDate={formatDate} />;
      case 'phone': return <SidebarPhoneContent {...commonProps} user={user} onSavePhone={handleSavePhone} />;
      case 'addresses': return <SidebarGenericContent {...commonProps} title="Addresses" icon="location-on" />;
      case 'payment': return <SidebarGenericContent {...commonProps} title="Payment Methods" icon="payment" />;
      case 'help': return <SidebarGenericContent {...commonProps} title="Help & Support" icon="help" />;
      default: return null;
    }
  };

  const menuItems = [
    { key: 'favorites', icon: "favorite", title: "Favorites", subtitle: `${favorites.length} items` },
    { key: 'history', icon: "history", title: "Order History", subtitle: `${orders.length} orders` },
    { key: 'location', icon: "location-on", title: "My Location", subtitle: user?.location ? "Location Saved" : "Set location" },
    { key: 'notifications', icon: "notifications", title: "Notifications", subtitle: `${notifications.filter(n => !n.read).length} new` },
    { key: 'phone', icon: "phone", title: "My Phone", subtitle: user?.phoneNumber || "Set phone" },
    { key: 'addresses', icon: "pin-drop", title: "Addresses", subtitle: "Manage delivery" },
    { key: 'payment', icon: "payment", title: "Payment", subtitle: "Manage cards" },
    { key: 'help', icon: "help", title: "Help & Support", subtitle: "FAQs" }
  ];

  if (!isAuthenticated) {
    return (
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
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Profile" />
      <ScrollView>
        <ProfileHeader 
          user={user} 
          theme={theme} 
          cart={cart} 
          favorites={favorites} 
          isUploading={isUploading} 
          onPickImage={pickImage} 
        />
        
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
              <Icon name={item.icon} size={24} color={item.key === 'favorites' ? theme.red : theme.primary} />
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

      <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar} statusBarTranslucent={true}>
        <View style={[tw`flex-1`, { justifyContent: "flex-end" }]}>
          <TouchableOpacity style={tw`absolute inset-0`} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[tw`w-full`, { height: 500, backgroundColor: theme.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, transform: [{ translateY: slideAnim }], elevation: 20, position: "absolute", bottom: 0 }]}>
            {renderSidebarContent()}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
