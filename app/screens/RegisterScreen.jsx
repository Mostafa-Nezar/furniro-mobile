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
import { Formik } from 'formik';
import * as Yup from 'yup';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { theme, login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const result = await ApiService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        login(result.user);
        Alert.alert('Success', 'Account created successfully', [
           navigation.replace('Main') 
        ]);
      } else {
        Alert.alert('Registration Error', result.message || 'An error occurred');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        <View style={tw`items-center mb-8`}>
          <Image
            source={require('../../assets/images/Meubel House_Logos-05.png')}
            style={tw`w-20 h-20 mb-4`}
            resizeMode="contain"
          />
          <Text style={[tw`text-3xl font-bold`, { color: theme.primary }]}>Furniro</Text>
          <Text style={[tw`text-lg mt-2`, { color: theme.darkGray }]}>Create New Account</Text>
        </View>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              {/* Name */}
              <View style={tw`mb-4`}>
                <Text style={[tw`mb-2 text-base font-medium`, { color: theme.black }]}>Full Name</Text>
                <View style={[
                  tw`flex-row items-center border rounded-lg px-4 py-3`,
                  { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
                ]}>
                  <Icon name="person" size={20} color={theme.darkGray} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base`}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.darkGray}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                  />
                </View>
                {touched.name && errors.name && <Text style={tw`text-red-500 text-sm mt-1`}>{errors.name}</Text>}
              </View>

              {/* Email */}
              <View style={tw`mb-4`}>
                <Text style={[tw`mb-2 text-base font-medium`, { color: theme.black }]}>Email Address</Text>
                <View style={[
                  tw`flex-row items-center border rounded-lg px-4 py-3`,
                  { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
                ]}>
                  <Icon name="email" size={20} color={theme.darkGray} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base`}
                    placeholder="Enter your email address"
                    placeholderTextColor={theme.darkGray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                </View>
                {touched.email && errors.email && <Text style={tw`text-red-500 text-sm mt-1`}>{errors.email}</Text>}
              </View>

              {/* Password */}
              <View style={tw`mb-4`}>
                <Text style={[tw`mb-2 text-base font-medium`, { color: theme.black }]}>Password</Text>
                <View style={[
                  tw`flex-row items-center border rounded-lg px-4 py-3`,
                  { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
                ]}>
                  <Icon name="lock" size={20} color={theme.darkGray} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base`}
                    placeholder="Enter password"
                    placeholderTextColor={theme.darkGray}
                    secureTextEntry={!showPassword}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={theme.darkGray} />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && <Text style={tw`text-red-500 text-sm mt-1`}>{errors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={tw`mb-6`}>
                <Text style={[tw`mb-2 text-base font-medium`, { color: theme.black }]}>Confirm Password</Text>
                <View style={[
                  tw`flex-row items-center border rounded-lg px-4 py-3`,
                  { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
                ]}>
                  <Icon name="lock" size={20} color={theme.darkGray} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base`}
                    placeholder="Re-enter password"
                    placeholderTextColor={theme.darkGray}
                    secureTextEntry={!showConfirmPassword}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color={theme.darkGray} />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && <Text style={tw`text-red-500 text-sm mt-1`}>{errors.confirmPassword}</Text>}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  tw`py-4 rounded-lg mb-4`,
                  { backgroundColor: theme.primary, opacity: isSubmitting ? 0.6 : 1 },
                ]}
              >
                <Text style={tw`text-center text-lg font-semibold text-white`}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        {/* Divider */}
        <View style={tw`flex-row items-center mb-4`}>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
          <Text style={[tw`mx-4 text-sm`, { color: theme.darkGray }]}>or</Text>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
        </View>

        {/* Google */}
        <TouchableOpacity
          onPress={() => Alert.alert('Google sign-up not implemented')}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <Icon name="google" size={20} color="#DB4437" />
          <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>
            Sign up with Google
          </Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          onPress={() => Alert.alert('Facebook sign-up not implemented')}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-6 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <Icon name="facebook" size={20} color="#4267B2" />
          <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>
            Sign up with Facebook
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={tw`flex-row justify-center`}>
          <Text style={[tw`text-base`, { color: theme.darkGray }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[tw`text-base font-semibold`, { color: theme.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
