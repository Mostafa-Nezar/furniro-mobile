import { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSocket } from "../context/SocketContext";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";

const NotificationsList = () => {
  const { notifications, fetchNotifications, markAllAsReadInDB, formatDate, handleDeleteNotification, loading, refreshing } = useSocket();
  const { theme } = useAppContext();
  useEffect(() => {
    (async () => {
      await fetchNotifications();
      await markAllAsReadInDB();
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[tw`flex-row p-4 rounded-xl mb-3 shadow-sm`, { backgroundColor: theme.white, borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
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
      <FlatList data={notifications} renderItem={renderItem} keyExtractor={(item) => item._id || item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />} contentContainerStyle={tw`p-4`}/>
    </View>
    );
  };

export default NotificationsList;
