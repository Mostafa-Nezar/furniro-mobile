import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { theme, login, register } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6).required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

const handleRegister = async (values, { setSubmitting }) => {
  try {
    const result = await register(values); 

    if (result.success) {
      login(result.user);
      Alert.alert('Success', 'Account created successfully');
      navigation.replace('Main');
    } else {
      Alert.alert("Registration Error", result.message || "Something went wrong");
    }
  } catch (error) {
    Alert.alert("Error", error.message || "An error occurred");
  } finally {
    setSubmitting(false);
  }
};


  const InputField = ({ icon, placeholder, secure, value, onChange, onBlur, toggleSecure, show, error, touched }) => (
    <View style={tw`mb-4`}>
      <View style={[
        tw`flex-row items-center border rounded-lg px-4 py-3`,
        { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
      ]}>
        <Icon name={icon} size={20} color={theme.darkGray} />
        <TextInput
          style={tw`flex-1 ml-3 text-base`}
          placeholder={placeholder}
          placeholderTextColor={theme.darkGray}
          secureTextEntry={secure && !show}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
        />
        {secure && (
          <TouchableOpacity onPress={toggleSecure}>
            <Icon name={show ? 'visibility' : 'visibility-off'} size={20} color={theme.darkGray} />
          </TouchableOpacity>
        )}
      </View>
      {touched && error && <Text style={tw`text-red-500 text-sm mt-1`}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        {/* Logo and Title */}
        <View style={tw`items-center flex-row justify-center mb-8`}>
          <Image
            source={require('../../assets/images/Meubel House_Logos-05.png')}
            style={tw`w-12 h-12 mr-3`}
            resizeMode="contain"
          />
          <Text style={[tw`text-3xl font-bold`, { color: theme.black }]}>Furniro</Text>
        </View>

        <Text style={[tw`text-lg text-center mb-6`, { color: theme.darkGray }]}>Create New Account</Text>

        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <InputField
                icon="person"
                placeholder="Full Name"
                value={values.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                error={errors.name}
                touched={touched.name}
              />
              <InputField
                icon="email"
                placeholder="Email Address"
                value={values.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                touched={touched.email}
              />
              <InputField
                icon="lock"
                placeholder="Password"
                secure
                value={values.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                toggleSecure={() => setShowPassword(!showPassword)}
                show={showPassword}
                error={errors.password}
                touched={touched.password}
              />
              <InputField
                icon="lock"
                placeholder="Confirm Password"
                secure
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                toggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
                show={showConfirmPassword}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />

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

        {/* Social Buttons */}
        {[{
          name: 'google',
          color: '#DB4437',
          text: 'Sign up with Google',
        }, {
          name: 'facebook',
          color: '#4267B2',
          text: 'Sign up with Facebook',
        }].map(({ name, color, text }, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => Alert.alert(`${text} not implemented`)}
            style={[
              tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
              { borderColor: theme.lightGray, backgroundColor: theme.white }
            ]}
          >
            <FAIcon name={name} size={20} color={color} />
            <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>{text}</Text>
          </TouchableOpacity>
        ))}

        {/* Already have account */}
        <View style={tw`flex-row justify-center mt-2`}>
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