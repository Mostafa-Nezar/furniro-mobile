import React, { useState } from "react";
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
      } else {
        Alert.alert(
          "Login Error",
          result.message || "Invalid login credentials"
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: theme.white }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6`}>
        {/* Logo */}
        <View style={tw`items-center mb-8`}>
          <Image
            source={require("../../assets/images/Meubel House_Logos-05.png")}
            style={tw`w-20 h-20 mb-4`}
            resizeMode="contain"
          />
          <Text
            style={[
              tw`text-3xl font-bold`,
              { color: theme.primary, fontFamily: "Poppins-Bold" },
            ]}
          >
            Furniro
          </Text>
          <Text
            style={[
              tw`text-lg mt-2`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            Welcome back!
          </Text>
        </View>

        {/* Email Field */}
        <View style={tw`mb-4`}>
          <Text
            style={[tw`text-base font-medium mb-2`, { color: theme.black }]}
          >
            Email Address
          </Text>
          <View
            style={[
              tw`flex-row items-center border rounded-lg px-4 py-3`,
              {
                borderColor: theme.lightGray,
                backgroundColor: theme.semiWhite,
              },
            ]}
          >
            <Icon name="email" size={20} color={theme.darkGray} />
            <TextInput
              style={[tw`flex-1 ml-3 text-base`, { color: theme.black }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.darkGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={tw`mb-6`}>
          <Text
            style={[tw`text-base font-medium mb-2`, { color: theme.black }]}
          >
            Password
          </Text>
          <View
            style={[
              tw`flex-row items-center border rounded-lg px-4 py-3`,
              {
                borderColor: theme.lightGray,
                backgroundColor: theme.semiWhite,
              },
            ]}
          >
            <Icon name="lock" size={20} color={theme.darkGray} />
            <TextInput
              style={[tw`flex-1 ml-3 text-base`, { color: theme.black }]}
              placeholder="Enter your password"
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

        {/* Login Button */}
        <TouchableOpacity
          onPress={async () => {
            await handleEmailLogin();
            navigation.reset({ index: 0, routes: [{ name: "Main" }] });
          }}
          disabled={loading}
          style={[
            tw`py-4 rounded-lg mb-4`,
            { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
          ]}
        >
          <Text
            style={[
              tw`text-center text-lg font-semibold`,
              { color: theme.white, fontFamily: "Poppins-SemiBold" },
            ]}
          >
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={tw`flex-row items-center mb-4`}>
          <View
            style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]}
          />
          <Text
            style={[
              tw`mx-4 text-sm`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            or
          </Text>
          <View
            style={[tw`flex-1 h-px`, { backgroundColor: theme.lightGray }]}
          />
        </View>

        {/* Google Login */}
        <TouchableOpacity
          onPress={() => Alert.alert("Coming Soon")}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white },
          ]}
        >
          <Icon name="google" size={20} color="#DB4437" />
          <Text
            style={[
              tw`ml-3 text-base font-medium`,
              { color: theme.black, fontFamily: "Poppins-Medium" },
            ]}
          >
            Sign in with Google
          </Text>
        </TouchableOpacity>

        {/* Facebook Login */}
        <TouchableOpacity
          onPress={() => Alert.alert("Coming Soon")}
          style={[
            tw`flex-row items-center justify-center py-3 rounded-lg mb-6 border`,
            { borderColor: theme.lightGray, backgroundColor: theme.white },
          ]}
        >
          <Icon name="facebook" size={20} color="#4267B2" />
          <Text
            style={[
              tw`ml-3 text-base font-medium`,
              { color: theme.black, fontFamily: "Poppins-Medium" },
            ]}
          >
            Sign in with Facebook
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={tw`flex-row justify-center`}>
          <Text
            style={[
              tw`text-base`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text
              style={[
                tw`text-base font-semibold`,
                { color: theme.primary, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Login */}
        <TouchableOpacity
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "Main" }] })
          }
          style={tw`mt-6`}
        >
          <Text
            style={[
              tw`text-center text-base`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            Skip login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
