import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppContext } from "../context/AppContext.jsx";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home/HomeScreen.jsx";
import ShopScreen from "../screens/home/ShopScreen.jsx";
import CartScreen from "../screens/home/CartScreen.jsx";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import RegisterScreen from "../screens/auth/RegisterScreen.jsx";
import ProductDetailScreen from "../screens/details/ProductDetailScreen.jsx";
import ProfileScreen from "../screens/home/ProfileScreen/ProfileScreen.jsx";
import SearchScreen from "../screens/search/SearchScreen.jsx";
import SplashScreen from "../screens/auth/SplashScreen.jsx";
import NotificationsList from "../components/NotificationsList.jsx";
import GetStarted from "../screens/auth/GetStarted.jsx";
import Payment3 from "../screens/payments/payment3.jsx";
import Ordersuccessscreen from "../screens/payments/Ordersuccessscreen.jsx";
import { useCart } from "../context/CartContext.jsx";
import OrdersScreen from "../screens/details/OrdersScreen.jsx";
import OrderDetailsScreen from "../screens/details/OrderDetailsScreen.jsx";
import Paypal from "../screens/payments/Paypal.jsx";
import About from "../screens/home/About.jsx";
import Svg, { Path, G } from 'react-native-svg';
import Readmore from "../screens/details/Readmore.jsx";
import React from "react";
const Stack = createStackNavigator(), Tab = createBottomTabNavigator();

const AboutIcon = ({ color, size }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><Path fill={color} d="M16 19H3v-2h13zm5-10H3v2h18zM3 5v2h11V5zm14 0v2h4V5zm-6 8v2h10v-2zm-8 0v2h5v-2z"/></Svg>
  );
  const CustomTabBarButton = ({ children, onPress, accessibilityState, theme }) => {
    const animatedValue = React.useRef(new Animated.Value(1)).current;
    const isFocused = accessibilityState?.selected;
  
    const handlePress = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.25,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
  
      onPress();
    };
  
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", position: "relative" }}
      >
        {isFocused && (
          <View
            style={{
              position: "absolute",
              top: 0,
              width: "50%",
              height: 3,
              backgroundColor: theme.primary,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
            }}
          />
        )}
        <Animated.View style={{ transform: [{ scale: animatedValue }], alignItems: "center", justifyContent: "center" }}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  };

const TabNavigator = () => {
  const { theme } = useAppContext(), { cart } = useCart();
  const cartItemsCount = cart.reduce((t, i) => t + i.quantity, 0) || 0;
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarPosition:"top",
      tabBarPosition:"right",
      tabBarPosition:"bottom",
      tabBarStyle: { backgroundColor: theme.white, borderTopColor: theme.lightGray, paddingBottom: 5, paddingTop: 5, height: 60 },
      tabBarActiveTintColor: theme.primary, tabBarInactiveTintColor: theme.darkGray,
      tabBarLabelStyle: { fontSize: 12, fontFamily: "Poppins-Medium" },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: "home", Shop: "storefront", Cart: "cart", Profile: "person", About: "About", MyProfileScreen: "person", };
        return (
          <View style={{ position: "relative" }}>
             {route.name === "About" ? (
                <AboutIcon color={color} size={size} />
              ) : (
                <Ionicons name={icons[route.name]} size={size} color={color} />
              )}
            {route.name === "Cart" && cartItemsCount > 0 && (
              <View style={{ position: "absolute", top: -5, right: -10, backgroundColor: theme.red, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: theme.white, fontSize: 10, fontWeight: "bold" }}>{cartItemsCount > 9 ? "9+" : cartItemsCount}</Text>
              </View>
            )}
          </View>
        );
      },
      tabBarButton: (props) => <CustomTabBarButton {...props} theme={theme} />,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="About" component={About} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useAppContext();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.white } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Ordersuccessscreen" component={Ordersuccessscreen} />
        <Stack.Screen name="Payment3" component={Payment3} />
        <Stack.Screen name="Paypal" component={Paypal} />
        <Stack.Screen name="NotificationsList" component={NotificationsList} />
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Readmore" component={Readmore} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
