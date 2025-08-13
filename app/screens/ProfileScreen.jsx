import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Animated, Dimensions, Modal, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, user, isAuthenticated, logout, isDarkMode, toggleTheme, cart, favorites, updateUser, products, getImageUrl, toggleFavorite, refreshUser } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  const [refreshing, setRefreshing] = useState(false);  
  const onRefresh = async () => {
    setRefreshing(true);
    const success = await refreshUser();
    setRefreshing(false);
    if (!success) Toast.show({type: 'error', text1: 'Failed to refresh user data'});
  };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return  Toast.show({type: 'success', text1: 'Permission required',text2:"Access your gallery"});
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets?.length > 0) await uploadImage(result.assets[0]);
  };
 const uploadImage = async (image) => {
  if (!image) return;
  setIsUploading(true);

  const formData = new FormData();
  formData.append("avatar", {
    uri: image.uri,
    name: image.fileName || `avatar_${Date.now()}.jpg`,
    type: image.type?.includes("/") ? image.type : "image/jpeg",
  });

  try {
    const res = await fetch(
      `https://furniro-back-2-production.up.railway.app/api/upload/${user?.id}/update-image`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();
    if (data.success && data.imageUrl) {
      const updated = { ...user, image: data.imageUrl };
      updateUser(updated);
      await AsyncStorage.setItem("user", JSON.stringify(updated));
      Toast.show({type: 'success', text1:"Image Updated"})
    } else {
     Toast.show({type: 'success', text1: `${data.message}`||"Upload Failed"})
    }
  } catch (err) {
    console.error("Upload error:", err);
    Toast.show({type: 'error', text1: 'Check Your Connection'})
  } finally {
    setIsUploading(false);
  }
};

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };
  const openSidebar = (content) => {
    setSidebarContent(content);
    setSidebarVisible(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };
  const closeSidebar = () => {
    Animated.timing(slideAnim, { toValue: width, duration: 300, useNativeDriver: true }).start(() => { setSidebarVisible(false); setSidebarContent(null); });
  };
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
        {favoriteProducts.length > 0 ? favoriteProducts.map((item, i) => {
          const isFav = favorites.includes(item.id);
          return (
            <View key={i} style={[tw`flex-row p-4 mb-3 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
              <Image source={{ uri: getImageUrl(item.image) }} style={tw`w-15 h-15 rounded-lg`} />
              <View style={tw`ml-3 flex-1`}>
                <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.name}</Text>
                <Text style={[tw`text-sm`, { color: theme.darkGray }]}>${item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)}><Icon name={isFav ? "favorite" : "favorite-border"} size={24} color={isFav ? theme.red : theme.darkGray} /></TouchableOpacity>
            </View>
          );
        }) : renderEmptyContent("favorite-border", "No Favorites", "Add items to favorites")}
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
  const menuItems = [
    { icon: "favorite", title: "Favorites", subtitle: `${favorites.length} items`, onPress: () => openSidebar(renderFavoritesContent()) },
    { icon: "history", title: "Order History", subtitle: "Your previous orders", onPress: () => openSidebar(renderGenericContent("Order History", "history")) },
    { icon: "location-on", title: "Addresses", subtitle: "Manage delivery", onPress: () => openSidebar(renderGenericContent("Addresses", "location-on")) },
    { icon: "payment", title: "Payment", subtitle: "Manage cards", onPress: () => openSidebar(renderGenericContent("Payment Methods", "payment")) },
    { icon: "notifications", title: "Notifications", subtitle: "Notification settings", onPress: () => openSidebar(renderGenericContent("Notifications", "notifications")) },
    { icon: "help", title: "Help & Support", subtitle: "FAQs", onPress: () => openSidebar(renderGenericContent("Help & Support", "help")) },
    { icon: "info", title: "About App", subtitle: "App info", onPress: () => Toast.show({type: 'success', text1: 'Modern Furniture App'}) }
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
          <Text style={[tw`ml-2 text-base font-semibold`, { color: theme.white, fontFamily: "Poppins-SemiBold" }]}>Log Out</Text>
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
