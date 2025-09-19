import { View, Text, TouchableOpacity } from 'react-native'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from 'react';
import Toast from "react-native-toast-message";
import tw from "twrnc";

export default function RegisterScreen2() {
  const [myuser, setmyuser] = useState(null); 

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '866938789864-hfj30l2ktsbdb4t78r3cl1lj3p4vehmh.apps.googleusercontent.com',
      offlineAccess: true
    })
  }, []);

  const GoogleSignup = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo.idToken;

      const res = await fetch('https://furniro-back-production.up.railway.app/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (data.user && data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        setmyuser(data.user);

        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.msg || 'Google sign-up error' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleGoogleSignup = async () => {
    const result = await GoogleSignup();
    if (result.success) {
      Toast.show({ type: 'success', text1: 'Google account created!' });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: result.message || 'Something went wrong',
      });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleGoogleSignup}
        style={[
          tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
          { borderColor: "#ccc", backgroundColor: "#fff" }
        ]}
      >
        <Text style={[tw`ml-3 text-base font-medium`, { color: "#000" }]}>
          Sign up with Google
        </Text>
      </TouchableOpacity>

      {myuser && (
        <Text style={{ marginTop: 10, color: "green" }}>
          Logged in as {user.fullName || user.email}
        </Text>
      )}
    </View>
  );
}
