import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";


const CartScreen = () => {
  const navigation = useNavigation();
  const { theme, user, updateCartQuantity, removeFromCart,getImageUrl } = useAppContext();

  const cart = user?.cart || [];
  const totalPrice = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const totalItems = cart.reduce((t, i) => t + i.quantity, 0);

  const handleQuantityChange = (id, q) => {
    q <= 0
      ? Alert.alert("Remove?", "", [
          { text: "Cancel" },
          { text: "Yes", onPress: () => removeFromCart(id) },
        ])
      : updateCartQuantity(id, q);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        tw`flex-row p-4 mb-3 rounded-lg`,
        { backgroundColor: theme.semiWhite },
      ]}
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={tw`w-20 h-20 rounded-lg`}
      />
      <View style={tw`flex-1 ml-4`}>
        <Text style={[tw`text-lg font-semibold`, { color: theme.black }]}>
          {item.name}
        </Text>
        <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{item.des}</Text>
        <View style={tw`flex-row justify-between items-center mt-2`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              style={[
                tw`w-8 h-8 rounded-full items-center justify-center`,
                { backgroundColor: theme.lightGray },
              ]}
            >
              <Icon name="remove" size={16} color={theme.black} />
            </TouchableOpacity>
            <Text style={[tw`mx-3`, { color: theme.black }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              style={[
                tw`w-8 h-8 rounded-full items-center justify-center`,
                { backgroundColor: theme.primary },
              ]}
            >
              <Icon name="add" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleQuantityChange(item.id, 0)}
        style={tw`ml-2 p-2`}
      >
        <Icon name="delete" size={20} color={theme.red} />
      </TouchableOpacity>
    </View>
  );

  if (!cart.length) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center px-6`,
          { backgroundColor: theme.white },
        ]}
      >
        <Header title="Cart" showBack={false} showCart={false} />
        <Icon name="shopping-cart" size={80} color={theme.darkGray} />
        <Text style={[tw`text-xl font-bold mt-4`, { color: theme.black }]}>
          Your cart is empty
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Shop")}
          style={[
            tw`py-4 px-8 rounded-lg mt-6`,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={[tw`text-lg font-semibold text-white`]}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Cart" showBack={false} showCart={false} />
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        contentContainerStyle={tw`px-4 py-4`}
      />
      <View style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}>
        <View style={tw`flex-row justify-between mb-2`}>
          <Text style={{ color: theme.darkGray }}>Items:</Text>
          <Text style={{ color: theme.black }}>{totalItems}</Text>
        </View>
        <View style={tw`flex-row justify-between mb-2`}>
          <Text style={{ color: theme.darkGray }}>Subtotal:</Text>
          <Text style={{ color: theme.black }}>${totalPrice.toFixed(2)}</Text>
        </View>
        <View style={tw`flex-row justify-between mb-2`}>
          <Text style={{ color: theme.darkGray }}>Shipping:</Text>
          <Text style={{ color: theme.green }}>
            {totalPrice >= 100 ? "Free" : "$10.00"}
          </Text>
        </View>
        <View
          style={[
            tw`flex-row justify-between mt-2 border-t pt-3`,
            { borderTopColor: theme.lightGray },
          ]}
        >
          <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>
            Total:
          </Text>
          <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>
            ${(totalPrice + (totalPrice >= 100 ? 0 : 10)).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Payment");
            Alert.alert("Order Placed");
          }}
          style={[tw`py-4 rounded-lg mt-4`, { backgroundColor: theme.primary }]}
        >
          <Text style={[tw`text-center text-lg font-semibold text-white`]}>
            Checkout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Shop")}
          style={[
            tw`py-3 mt-3 border rounded-lg`,
            { borderColor: theme.primary },
          ]}
        >
          <Text
            style={[
              tw`text-center text-base font-semibold`,
              { color: theme.primary },
            ]}
          >
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
