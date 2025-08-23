import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

  const SocketContext = createContext();
  const API = "https://furniro-back-production.up.railway.app/api/notifications";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  useEffect(() => {
    const initSocket = async () => {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        if (token && user) {
          const userData = JSON.parse(user);
          const newSocket = io('https://furniro-back-production.up.railway.app/api', {auth: {token: token}});
          newSocket.on('connect', () => {
            console.log('✅ Connected to socket server');
            setConnected(true);
            user? newSocket.emit('join', userData.id):null;
          });

          newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
            setConnected(false);
          });
          newSocket.on('newNotification', (notification) => {
            console.log('🔔 New notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          });
          newSocket.on('notificationRead', ({ notificationId }) => {
            setNotifications(prev => prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif ) );
            setUnreadCount(prev => Math.max(0, prev - 1));
          });

          setSocket(newSocket);
        }
    };

    initSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    markAllAsReadInDB,
    handleDeleteNotification,
    formatDate,
    loading,
    refreshing
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
