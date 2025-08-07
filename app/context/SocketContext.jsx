import { createContext, useContext, useEffect, useState } from 'react';
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
          
          const newSocket = io('https://furniro-back-production.up.railway.app/api', {
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

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
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

