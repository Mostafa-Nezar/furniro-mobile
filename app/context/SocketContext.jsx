import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { fetchInstance } from './api';

const SocketContext = createContext();

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
  const { user } = useAuth();
  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const data = await fetchInstance("/notifications", { method: "GET" });
      const userNotifications = (data.notifications || []).filter(n => n.userId === user.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsReadInDB = async () => {
    await fetchInstance("/notifications/mark-all-read", { method: "PUT" });
    setUnreadCount(0);
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await fetchInstance(`/notifications/${id}`, { method: "DELETE" });
      if (res) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const formatDate = (str) => {
    const date = new Date(str);
    const now = new Date();
    const diff = (now - date) / 60000;

    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  useEffect(() => {
    const initSocket = async () => {
      try {
        if (user) {
          await fetchNotifications();

          const newSocket = io('https://furniro-back-production.up.railway.app');

          newSocket.on('connect', () => {
            console.log('✅ Connected to socket server');
            setConnected(true);
            if (user?.id) {
              newSocket.emit('join', user.id);
            }
          });

          newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
            setConnected(false);
          });

          newSocket.on('newNotification', (notification) => {
            console.log('🔔 New notification received:', notification);
          });

          setSocket(newSocket);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Socket initialization error:", error);
        setLoading(false);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        console.log('🔌 Disconnecting socket...');
        socket.disconnect();
      }
    };
  }, [user]);

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    loading,
    refreshing,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    markAllAsReadInDB,
    handleDeleteNotification,
    formatDate,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;