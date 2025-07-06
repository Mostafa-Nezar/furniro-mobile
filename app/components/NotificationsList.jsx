import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';

const NotificationsList = ({ navigation }) => {
  const {
    notifications,
    markNotificationAsRead,
    setNotifications,
    setUnreadCount,
    sendTestNotification,
  } = useSocket();

  const { theme } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/notifications', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    Alert.alert('Delete', 'Delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:3001/api/notifications/${id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok)
              setNotifications((prev) => prev.filter((n) => n._id !== id));
          } catch (error) {
            console.error('Delete error:', error);
          }
        },
      },
    ]);
  };

  const formatDate = (str) => {
    const date = new Date(str);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60);

    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        tw`flex-row p-4 rounded-xl mb-3 shadow-sm`,
        {
          backgroundColor: theme.white,
          borderLeftWidth: item.read ? 0 : 4,
          borderLeftColor: item.read ? 'transparent' : theme.primary,
        },
      ]}
      onPress={() => !item.read && handleMarkAsRead(item._id)}
    >
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center mb-2`}>
          <Ionicons
            name={item.read ? 'checkmark-circle' : 'notifications'}
            size={20}
            color={item.read ? theme.green : theme.primary}
            style={tw`mr-2`}
          />
          <Text style={[tw`text-xs ml-auto`, { color: theme.gray }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text
          style={[
            tw`text-sm`,
            {
              color: item.read ? theme.darkGray : theme.black,
              fontWeight: item.read ? 'normal' : '600',
            },
          ]}
        >
          {item.message}
        </Text>
      </View>
      <TouchableOpacity
        style={tw`pl-3 justify-center`}
        onPress={() => handleDeleteNotification(item._id)}
      >
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
      <Header title="Notifications" showBack showCart={false} showSearch={false} />

      {notifications.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.gray} />
          <Text style={[tw`text-xl font-semibold mt-4`, { color: theme.black }]}>
            No notifications
          </Text>
          <Text style={[tw`text-sm text-center mt-2`, { color: theme.darkGray }]}>
            You're all caught up!
          </Text>
          <TouchableOpacity
            onPress={sendTestNotification}
            style={[tw`mt-4 px-5 py-2 rounded-lg`, { backgroundColor: theme.primary }]}
          >
            <Text style={[tw`text-white text-base font-semibold`]}>Send Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
          }
          contentContainerStyle={tw`p-4`}
        />
      )}
    </View>
  );
};

export default NotificationsList;
