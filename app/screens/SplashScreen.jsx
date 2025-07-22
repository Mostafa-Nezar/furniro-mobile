import React, { useEffect } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import tw from 'twrnc';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { theme, user } = useAppContext();

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Delay then redirect
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={[
      tw`flex-1 justify-center items-center`,
      { backgroundColor: theme.primary }
    ]}>
      <Animated.View
        style={[
          tw`items-center`,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/Meubel House_Logos-05.png')}
          style={tw`w-32 h-32 mb-6`}
          resizeMode="contain"
        />

        <Text style={[
          tw`text-4xl font-bold mb-2`,
          { color: theme.white, fontFamily: 'Poppins-Bold' }
        ]}>
          Furniro
        </Text>

        <Text style={[
          tw`text-lg`,
          { color: theme.white, fontFamily: 'Poppins-Regular' }
        ]}>
          Modern & Elegant Furniture
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          tw`absolute bottom-12`,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={[
          tw`text-sm`,
          { color: theme.white, fontFamily: 'Poppins-Regular' }
        ]}>
          Loading...
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
