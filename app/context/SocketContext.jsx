import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. إنشاء الـ Context
const SocketContext = createContext();

// عنوان الـ API الخاص بالإشعارات
const API = "https://furniro-back-production.up.railway.app/api/notifications";

// 2. Hook مخصص لتسهيل استخدام الـ Context
export const useSocket = ( ) => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// 3. الـ Provider الذي سيحتوي على كل منطق الـ Socket
export const SocketProvider = ({ children }) => {
  // --- الحالات (States) ---
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- دوال مساعدة ---
  const getToken = () => AsyncStorage.getItem("token");

  // --- دوال التعامل مع الـ API ---

  /**
   * جلب الإشعارات من الخادم وتحديث الحالات المتعلقة بها
   */
  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const userString = await AsyncStorage.getItem("user");
      if (!token || !userString) return;

      const user = JSON.parse(userString);
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        // فلترة الإشعارات لتشمل فقط إشعارات المستخدم الحالي
        const userNotifications = (data.notifications || []).filter(n => n.userId === user.id);
        setNotifications(userNotifications);
        // حساب عدد الإشعارات غير المقروءة وتحديث الحالة
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * تحديث حالة كل الإشعارات إلى "مقروءة" في قاعدة البيانات
   */
  const markAllAsReadInDB = async () => {
    try {
      const token = await getToken();
      await fetch(`${API}/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      // بعد التحديث في قاعدة البيانات، نجعل العدد في الواجهة صفرًا
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  /**
   * حذف إشعار معين من قاعدة البيانات وتحديث الواجهة
   */
  const handleDeleteNotification = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // تحديث الواجهة فورًا بعد الحذف الناجح
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  /**
   * تنسيق تاريخ الإشعار لعرضه بشكل سهل القراءة
   */
  const formatDate = (str) => {
    const date = new Date(str);
    const now = new Date();
    const diff = (now - date) / 60000; // الفارق بالدقائق

    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // --- التأثير الرئيسي (useEffect) لتهيئة الـ Socket ---
  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userString = await AsyncStorage.getItem('user');

        if (token && userString) {
          // *** التعديل الرئيسي هنا ***
          // أولاً، نقوم بجلب الإشعارات الحالية من قاعدة البيانات
          // هذا يضمن أن unreadCount له القيمة الصحيحة عند بدء التشغيل
          await fetchNotifications();

          // ثانيًا، نقوم بتهيئة اتصال الـ Socket
          const userData = JSON.parse(userString);
          const newSocket = io('https://furniro-back-production.up.railway.app', {
            auth: { token: token }
          } );

          // --- أحداث الـ Socket ---
          newSocket.on('connect', () => {
            console.log('✅ Connected to socket server');
            setConnected(true);
            // الانضمام إلى غرفة خاصة بالمستخدم لتلقي الإشعارات الموجهة له
            if (userData?.id) {
              newSocket.emit('join', userData.id);
            }
          });

          newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
            setConnected(false);
          });

          newSocket.on('newNotification', (notification) => {
            console.log('🔔 New notification received:', notification);
            // إضافة الإشعار الجديد إلى بداية القائمة
            setNotifications(prev => [notification, ...prev]);
            // زيادة عدد الإشعارات غير المقروءة فورًا
            setUnreadCount(prev => prev + 1);
          });

          setSocket(newSocket);
        } else {
          // إذا لم يكن المستخدم مسجلاً دخوله، نتوقف عن التحميل
          setLoading(false);
        }
      } catch (error) {
        console.error("Socket initialization error:", error);
        setLoading(false);
      }
    };

    initSocket();

    // دالة التنظيف: يتم استدعاؤها عند إزالة المكون
    return () => {
      if (socket) {
        console.log('🔌 Disconnecting socket...');
        socket.disconnect();
      }
    };
  }, []); // المصفوفة الفارغة تضمن أن هذا التأثير يعمل مرة واحدة فقط

  // --- القيمة التي سيوفرها الـ Context ---
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
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
