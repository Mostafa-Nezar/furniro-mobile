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
import About from "../screens/About.jsx";
import Svg, { Path, G } from 'react-native-svg';
import Readmore from "../screens/Readmore.jsx";

const Stack = createStackNavigator(), Tab = createBottomTabNavigator();
const AboutIcon = ({ color, size }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 100 100"
  >
    <G fill={color}>
      <Path d="M64.165 56.231c-3.279 0-4.361 2.494-4.69 3.652h8.754c-.082-.643-.339-1.773-1.157-2.597c-.697-.699-1.672-1.055-2.907-1.055m-22.503 4.658H33.37v7.067h7.839c1.398-.035 3.13-.485 3.13-3.422c0-3.543-2.403-3.645-2.677-3.645" />
      <Path d="M79.035 14.073h-58a7 7 0 0 0-6.693 4.946v62.107a7.01 7.01 0 0 0 5.265 4.8h60.855a7.01 7.01 0 0 0 5.196-4.602V18.821a7 7 0 0 0-6.623-4.748M57.268 44.448c0-.277.226-.502.502-.502h12.465c.274 0 .501.225.501.502v3.721a.503.503 0 0 1-.501.501H57.77a.5.5 0 0 1-.502-.501zm-5.294 20.639c0 4.75-2.513 7.041-4.625 8.12c-2.301 1.179-4.686 1.271-5.364 1.271H26.162a.506.506 0 0 1-.502-.503V43.77c0-.277.228-.503.502-.503h15.721c5.58 0 9.047 3.274 9.047 8.547c0 3.266-1.591 4.833-2.991 5.579a5.1 5.1 0 0 1 2.041 1.329c2.194 2.32 2.006 6.2 1.994 6.365m23.304-.455a.5.5 0 0 1-.497.437H59.648c.109 1.659.766 2.856 1.953 3.563c1.05.623 2.211.691 2.657.691c.093 0 .151-.004.158-.006c1.737 0 2.97-.383 3.697-1.139c.697-.726.678-1.547.673-1.582c0-.138.046-.271.144-.371a.5.5 0 0 1 .362-.155h5.313c.278 0 .504.225.504.503c0 8.131-8.683 8.543-10.429 8.543c-.279 0-.438-.01-.438-.01h-.005c-3.92 0-6.987-1.143-9.091-3.395c-3.297-3.534-2.996-8.478-2.981-8.686c0-.089.014-3.019 1.495-5.992c1.391-2.773 4.352-6.081 10.612-6.081c3.587 0 6.38 1.102 8.287 3.274c3.509 4.001 2.759 10.146 2.719 10.406" />
      <Path d="M43.29 52.132c0-2.609-1.565-2.639-1.63-2.639h-8.29v5.734h7.742c1.151 0 2.178-.236 2.178-3.095" />
    </G>
  </Svg>
);

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
        const icons = { Home: "home", Shop: "storefront", Cart: "cart", Profile: "person", About: "About" };
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
      }
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
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="Payment2" component={Payment2} />
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
