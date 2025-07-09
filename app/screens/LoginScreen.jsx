import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme, login } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email").required("Email Required"),
    password: Yup.string().required("PassWord Required"),
  });

  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Login Successfully",
          text2: "Welcome",
        });
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: result.message || "البيانات غير صحيحة",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error.message || "يرجى المحاولة لاحقًا",
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, onBlur, error, secure, showToggle, toggle }) => (
    <View style={tw`mb-4`}>
      <View style={[
        tw`flex-row items-center border rounded-lg px-4 py-3`,
        { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
      ]}>
        <Icon name={icon} size={20} color={theme.darkGray} />
        <TextInput
          style={[tw`flex-1 ml-3 text-base`, { color: theme.black }]}
          placeholder={placeholder}
          placeholderTextColor={theme.darkGray}
          secureTextEntry={secure && !showToggle}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          autoCapitalize="none"
        />
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
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: theme.white }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        {/* Logo & Title */}
        <View style={tw`flex-row items-center justify-center mb-8`}>
          <Image
            source={require("../../assets/images/Meubel House_Logos-05.png")}
            style={tw`w-12 h-12 mr-3`}
            resizeMode="contain"
          />
          <Text style={[tw`text-3xl font-bold`, { color: theme.black }]}>Furniro</Text>
        </View>

        <Text style={[tw`text-lg text-center mb-6`, { color: theme.darkGray }]}>Welcome back!</Text>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <InputField
                icon="email"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                error={touched.email && errors.email}
              />
              <InputField
                icon="lock"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                error={touched.password && errors.password}
                secure
                showToggle={showPassword}
                toggle={() => setShowPassword(!showPassword)}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  tw`py-4 rounded-lg mb-4`,
                  { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }
                ]}
              >
                <Text style={[tw`text-center text-lg font-semibold`, { color: theme.white }]}>
                  {loading ? "Logging in..." : "Login"}
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
          onPress={() => Toast.show({
            type: "info",
            text1: "Soon",
            text2: "الميزة تحت التطوير",
          })}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <FAIcon name="google" size={20} color="#DB4437" />
          <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          onPress={() => Toast.show({
            type: "info",
            text1: "Soon",
            text2: "",
          })}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-6 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white }
          ]}
        >
          <FAIcon name="facebook" size={20} color="#4267B2" />
          <Text style={[tw`ml-3 text-base font-medium`, { color: theme.black }]}>
            Sign in with Facebook
          </Text>
        </TouchableOpacity>

        {/* Register */}
        <View style={tw`flex-row justify-center`}>
          <Text style={[tw`text-base`, { color: theme.darkGray }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={[tw`text-base font-semibold`, { color: theme.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Skip Login */}
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: "Main" }] })} style={tw`mt-6`}>
          <Text style={[tw`text-center text-base`, { color: theme.darkGray }]}>Skip login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
