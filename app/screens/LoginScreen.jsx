import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext(), {  login, GoogleSignup } = useAuth();
  const [loading, setLoading] = useState(false), [showPassword, setShowPassword] = useState(false);
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email").required("Email Required"),
    password: Yup.string().required("PassWord Required"),
  });
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      Toast.show({ type: result.success ? "success" : "error", text1: result.success ? "Login Successfully" : "Login Error", text2: result.success ? "Welcome" : result.message || "false data"});
      if (result.success) navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (error) {
      Toast.show({ type: "error", text1: "Login Error", text2: error.message || "try again later" });
    } finally {
      setLoading(false);
    }
  };
  const InputField = ({ icon, placeholder, value, onChangeText, onBlur, error, secure, showToggle, toggle }) => (
    <View style={tw`mb-4`}>
      <View style={[tw`flex-row items-center border rounded-lg px-4 py-3`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }]}>
        <Icon name={icon} size={20} color={theme.darkGray} />
        <TextInput style={[tw`flex-1 ml-3 text-base`, { color: theme.black }]} placeholder={placeholder} placeholderTextColor={theme.darkGray} secureTextEntry={secure && !showToggle} value={value} onChangeText={onChangeText} onBlur={onBlur} autoCapitalize="none"/>
        {secure && (
          <TouchableOpacity onPress={toggle}>
            <Icon name={showToggle ? "visibility" : "visibility-off"} size={20} color={theme.darkGray} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[tw`text-sm mt-1 ml-2`, { color: "red" }]}>{error}</Text>}
    </View>
  );
  return (
    <KeyboardAvoidingView style={[tw`flex-1`, { backgroundColor: theme.white }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        <View style={tw`flex-row items-center justify-center mb-8`}>
          <Image source={require("../../assets/images/Meubel House_Logos-05.png")} style={tw`w-12 h-12 mr-3`} resizeMode="contain" />
          <Text style={[tw`text-3xl font-bold`, { color: theme.black }]}>Furniro</Text>
        </View>
        <Text style={[tw`text-lg text-center mb-6`, { color: theme.darkGray }]}>Welcome back!</Text>
        <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={handleLogin}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <InputField icon="email" placeholder="Enter your email" value={values.email} onChangeText={handleChange("email")} onBlur={handleBlur("email")} error={touched.email && errors.email} />
              <InputField icon="lock" placeholder="Enter your password" value={values.password} onChangeText={handleChange("password")} onBlur={handleBlur("password")} error={touched.password && errors.password} secure showToggle={showPassword} toggle={() => setShowPassword(!showPassword)} />
              <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[tw`py-4 rounded-lg mb-4`, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}>
                <Text style={[tw`text-center text-lg font-semibold`, { color: theme.white }]}>{loading ? "Logging in..." : "Login"}</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
          <Text style={[tw`mx-4 text-sm`, { color: theme.darkGray }]}>or</Text>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
        </View>
        <TouchableOpacity onPress={GoogleSignup} style={[tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`, { borderColor: theme.lightGray, backgroundColor: theme.white }]}>
          <Image source={require("../../assets/g.png")} style={{ width: 20, height: 20 }} resizeMode="contain"/>
          <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>Sign in with Google</Text>
        </TouchableOpacity>
        <View style={tw`flex-row justify-center`}>
          <Text style={[tw`text-base`, { color: theme.darkGray }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={[tw`text-base font-semibold`, { color: theme.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: "Main" }] })} style={tw`mt-6`}>
          <Text style={[tw`text-center text-base`, { color: theme.darkGray }]}>Skip login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;