import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Animated, Dimensions, Modal, PermissionsAndroid, Platform, ActivityIndicator, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import Header from "../../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Constants from "expo-constants";
const screenHeight = Dimensions.get("window").height;

const ProfileScreen = () => {
const { width } = Dimensions.get("window");
  const navigation = useNavigation();
  const { theme, logout, isDarkMode, toggleTheme, favorites, products, getImageUrl, toggleFavorite,  orders, cancelOrder, loadingCancel,updateUser } = useAppContext();
  const { user, isAuthenticated } =useAuth();
  const { cart } =useCart();
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarContentKey, setSidebarContentKey] = useState(null); 
  const [isLocationLoading, setLocationLoading] = useState(false);
  const {notifications, formatDate} = useSocket();
  const slideAnim = useRef(new Animated.Value(width)).current;
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // const pickImage = async () => {
  //   const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (!perm.granted) return Toast.show({ type: "info", text1: "Permission required" });
  //   const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
  //   if (!result.canceled) await uploadImage(result.assets[0]);
  // };
  // const uploadImage = async (image) => {
  //   if (!image) return;
  //   setIsUploading(true);
  //   const formData = new FormData();
  //   formData.append("avatar", { uri: image.uri, name: image.fileName || `avatar.jpg`, type: "image/jpeg" });
  //   try {
  //     const res = await fetch(`https://furniro-back-production.up.railway.app/api/upload/${user?.id}/update-image`, { method: "PATCH", headers: { Authorization: `Bearer ${user?.token}` }, body: formData } );
  //     const data = await res.json();
  //     if (data.success) {
  //       const updated = { ...user, image: data.imageUrl };
  //       updateUser(updated)
  //       Toast.show({ type: "success", text1: "Image Updated" });
  //     } else Toast.show({ type: "error", text1: data.message || "Upload Failed" });
  //   } catch (err) { Toast.show({ type: "error", text1: "Check Your Connection" }); } 
  //   finally { setIsUploading(false); }
  // };
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted)
      return Toast.show({ type: "info", text1: "Permission required" });
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  
    if (!result.canceled) await uploadImage(result.assets[0]);
  };
  
  const uploadImage = async (image) => {
    if (!image) return;
    setIsUploading(true);
    const token = await AsyncStorage.getItem("token");
  
    const formData = new FormData();
    formData.append("avatar", {
      uri: image.uri,
      name: image.fileName || "avatar.jpg",
      type: "image/jpeg",
    });
  
    try {
      const res = await fetch(
        `https://furniro-back-production.up.railway.app/api/auth/${user?.id}/update-image`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      
  
      const data = await res.json();
  
      if (res.ok) {
        const updated = { ...user, image: data.imageUrl };
        updateUser(updated);
        Toast.show({ type: "success", text1: data.msg || "Image Updated" });
      } else {
        Toast.show({ type: "error", text1: data.msg || "Upload Failed" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Check Your Connection" });
    } finally {
      setIsUploading(false);
    }
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
        body: JSON.stringify({ location: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to update location");
      closeSidebar();
      updateUser({ ...user, location: address });
      Toast.show({ type: "success", text1: "Location updated", text2: address });
    } catch (e) {
      Toast.show({ type: "error", text1: "Update failed", text2: e.message, position: "top" });
    } finally {
      setLocationLoading(false);
    }
  };
  const updatePhone = async (userId, newPhone) => {
    const res = await fetch(`https://furniro-back-production.up.railway.app/api/auth/users/${userId}/phone`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: newPhone }) });
    const data = await res.json();
    if (res.ok) {
      const updatedUser = { ...user, phoneNumber: data.phoneNumber };
      updateUser(updatedUser);
    } else { Toast.show({ type: "error", text1: data?.msg || "Failed to update phone" }) }
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
      case 'phone': return <SidebarPhoneContent />;
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
      {isLocationLoading && !user?.location ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[tw`mt-4`, { color: theme.darkGray }]}>Updating Location...</Text>
        </View>
      ) : user?.location ? (
        <View style={tw`items-center justify-center flex-1`}>
          <Icon name="location-on" size={60} color={theme.red} />
          <Text style={[ tw`text-lg font-bold mt-4 mb-2 text-center`, { color: theme.black } ]}> Current Location Saved </Text>
          <Text style={[ tw`text-base text-center px-4`, { color: theme.darkGray } ]}> {user.location} </Text>
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
      {orders?.length ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).map((o) => (
        <View key={o._id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between items-center`, { backgroundColor: theme.semiWhite }]}>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {o._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Date: {new Date(o.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.primary }]}>Total: ${o.total}</Text>
            <Text style={[tw`text-sm font-semibold mt-2`, { color: o.status==="pending"?theme.yellow:o.status==="delivered"?theme.green:(o.status==="cancelled"||o.status==="refused")?theme.red:theme.darkGray }]}>
              {o.status[0].toUpperCase() + o.status.slice(1)}
            </Text>
          </View>
          {o.status==="pending" && (
            loadingCancel===o._id ? (
              <View style={[tw`px-3 py-1 rounded-md`, { backgroundColor: theme.semiWhite }]}>
                <Text style={[tw`text-base font-semibold italic`, { color: theme.red }]}>Cancelling...</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => cancelOrder(o._id)} style={[tw`rounded-md w-24 p-2 py-1 flex-row justify-center`, { backgroundColor: theme.red }]}>
                <Text style={tw`text-center text-base font-semibold text-white`}>Cancel</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )) : <EmptyContent icon="history" title="No Orders Yet" subtitle="Your order history is empty." />}
    </ScrollView>
    <TouchableOpacity onPress={() => navigation.navigate("Orders")} style={[tw`rounded-md w-24 p-2 py-1 flex-row justify-center`, { backgroundColor: theme.primary }]}>
      <Text style={tw`text-center text-base font-semibold text-white`}>View All</Text>
    </TouchableOpacity>
  </View>
  );
  const SidebarNotificationsContent = () => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title="Notifications" />
      <ScrollView>
        {notifications.length > 0 ? notifications.map(n => (
          <View key={n._id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between`,{backgroundColor:n.read?theme.semiWhite:theme.lightBeige}]}>
            <View style={tw`flex-1 pr-2`}>
              <Text style={[tw`text-base font-semibold`,{color:theme.black}]}>{n.message}</Text>
              <Text style={[tw`text-sm mt-1`,{color:theme.darkGray}]}>{formatDate(n.createdAt)}</Text>
            </View>
            <Icon name={n.read?"notifications-none":"notifications"} size={24} color={theme.primary}/>
          </View>
        )):<EmptyContent icon="notifications-off" title="No Notifications" subtitle="You have no new notifications."/>}
      </ScrollView>
    </View>
  );
  const SidebarGenericContent = ({ title, icon }) => (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title={title} />
      <EmptyContent icon={icon} title="Coming Soon" subtitle="This feature is under development." />
    </View>
  );
  const SidebarPhoneContent = () => {
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [loading, setLoading] = useState(false);
  const handleSavePhone = async () => {
    if (!/^0\d{9,11}$/.test(phone)) { return Toast.show({ type: "error", text1: "Invalid Phone Number" }) }
    setLoading(true);
    try {
      await updatePhone(user.id, phone);
      Toast.show({type: "success", text1: user?.phoneNumber ? "Phone updated" : "Phone added", text2: phone });
      closeSidebar();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title={user?.phoneNumber ? "Update Phone" : "Add Phone"} />
      <View style={tw`mt-8`}>
        <TextInput
          style={[tw`border p-3 rounded-lg mb-4`, { borderColor: theme.primary, color: theme.black }]}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          placeholderTextColor={theme.darkGray}
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity
          onPress={handleSavePhone}
          disabled={loading}
          style={[tw`py-3 px-6 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary }]}
        >
          {loading 
            ? <ActivityIndicator color="#fff" /> 
            : <Text style={tw`text-white font-semibold`}>
                {user?.phoneNumber ? "Update Phone" : "Save Phone"}
              </Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
  };
  const menuItems = [ { key: 'favorites', icon: "favorite", title: "Favorites", subtitle: `${favorites.length} items` },
    { key: 'history', icon: "history", title: "Order History", subtitle: `${orders.length} orders` },
    { key: 'location', icon: "location-on", title: "My Location", subtitle: user?.location ? "Location Saved" : "Set location" },
    { key: 'notifications', icon: "notifications", title: "Notifications", subtitle: `${notifications.filter(n=>!n.read).length} new` },
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
              <Icon name={item.icon} size={24} color={item.key =='favorites' ? theme.red :theme.primary} />
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
      {/* <Modal statusBarTranslucent={false} visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar}>
        <View style={[tw`flex-1 flex-row`, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <TouchableOpacity style={tw`flex-1`} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[tw`w-4/5 h-full`, { backgroundColor: theme.white, transform: [{ translateX: slideAnim }], elevation: 20 }]}>
            {renderSidebarContent()}
          </Animated.View>
        </View>
      </Modal> */}
      <Modal
  statusBarTranslucent={true} // 👈 عشان ما يغطيش الـ Status Bar
  visible={sidebarVisible}
  transparent
  animationType="none"
  onRequestClose={closeSidebar}
>
  <View
    style={[
      tw`flex-1`,
      {  justifyContent: "flex-end" },
    ]}
  >
    <TouchableOpacity
      style={tw`absolute inset-0`}
      onPress={closeSidebar}
      activeOpacity={1}
    />

    <Animated.View
      style={[
        tw`w-full`,
        {
          height: 500, 
          backgroundColor:theme.white ,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          transform: [{ translateY: slideAnim }],
          elevation: 20,
          marginTop: 80, // 👈 يسيب جزء من فوق
          position: "absolute",
          bottom: 0,
        },
      ]}
    >
      {renderSidebarContent()}
    </Animated.View>
  </View>
</Modal>
{/* 
      <Modal
      statusBarTranslucent={true}
      visible={sidebarVisible}
      transparent
      animationType="none"
      onRequestClose={closeSidebar}
    >
      <View
        style={[
          tw`flex-1 flex-row`,
          { backgroundColor: "rgba(0,0,0,0.5)" },
        ]}
      >
        <TouchableOpacity
          style={tw`flex-1`}
          onPress={closeSidebar}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            tw`w-4/5 absolute right-0`,
            {
              top: Constants.statusBarHeight, // يبدأ من تحت الـ StatusBar
              bottom: 0, // لحد آخر الشاشة
              backgroundColor: theme.white,
              transform: [{ translateX: slideAnim }],
              // borderTopLeftRadius: 15,
              elevation: 20,
            },
          ]}
        >
          {renderSidebarContent()}
        </Animated.View>
      </View>
      </Modal> */}

    </View>
  );
};

export default ProfileScreen;
