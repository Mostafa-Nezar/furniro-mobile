import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useSocket } from "./app/context/SocketContext";
import { AppProvider, useAppContext } from "./app/context/AppContext";
import { SocketProvider } from "./app/context/SocketContext";
import AppNavigator from "./app/navigation/AppNavigator";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import tw from "twrnc";
import { AuthProvider } from "./app/context/AuthContext";
import { CartProvider } from "./app/context/CartContext";
import { StripeProvider } from '@stripe/stripe-react-native';
import { View } from "react-native";
SplashScreen.preventAutoHideAsync();


const InnerApp = () => {

  const { theme, isDarkMode } = useAppContext();
  const { unreadCount } = useSocket();
  const toastConfig = {
    success: (props) => ( <BaseToast {...props} style={[ tw`rounded-lg`, { borderLeftColor: theme.green, backgroundColor: theme.semiWhite } ]} contentContainerStyle={tw`px-4`} text1Style={[ tw`text-base font-bold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]} text2Style={[ tw`text-sm`,{ color: theme.darkGray, fontFamily: "Poppins-Regular" }]}/>),
    error: (props) => ( <ErrorToast {...props} style={[ tw`rounded-lg`, { borderLeftColor: theme.red, backgroundColor: theme.semiWhite}]} contentContainerStyle={tw`px-4`} text1Style={[ tw`text-base font-bold`, { color: theme.black, fontFamily: "Poppins-SemiBold" } ]} text2Style={[ tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" } ]} />),
  };
useEffect(() => {
  (async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      try {
        await Notifications.setBadgeCountAsync(unreadCount);
        const current = await Notifications.getBadgeCountAsync();
        console.log("✅ Badge set successfully. Current count:", current);
      } catch (error) {
        console.warn("⚠️ Error setting badge:", error);
      }
    } else {
      console.log("⚠️ Notification permission not granted");
    }
  })();
      const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    setTimeout(hideSplashScreen, 1000);
}, []);


  return (<>
          <View style={[tw`p-3`, { backgroundColor: isDarkMode ? theme.red : theme.primary }]} />
          <StatusBar style={isDarkMode ? "dark" : "light"} backgroundColor={ isDarkMode ? theme.red : theme.red } />
          <AppNavigator />
          <Toast config={toastConfig} />
        </>);
  };

export default function App() {
  return (
  <StripeProvider publishableKey="pk_test_51RfzAo4hpzh6swtTe5XoqvV6DcUlufkptuTb7Q4DKfuVgnDDH76ICrTlrw8pXwKGpHscUSZCr9vwniO6e0zc0VT900tEcvmgjR">
    <AuthProvider>
      <CartProvider>
    <AppProvider>
      <SocketProvider>
        <InnerApp />
      </SocketProvider>
    </AppProvider>
      </CartProvider>
    </AuthProvider>
  </StripeProvider>
  );
}
