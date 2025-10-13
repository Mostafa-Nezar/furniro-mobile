import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppContext } from "../context/AppContext.jsx";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen.jsx";
import ShopScreen from "../screens/ShopScreen.jsx";
import CartScreen from "../screens/CartScreen.jsx";
import LoginScreen from "../screens/LoginScreen.jsx";
import RegisterScreen from "../screens/RegisterScreen.jsx";
import ProductDetailScreen from "../screens/ProductDetailScreen.jsx";
import ProfileScreen from "../screens/ProfileScreen.jsx";
import SearchScreen from "../screens/SearchScreen.jsx";
import SplashScreen from "../screens/SplashScreen.jsx";
import AuthLoadingScreen from "../screens/AuthLoadingScreen.jsx";
import Payment from "../screens/Payment.jsx";
import NotificationsList from "../components/NotificationsList.jsx";
import GetStarted from "../screens/GetStarted.jsx";
import Payment2 from "../screens/Payment2.jsx";
import Payment3 from "../screens/payment3.jsx";
import Ordersuccessscreen from "../screens/Ordersuccessscreen.jsx";
import { useCart } from "../context/CartContext.jsx";
import OrdersScreen from "../screens/OrdersScreen.jsx";
import OrderDetailsScreen from "../screens/OrderDetailsScreen.jsx";
import Paypal from "../screens/Paypal.jsx";

const Stack = createStackNavigator(), Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useAppContext(), { cart } = useCart();
  const cartItemsCount = cart.reduce((t, i) => t + i.quantity, 0) || 0;
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.white, borderTopColor: theme.lightGray, paddingBottom: 5, paddingTop: 5, height: 60 },
      tabBarActiveTintColor: theme.primary, tabBarInactiveTintColor: theme.darkGray,
      tabBarLabelStyle: { fontSize: 12, fontFamily: "Poppins-Medium" },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: "home", Shop: "storefront", Cart: "cart", Profile: "person" };
        return (
          <View style={{ position: "relative" }}>
            <Ionicons name={icons[route.name]} size={size} color={color} />
            {route.name === "Cart" && cartItemsCount > 0 && (
              <View style={{ position: "absolute", top: -5, right: -10, backgroundColor: theme.red, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: theme.white, fontSize: 10, fontWeight: "bold" }}>{cartItemsCount > 9 ? "9+" : cartItemsCount}</Text>
              </View>
            )}
          </View>
        );
      }
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useAppContext();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.white } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Ordersuccessscreen" component={Ordersuccessscreen} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="Payment2" component={Payment2} />
        <Stack.Screen name="Payment3" component={Payment3} />
        <Stack.Screen name="Paypal" component={Paypal} />
        <Stack.Screen name="NotificationsList" component={NotificationsList} />
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
