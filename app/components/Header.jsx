import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import NotificationBell from "./NotificationBell";

const Header = ({
  title,
  showBack = false,
  showCart = true,
  showSearch = true,
  showNotification = true,
}) => {
  const navigation = useNavigation();
  const { theme, user, toggleTheme, isDarkMode } = useAppContext();

  const cartItemsCount =
    user?.cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <View
      style={[
        tw`flex-row items-center justify-between px-4 py-3 border-b`,
        { backgroundColor: theme.white, borderBottomColor: theme.lightGray },
      ]}
    >
      {/* Left side */}
      <View style={tw`flex-row items-center flex-1`}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mr-3 p-2`}
          >
            <Icon name="arrow-back" size={24} color={theme.black} />
          </TouchableOpacity>
        )}

        <View style={tw`flex-row items-center`}>
          <Image
            source={require("../../assets/images/Meubel House_Logos-05.png")}
            style={tw`w-8 h-8 mr-2`}
            resizeMode="contain"
          />
          <Text
            style={[
              tw`text-xl font-bold`,
              { color: theme.black, fontFamily: "Poppins-Bold" },
            ]}
          >
            {title || "Furniro"}
          </Text>
        </View>
      </View>

      {/* Right side */}
      <View style={tw`flex-row items-center`}>
        {showNotification && <NotificationBell navigation={navigation} />}
        {/* Theme toggle */}
        <TouchableOpacity onPress={toggleTheme} style={tw`p-2 mr-2`}>
          <Icon
            name={isDarkMode ? "light-mode" : "dark-mode"}
            size={24}
            color={theme.black}
          />
        </TouchableOpacity>

        {/* Search */}
        {showSearch && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            style={tw`p-2 mr-2`}
          >
            <Icon name="search" size={24} color={theme.black} />
          </TouchableOpacity>
        )}

        {/* Cart */}
        {showCart && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            style={tw`p-2 relative`}
          >
            <Icon name="shopping-cart" size={24} color={theme.black} />
            {cartItemsCount > 0 && (
              <View
                style={[
                  tw`absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center`,
                  { backgroundColor: theme.red },
                ]}
              >
                <Text style={[tw`text-xs font-bold`, { color: theme.white }]}>
                  {cartItemsCount > 100 ? "100+" : cartItemsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;
