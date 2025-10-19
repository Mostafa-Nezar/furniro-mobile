import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext();
  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const checkAuth = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem('user'));
        if (user && user.id) login(user);
        setTimeout(() => {
          navigation.replace(user && user.id ? 'Main' : 'GetStarted');
        }, 2000);
      } catch (e) {
        console.log(e);
        navigation.replace('GetStarted');
      }
    };

    checkAuth();
  }, []);

  const textStyle = (size, font) => [tw`${size}`, { color: theme.white, fontFamily: font }];

  return (
    <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme.primary }]}>
      <Animated.View
        style={[tw`items-center rounded-lg`, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={require('../../assets/myicon.png')} style={tw`w-32 h-32 mb-6 rounded-lg`} resizeMode="contain"/>
        <Text style={textStyle('text-4xl font-bold mb-2', 'Poppins-Bold')}>Furniro</Text>
        <Text style={textStyle('text-lg', 'Poppins-Regular')}>Modern & Elegant Furniture</Text>
      </Animated.View>

      <Animated.View style={[tw`absolute bottom-12`, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color={theme.white} />
        <Text style={textStyle('text-sm mt-2', 'Poppins-Regular')}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
