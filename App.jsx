import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from './app/context/AppContext';
import AppNavigator from './app/navigation/AppNavigator';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Hide the splash screen after the app has loaded
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    
    // Delay to show our custom splash screen
    setTimeout(hideSplashScreen, 1000);
  }, []);

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AppProvider>
  );
}

