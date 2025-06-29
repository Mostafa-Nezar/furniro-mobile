import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import { AuthService } from "../services/AuthService";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {
    theme,
    user,
    isAuthenticated,
    logout,
    isDarkMode,
    toggleTheme,
    cart,
    favorites,
    updateUser,
  } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const uploadImage = async (selectedImage) => {
    if (!selectedImage) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", {
      uri: selectedImage.uri,
      name: selectedImage.fileName || "avatar.jpg",
      type: selectedImage.type || "image/jpeg",
    });

    try {
      const response = await fetch(
        "http://localhost:3001/api/upload/upload-avatar",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.avatarUrl) {
        const updatedUser = {
          ...user,
          avatar: "http://localhost:3001" + data.avatarUrl,
        };

        updateUser(updatedUser);

        Alert.alert("Success", "Image uploaded successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert(
        "Error",
        "Failed to upload image. Check internet connection."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      await uploadImage(selectedImage);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AuthService.signOut();
          logout();
          AsyncStorage.clear();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const openSidebar = (content) => {
    setSidebarContent(content);
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
      setSidebarContent(null);
    });
  };

  const renderFavoritesContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row items-center justify-between mb-6`}>
        <Text
          style={[
            tw`text-xl font-bold`,
            { color: theme.black, fontFamily: "Poppins-Bold" },
          ]}
        >
          My Favorites
        </Text>
        <TouchableOpacity onPress={closeSidebar}>
          <Icon name="close" size={24} color={theme.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {favorites.length > 0 ? (
          favorites.map((item, index) => (
            <View
              key={index}
              style={[
                tw`flex-row p-4 mb-3 rounded-lg`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/60" }}
                style={tw`w-15 h-15 rounded-lg`}
                resizeMode="cover"
              />
              <View style={tw`flex-1 ml-3`}>
                <Text
                  style={[
                    tw`text-base font-semibold`,
                    { color: theme.black, fontFamily: "Poppins-SemiBold" },
                  ]}
                >
                  {item.name || item.title}
                </Text>
                <Text
                  style={[
                    tw`text-sm mt-1`,
                    { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                  ]}
                >
                  ${item.price || "0.00"}
                </Text>
                <Text
                  style={[
                    tw`text-xs mt-1`,
                    { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                  ]}
                >
                  Added {item.dateAdded || "Recently"}
                </Text>
              </View>
              <TouchableOpacity style={tw`justify-center`}>
                <Icon name="favorite" size={20} color={theme.red} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={tw`flex-1 justify-center items-center py-20`}>
            <Icon name="favorite-border" size={60} color={theme.darkGray} />
            <Text
              style={[
                tw`text-lg font-semibold mt-4`,
                { color: theme.darkGray, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              No Favorites Yet
            </Text>
            <Text
              style={[
                tw`text-sm mt-2 text-center`,
                { color: theme.darkGray, fontFamily: "Poppins-Regular" },
              ]}
            >
              Start adding items to your favorites to see them here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderOrderHistoryContent = () => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row items-center justify-between mb-6`}>
        <Text
          style={[
            tw`text-xl font-bold`,
            { color: theme.black, fontFamily: "Poppins-Bold" },
          ]}
        >
          Order History
        </Text>
        <TouchableOpacity onPress={closeSidebar}>
          <Icon name="close" size={24} color={theme.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`flex-1 justify-center items-center py-20`}>
          <Icon name="history" size={60} color={theme.darkGray} />
          <Text
            style={[
              tw`text-lg font-semibold mt-4`,
              { color: theme.darkGray, fontFamily: "Poppins-SemiBold" },
            ]}
          >
            No Orders Yet
          </Text>
          <Text
            style={[
              tw`text-sm mt-2 text-center`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            Your order history will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderGenericContent = (title, icon) => (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row items-center justify-between mb-6`}>
        <Text
          style={[
            tw`text-xl font-bold`,
            { color: theme.black, fontFamily: "Poppins-Bold" },
          ]}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={closeSidebar}>
          <Icon name="close" size={24} color={theme.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 justify-center items-center py-20`}>
        <Icon name={icon} size={60} color={theme.darkGray} />
        <Text
          style={[
            tw`text-lg font-semibold mt-4`,
            { color: theme.darkGray, fontFamily: "Poppins-SemiBold" },
          ]}
        >
          Coming Soon
        </Text>
        <Text
          style={[
            tw`text-sm mt-2 text-center`,
            { color: theme.darkGray, fontFamily: "Poppins-Regular" },
          ]}
        >
          This feature will be available soon
        </Text>
      </View>
    </View>
  );

  const menuItems = [
    {
      icon: "favorite",
      title: "Favorites",
      subtitle: `${favorites.length} items`,
      onPress: () => openSidebar(renderFavoritesContent()),
    },
    {
      icon: "history",
      title: "Order History",
      subtitle: "View your previous orders",
      onPress: () => openSidebar(renderOrderHistoryContent()),
    },
    {
      icon: "location-on",
      title: "Addresses",
      subtitle: "Manage delivery addresses",
      onPress: () =>
        openSidebar(renderGenericContent("Addresses", "location-on")),
    },
    {
      icon: "payment",
      title: "Payment Methods",
      subtitle: "Manage payment cards",
      onPress: () =>
        openSidebar(renderGenericContent("Payment Methods", "payment")),
    },
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Notification settings",
      onPress: () =>
        openSidebar(renderGenericContent("Notifications", "notifications")),
    },
    {
      icon: "help",
      title: "Help & Support",
      subtitle: "FAQs and support",
      onPress: () =>
        openSidebar(renderGenericContent("Help & Support", "help")),
    },
    {
      icon: "info",
      title: "About App",
      subtitle: "App info and version",
      onPress: () => {
        Alert.alert(
          "About App",
          "Furniro Mobile v1.0.0\nModern home furniture app"
        );
      },
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
        <Header title="Profile" showBack={false} showCart={false} />

        <View style={tw`flex-1 justify-center items-center px-6`}>
          <Icon name="person" size={80} color={theme.darkGray} />
          <Text
            style={[
              tw`text-xl font-bold mt-4 text-center`,
              { color: theme.black, fontFamily: "Poppins-Bold" },
            ]}
          >
            Welcome to Furniro
          </Text>
          <Text
            style={[
              tw`text-base mt-2 text-center`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            Sign in to access your profile and more features
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={[
              tw`py-4 px-8 rounded-lg mt-6`,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text
              style={[
                tw`text-lg font-semibold`,
                { color: theme.white, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={[
              tw`py-3 px-8 mt-3 border rounded-lg`,
              { borderColor: theme.primary },
            ]}
          >
            <Text
              style={[
                tw`text-base font-semibold`,
                { color: theme.primary, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Profile" showBack={false} showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View
          style={[tw`p-6 items-center`, { backgroundColor: theme.lightBeige }]}
        >
          <TouchableOpacity onPress={pickImage} disabled={isUploading}>
            <View
              style={[
                tw`w-24 h-24 rounded-full items-center justify-center mb-4 relative`,
                { backgroundColor: theme.primary },
              ]}
            >
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={tw`w-24 h-24 rounded-full`}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="person" size={40} color={theme.white} />
              )}

              {/* Loading indicator */}
              {isUploading && (
                <View
                  style={[
                    tw`absolute inset-0 rounded-full items-center justify-center`,
                    { backgroundColor: "rgba(0,0,0,0.5)" },
                  ]}
                >
                  <Icon name="cloud-upload" size={24} color={theme.white} />
                </View>
              )}

              {/* Camera icon */}
              <View
                style={[
                  tw`absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center`,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Icon name="camera-alt" size={12} color={theme.white} />
              </View>
            </View>
          </TouchableOpacity>

          <Text
            style={[
              tw`text-xl font-bold mb-1`,
              { color: theme.black, fontFamily: "Poppins-Bold" },
            ]}
          >
            {user?.name || "User"}
          </Text>

          <Text
            style={[
              tw`text-base`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            {user?.email || "user@example.com"}
          </Text>

          <View style={tw`flex-row mt-4`}>
            <View style={tw`items-center mx-4`}>
              <Text
                style={[
                  tw`text-lg font-bold`,
                  { color: theme.primary, fontFamily: "Poppins-Bold" },
                ]}
              >
                {cart.length}
              </Text>
              <Text
                style={[
                  tw`text-sm`,
                  { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                ]}
              >
                In Cart
              </Text>
            </View>

            <View style={tw`items-center mx-4`}>
              <Text
                style={[
                  tw`text-lg font-bold`,
                  { color: theme.primary, fontFamily: "Poppins-Bold" },
                ]}
              >
                {favorites.length}
              </Text>
              <Text
                style={[
                  tw`text-sm`,
                  { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                ]}
              >
                Favorites
              </Text>
            </View>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View
          style={[
            tw`flex-row items-center justify-between p-4 mx-4 mt-4 rounded-lg`,
            { backgroundColor: theme.semiWhite },
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <Icon
              name={isDarkMode ? "dark-mode" : "light-mode"}
              size={24}
              color={theme.primary}
            />
            <View style={tw`ml-3`}>
              <Text
                style={[
                  tw`text-base font-semibold`,
                  { color: theme.black, fontFamily: "Poppins-SemiBold" },
                ]}
              >
                Dark Mode
              </Text>
              <Text
                style={[
                  tw`text-sm`,
                  { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                ]}
              >
                {isDarkMode ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>

          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.lightGray, true: theme.primary }}
            thumbColor={theme.white}
          />
        </View>

        {/* Menu Items */}
        <View style={tw`px-4 mt-4`}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={[
                tw`flex-row items-center p-4 mb-2 rounded-lg`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Icon name={item.icon} size={24} color={theme.primary} />
              <View style={tw`flex-1 ml-3`}>
                <Text
                  style={[
                    tw`text-base font-semibold`,
                    { color: theme.black, fontFamily: "Poppins-SemiBold" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    tw`text-sm`,
                    { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.darkGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={() => {
            AsyncStorage.clear();
            navigation.reset("Login")
          }}
          style={[
            tw`flex-row items-center justify-center p-4 mx-4 mt-6 mb-8 rounded-lg`,
            { backgroundColor: theme.red },
          ]}
        >
          <Icon name="logout" size={20} color={theme.white} />
          <Text
            style={[
              tw`ml-2 text-base font-semibold`,
              { color: theme.white, fontFamily: "Poppins-SemiBold" },
            ]}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Animated Sidebar */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View
          style={[tw`flex-1 flex-row`, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <TouchableOpacity
            style={tw`flex-1`}
            onPress={closeSidebar}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              tw`w-4/5 h-full`,
              {
                backgroundColor: theme.white,
                transform: [{ translateX: slideAnim }],
                shadowColor: "#000",
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 5,
                elevation: 5,
              },
            ]}
          >
            {sidebarContent}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
