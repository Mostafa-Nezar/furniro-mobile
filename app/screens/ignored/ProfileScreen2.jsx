import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Dimensions, ActivityIndicator, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProfileScreen2 = () => {
  const { width } = Dimensions.get("window");
  const navigation = useNavigation();
  const { theme, logout, isDarkMode, toggleTheme, favorites, products, getImageUrl, toggleFavorite, orders, cancelOrder, loadingCancel, updateUser } = useAppContext();
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { notifications, formatDate } = useSocket();
  
  // ********************************************************************
  // * التعديل الأول: حالة التبويب النشط (موجودة بالفعل وتم إعادة استخدامها)
  // ********************************************************************
  const [activeTab, setActiveTab] = useState("favorites"); 
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationLoading, setLocationLoading] = useState(false);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

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
    } else { Toast.show({ type: "error", text1: data?.msg || "Failed to update phone" }) }
  };
  
  // ********************************************************************
  // * التعديل الثاني: مكونات عرض المحتوى (تم حذف SidebarHeader منها)
  // ********************************************************************
  
  const EmptyContent = ({ icon, title, subtitle }) => (
    <View style={tw`flex-1 justify-center items-center py-20`}>
      <Icon name={icon} size={60} color={theme.darkGray} />
      <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>{title}</Text>
      <Text style={[tw`text-sm mt-2 text-center`, { color: theme.darkGray }]}>{subtitle}</Text>
    </View>
  );
  
  const SidebarFavoritesContent = () => (
    <ScrollView style={tw`flex-1 p-4`}>
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
  );
  
  const SidebarLocationContent = () => (
    <View style={tw`flex-1 p-4`}>
      {isLocationLoading && !user?.location ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[tw`mt-4`, { color: theme.darkGray }]}>Updating Location...</Text>
        </View>
      ) : user?.location ? (
        <View style={tw`items-center justify-center flex-1`}>
          <Icon name="location-on" size={60} color={theme.primary} />
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
    <ScrollView style={tw`flex-1 p-4`}>
      {orders?.length ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).map((o) => (
        <View key={o._id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between items-center`, { backgroundColor: theme.semiWhite }]}>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {o._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Date: {new Date(o.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.primary }]}>Total: ${o.total}</Text>
            <Text style={[tw`text-sm font-semibold mt-2`, { color: o.status==="pending"?theme.yellow:o.status==="delivered"?theme.green:(o.status==="canceled"||o.status==="refused")?theme.red:theme.darkGray }]}>
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
      )) : <EmptyContent icon="history" title="No Orders" subtitle="Your order history will appear here." />}
    </ScrollView>
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
    const SidebarNotificationsContent = () => (
    <View style={tw`flex-1 p-4`}>
      <ScrollView>
        {notifications.length > 0 ? notifications.map(n => (
          <View key={n.id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between`,{backgroundColor:n.read?theme.semiWhite:theme.lightBeige}]}>
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
  const TabBarButton = ({ tabKey, iconName }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tabKey)}
      style={[
        tw`flex-1 items-center justify-center py-3`,
        activeTab === tabKey && { borderBottomWidth: 2, borderBottomColor: theme.black },
      ]}
    >
      <Icon name={iconName} size={24} color={activeTab === tabKey ? theme.black : theme.darkGray} />
    </TouchableOpacity>
  );

  const HorizontalTabBar = () => (
    <View style={tw`flex-row border-b border-gray-200 mt-4`}>
      <TabBarButton tabKey="favorites" iconName="favorite-border" />
      <TabBarButton tabKey="history" iconName="history" />
      <TabBarButton tabKey="location" iconName="location-on" />
      <TabBarButton tabKey="phone" iconName="phone" />
      <TabBarButton tabKey="notifications" iconName="notifications" />
      
      {/* <TabBarButton tabKey="notifications" iconName="notifications" /> */}
    </View>
  );
  
  // ********************************************************************
  // * التعديل الرابع: دالة عرض محتوى التبويب النشط (بديل renderSidebarContent)
  // ********************************************************************
  const renderTabContent = () => { 
    switch (activeTab) {
      case 'favorites': return <SidebarFavoritesContent />;
      case 'history': return <SidebarHistoryContent />;
      case 'location': return <SidebarLocationContent />;
      case 'phone': return <SidebarPhoneContent />;
      case 'notifications': return <SidebarNotificationsContent />;
      default: return <EmptyContent icon="info" title="Select a Tab" subtitle="Choose a tab to view its content." />;
    }
  };

 return (
    <View style={tw`flex-1 bg-white`}>
      <Header title="My Profile" />
      <ScrollView style={tw`flex-1`}>
        <View style={tw`p-4 items-center`}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading}>
            <Image
              source={{ uri: getImageUrl(user?.image) || 'https://via.placeholder.com/150' }}
              style={tw`w-24 h-24 rounded-full border-4`}
            />
            {isUploading && (
              <View style={tw`absolute inset-0 justify-center items-center bg-black bg-opacity-50 rounded-full`}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
             )}
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold mt-2`, { color: theme.black }]}>{user?.name}</Text>
          <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{user?.email}</Text>
          <View style={tw`flex-row items-center mt-4`}>
            <Text style={[tw`mr-2`, { color: theme.black }]}>Dark Mode</Text>
            <Switch
              trackColor={{ false: theme.darkGray, true: theme.primary }}
              thumbColor={isDarkMode ? theme.white : theme.white}
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
          <TouchableOpacity onPress={handleLogout} style={[tw`mt-4 py-2 px-4 rounded-lg`, { backgroundColor: theme.red }]}>
            <Text style={tw`text-white font-semibold`}>Logout</Text>
          </TouchableOpacity>
        </View>
        <HorizontalTabBar />
        <View style={tw`flex-1`}>
          {renderTabContent()}
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

export default ProfileScreen2;
