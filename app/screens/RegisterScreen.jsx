import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { ApiService } from '../services/ApiService';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { theme, login } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password and confirm password do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.register({
        name,
        email,
        password
      });
      
      if (result.success) {
        login(result.user);
        Alert.alert('Registration Successful', 'Your account has been created successfully', [
          { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
        ]);
      } else {
        Alert.alert('Registration Error', result.message || 'An error occurred while creating account');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      if (result.success) {
        login(result.user);
        navigation.navigate('Home');
      } else {
        Alert.alert('خطأ في التسجيل', result.error);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التسجيل بـ Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookRegister = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithFacebook();
      if (result.success) {
        login(result.user);
        navigation.navigate('Home');
      } else {
        Alert.alert('خطأ في التسجيل', result.error);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التسجيل بـ Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        {/* Logo and Title */}
        <View style={tw`items-center mb-8`}>
          <Image
            source={require('../../assets/images/Meubel House_Logos-05.png')}
            style={tw`w-20 h-20 mb-4`}
            resizeMode="contain"
          />
          <Text style={[
            tw`text-3xl font-bold`,
            { color: theme.primary, fontFamily: 'Poppins-Bold' }
          ]}>
            Furniro
          </Text>
          <Text style={[
            tw`text-lg mt-2`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            Create New Account
          </Text>
        </View>

        {/* Name Input */}
        <View style={tw`mb-4`}>
          <Text style={[
            tw`text-base font-medium mb-2`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Full Name
          </Text>
          <View style={[
            tw`flex-row items-center border rounded-lg px-4 py-3`,
            { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
          ]}>
            <Icon name="person" size={20} color={theme.darkGray} />
            <TextInput
              style={[
                tw`flex-1 ml-3 text-base`,
                { color: theme.black, fontFamily: 'Poppins-Regular' }
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.darkGray}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={tw`mb-4`}>
          <Text style={[
            tw`text-base font-medium mb-2`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Email Address
          </Text>
          <View style={[
            tw`flex-row items-center border rounded-lg px-4 py-3`,
            { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
          ]}>
            <Icon name="email" size={20} color={theme.darkGray} />
            <TextInput
              style={[
                tw`flex-1 ml-3 text-base`,
                { color: theme.black, fontFamily: 'Poppins-Regular' }
              ]}
              placeholder="Enter your email address"
              placeholderTextColor={theme.darkGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={tw`mb-4`}>
          <Text style={[
            tw`text-base font-medium mb-2`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Password
          </Text>
          <View style={[
            tw`flex-row items-center border rounded-lg px-4 py-3`,
            { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
          ]}>
            <Icon name="lock" size={20} color={theme.darkGray} />
            <TextInput
              style={[
                tw`flex-1 ml-3 text-base`,
                { color: theme.black, fontFamily: 'Poppins-Regular' }
              ]}
              placeholder="Enter password (at least 6 characters)"
              placeholderTextColor={theme.darkGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={theme.darkGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={tw`mb-6`}>
          <Text style={[
            tw`text-base font-medium mb-2`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Confirm Password
          </Text>
          <View style={[
            tw`flex-row items-center border rounded-lg px-4 py-3`,
            { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
          ]}>
            <Icon name="lock" size={20} color={theme.darkGray} />
            <TextInput
              style={[
                tw`flex-1 ml-3 text-base`,
                { color: theme.black, fontFamily: 'Poppins-Regular' }
              ]}
              placeholder="Re-enter password"
              placeholderTextColor={theme.darkGray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={20}
                color={theme.darkGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={[
            tw`py-4 rounded-lg mb-4`,
            { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }
          ]}
        >
          <Text style={[
            tw`text-center text-lg font-semibold`,
            { color: theme.white, fontFamily: 'Poppins-SemiBold' }
          ]}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={tw`flex-row items-center mb-4`}>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
          <Text style={[
            tw`mx-4 text-sm`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            or
          </Text>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
        </View>

        {/* Social Register Buttons */}
        <TouchableOpacity
          onPress={handleGoogleRegister}
          disabled={loading}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <Icon name="google" size={20} color="#DB4437" />
          <Text style={[
            tw`ml-3 text-base font-medium`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Sign up with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFacebookRegister}
          disabled={loading}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-6 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <Icon name="facebook" size={20} color="#4267B2" />
          <Text style={[
            tw`ml-3 text-base font-medium`,
            { color: theme.black, fontFamily: 'Poppins-Medium' }
          ]}>
            Sign up with Facebook
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={tw`flex-row justify-center`}>
          <Text style={[
            tw`text-base`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[
              tw`text-base font-semibold`,
              { color: theme.primary, fontFamily: 'Poppins-SemiBold' }
            ]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

