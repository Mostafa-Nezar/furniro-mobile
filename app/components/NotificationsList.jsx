import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSocket } from "../context/SocketContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";

const NotificationsList = () => {
  const { notifications, setNotifications, setUnreadCount } = useSocket();
  const { theme } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API = "https://furniro-back-production.up.railway.app/api/notifications";

  useEffect(() => {
    (async () => {
      await fetchNotifications();
      await markAllAsReadInDB();
    })();
  }, []);

  const getToken = () => AsyncStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!token || !user?.id) return;

      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const userNotifications = (data.notifications || []).filter(n => n.userId === user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsReadInDB = async () => {
    try {
      const token = await getToken();
      await fetch(`${API}/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatDate = (str) => {
    const date = new Date(str), now = new Date(), diff = (now - date) / 60000;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[tw`flex-row p-4 rounded-xl mb-3 shadow-sm`, { backgroundColor: theme.white, borderLeftWidth: 4, borderLeftColor: theme.primary }]}
    >
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center mb-2`}>
          <Ionicons name="notifications" size={20} color={theme.primary} style={tw`mr-2`} />
          <Text style={[tw`text-xs ml-auto`, { color: theme.gray }]}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={[tw`text-sm`, { color: theme.black, fontWeight: "600" }]}>{item.message}</Text>
      </View>
      <TouchableOpacity style={tw`pl-3 justify-center`} onPress={() => handleDeleteNotification(item._id)}>
        <Ionicons name="trash-outline" size={18} color={theme.red} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme.semiWhite }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[tw`mt-3`, { color: theme.gray }]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.semiWhite }]}>
      <Header title="Notifications" showBack showNotification={false} showSearch={false} showCart />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />}
        contentContainerStyle={tw`p-4`}
      />
    </View>
  );
};

export default NotificationsList;
