import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import tw from "twrnc";

const AuthLoadingScreen = () => {
  const navigation = useNavigation();
  const { login } = useAppContext();

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      user && user.id ? (login(user), navigation.reset({ index: 0, routes: [{ name: "Main" }] })): navigation.reset({ index: 0, routes: [{ name: "GetStarted" }] });
    };

    checkAuth();
  }, []);

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <ActivityIndicator size="large" color="#999" />
    </View>
  );
};

export default AuthLoadingScreen;
