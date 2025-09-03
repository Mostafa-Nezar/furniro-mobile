import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider, useAppContext } from "./app/context/AppContext";
import { SocketProvider } from "./app/context/SocketContext";
import AppNavigator from "./app/navigation/AppNavigator";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import tw from "twrnc";
import { AuthProvider } from "./app/context/AuthContext";
import { CartProvider } from "./app/context/CartContext";

SplashScreen.preventAutoHideAsync();

const InnerApp = () => {
  const { theme, isDarkMode } = useAppContext();

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    setTimeout(hideSplashScreen, 1000);
  }, []);

  const toastConfig = {
    success: (props) => ( <BaseToast {...props} style={[ tw`rounded-lg`, { borderLeftColor: theme.green, backgroundColor: theme.semiWhite } ]} contentContainerStyle={tw`px-4`} text1Style={[ tw`text-base font-bold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]} text2Style={[ tw`text-sm`,{ color: theme.darkGray, fontFamily: "Poppins-Regular" }]}/>),
    error: (props) => ( <ErrorToast {...props} style={[ tw`rounded-lg`, { borderLeftColor: theme.red, backgroundColor: theme.semiWhite}]} contentContainerStyle={tw`px-4`} text1Style={[ tw`text-base font-bold`, { color: theme.black, fontFamily: "Poppins-SemiBold" } ]} text2Style={[ tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" } ]} />),
  };

  return (<>
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? theme.semiWhite : theme.primary}/>
          <AppNavigator />
          <Toast config={toastConfig} />
        </>);
  };

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
    <AppProvider>
      <SocketProvider>
        <InnerApp />
      </SocketProvider>
    </AppProvider>
      </CartProvider>
    </AuthProvider>
  );
}
