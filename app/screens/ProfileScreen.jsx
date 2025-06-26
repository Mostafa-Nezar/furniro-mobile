import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { AuthService } from '../services/AuthService';
import Header from '../components/Header';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { 
    theme, 
    user, 
    isAuthenticated, 
    logout, 
    isDarkMode, 
    toggleTheme,
    cart,
    favorites 
  } = useAppContext();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تسجيل الخروج', 
          style: 'destructive',
          onPress: async () => {
            await AuthService.signOut();
            logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'favorite',
      title: 'المفضلة',
      subtitle: `${favorites.length} منتج`,
      onPress: () => {
        // Navigate to favorites screen
        Alert.alert('المفضلة', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'history',
      title: 'تاريخ الطلبات',
      subtitle: 'عرض طلباتك السابقة',
      onPress: () => {
        Alert.alert('تاريخ الطلبات', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'location-on',
      title: 'العناوين',
      subtitle: 'إدارة عناوين التوصيل',
      onPress: () => {
        Alert.alert('العناوين', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'payment',
      title: 'طرق الدفع',
      subtitle: 'إدارة بطاقات الدفع',
      onPress: () => {
        Alert.alert('طرق الدفع', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'notifications',
      title: 'الإشعارات',
      subtitle: 'إعدادات الإشعارات',
      onPress: () => {
        Alert.alert('الإشعارات', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'help',
      title: 'المساعدة والدعم',
      subtitle: 'الأسئلة الشائعة والدعم',
      onPress: () => {
        Alert.alert('المساعدة', 'ستتم إضافة هذه الميزة قريباً');
      }
    },
    {
      icon: 'info',
      title: 'حول التطبيق',
      subtitle: 'معلومات التطبيق والإصدار',
      onPress: () => {
        Alert.alert('حول التطبيق', 'Furniro Mobile v1.0.0\nتطبيق للأثاث المنزلي العصري');
      }
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
        <Header title="الملف الشخصي" showBack={false} showCart={false} />
        
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <Icon name="person" size={80} color={theme.darkGray} />
          <Text style={[
            tw`text-xl font-bold mt-4 text-center`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            مرحباً بك في Furniro
          </Text>
          <Text style={[
            tw`text-base mt-2 text-center`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            سجل دخولك للوصول إلى ملفك الشخصي وميزات أخرى
          </Text>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[
              tw`py-4 px-8 rounded-lg mt-6`,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-lg font-semibold`,
              { color: theme.white, fontFamily: 'Poppins-SemiBold' }
            ]}>
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={[
              tw`py-3 px-8 mt-3 border rounded-lg`,
              { borderColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-base font-semibold`,
              { color: theme.primary, fontFamily: 'Poppins-SemiBold' }
            ]}>
              إنشاء حساب جديد
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="الملف الشخصي" showBack={false} showCart={false} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={[
          tw`p-6 items-center`,
          { backgroundColor: theme.lightBeige }
        ]}>
          <View style={[
            tw`w-24 h-24 rounded-full items-center justify-center mb-4`,
            { backgroundColor: theme.primary }
          ]}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={tw`w-24 h-24 rounded-full`}
                resizeMode="cover"
              />
            ) : (
              <Icon name="person" size={40} color={theme.white} />
            )}
          </View>
          
          <Text style={[
            tw`text-xl font-bold mb-1`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            {user?.name || 'المستخدم'}
          </Text>
          
          <Text style={[
            tw`text-base`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            {user?.email || 'user@example.com'}
          </Text>
          
          <View style={tw`flex-row mt-4`}>
            <View style={tw`items-center mx-4`}>
              <Text style={[
                tw`text-lg font-bold`,
                { color: theme.primary, fontFamily: 'Poppins-Bold' }
              ]}>
                {cart.length}
              </Text>
              <Text style={[
                tw`text-sm`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                في السلة
              </Text>
            </View>
            
            <View style={tw`items-center mx-4`}>
              <Text style={[
                tw`text-lg font-bold`,
                { color: theme.primary, fontFamily: 'Poppins-Bold' }
              ]}>
                {favorites.length}
              </Text>
              <Text style={[
                tw`text-sm`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                المفضلة
              </Text>
            </View>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[
          tw`flex-row items-center justify-between p-4 mx-4 mt-4 rounded-lg`,
          { backgroundColor: theme.semiWhite }
        ]}>
          <View style={tw`flex-row items-center`}>
            <Icon 
              name={isDarkMode ? "dark-mode" : "light-mode"} 
              size={24} 
              color={theme.primary} 
            />
            <View style={tw`ml-3`}>
              <Text style={[
                tw`text-base font-semibold`,
                { color: theme.black, fontFamily: 'Poppins-SemiBold' }
              ]}>
                الوضع الليلي
              </Text>
              <Text style={[
                tw`text-sm`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                {isDarkMode ? 'مفعل' : 'غير مفعل'}
              </Text>
            </View>
          </View>
          
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.lightGray, true: theme.primary }}
            thumbColor={theme.white}
          />
        </View>

        {/* Menu Items */}
        <View style={tw`px-4 mt-4`}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={[
                tw`flex-row items-center p-4 mb-2 rounded-lg`,
                { backgroundColor: theme.semiWhite }
              ]}
            >
              <Icon name={item.icon} size={24} color={theme.primary} />
              <View style={tw`flex-1 ml-3`}>
                <Text style={[
                  tw`text-base font-semibold`,
                  { color: theme.black, fontFamily: 'Poppins-SemiBold' }
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  tw`text-sm`,
                  { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
                ]}>
                  {item.subtitle}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.darkGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            tw`flex-row items-center justify-center p-4 mx-4 mt-6 mb-8 rounded-lg`,
            { backgroundColor: theme.red }
          ]}
        >
          <Icon name="logout" size={20} color={theme.white} />
          <Text style={[
            tw`ml-2 text-base font-semibold`,
            { color: theme.white, fontFamily: 'Poppins-SemiBold' }
          ]}>
            تسجيل الخروج
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

