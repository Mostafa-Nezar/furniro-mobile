import { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import { ApiService } from "../services/ApiService";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import FAIcon from "react-native-vector-icons/FontAwesome";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme, login } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.login(email, password);
      if (result.success) {
        login(result.user);
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        Alert.alert("Login Error", result.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, secure, showToggle, toggle }) => (
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
          autoCapitalize="none"
        />
        {secure && (
          <TouchableOpacity onPress={toggle}>
            <Icon name={showToggle ? "visibility" : "visibility-off"} size={20} color={theme.darkGray} />
          </TouchableOpacity>
        )}
      </View>
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

        {/* Email */}
        <InputField
          icon="email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <InputField
          icon="lock"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secure
          showToggle={showPassword}
          toggle={() => setShowPassword(!showPassword)}
        />

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleEmailLogin}
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

        {/* Divider */}
        <View style={tw`flex-row items-center mb-4`}>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
          <Text style={[tw`mx-4 text-sm`, { color: theme.darkGray }]}>or</Text>
          <View style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]} />
        </View>

        {/* Google */}
        <TouchableOpacity
          onPress={() => Alert.alert("Coming Soon")}
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
          onPress={() => Alert.alert("Coming Soon")}
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
