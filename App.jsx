import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider, useAppContext } from "./app/context/AppContext";
import { SocketProvider } from "./app/context/SocketContext";
import AppNavigator from "./app/navigation/AppNavigator";

SplashScreen.preventAutoHideAsync();

function InnerApp() {
  const { theme, isDarkMode } = useAppContext();

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    setTimeout(hideSplashScreen, 1000);
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.semiWhite}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SocketProvider>
        <InnerApp />
      </SocketProvider>
    </AppProvider>
  );
}
