import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        
        if (token && user) {
          const userData = JSON.parse(user);
          
          const newSocket = io('http://localhost:3001', {
            auth: {
              token: token
            }
          });

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
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === notificationId 
                  ? { ...notif, read: true }
                  : notif
              )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          });

          setSocket(newSocket);
        }
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const markNotificationAsRead = (notificationId) => {
    if (socket && connected) {
      socket.emit('markNotificationRead', { 
        notificationId, 
        userId: socket.auth?.userId 
      });
    }
  };

  const sendTestNotification = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://localhost:3001/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test notification sent at ' + new Date().toLocaleTimeString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test notification sent:', data);
      } else {
        console.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    sendTestNotification,
    setNotifications,
    setUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

