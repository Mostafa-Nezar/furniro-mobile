import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import tw from 'twrnc';
import { useAuth } from '../context/AuthContext';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext(), { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace(user ? 'Main' : 'Login'), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const textStyle = (size, font) => [tw`${size}`, { color: theme.white, fontFamily: font }];

  return (
    <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme.primary }]}>
      <Animated.View style={[tw`items-center`, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={require('../../assets/images/Meubel House_Logos-05.png')} style={tw`w-32 h-32 mb-6`} resizeMode="contain" />
        <Text style={textStyle('text-4xl font-bold mb-2', 'Poppins-Bold')}>Furniro</Text>
        <Text style={textStyle('text-lg', 'Poppins-Regular')}>Modern & Elegant Furniture</Text>
      </Animated.View>
      <Animated.View style={[tw`absolute bottom-12`, { opacity: fadeAnim }]}>
        <Text style={textStyle('text-sm', 'Poppins-Regular')}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
