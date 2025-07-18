import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";

const CartScreen = () => {
  const navigation = useNavigation();
  const { theme, user, updateCartQuantity, removeFromCart, getImageUrl } = useAppContext();
  const cart = user?.cart || [];
  const totalItems = cart.reduce((t, i) => t + i.quantity, 0);
  const totalPrice = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = totalPrice >= 100 ? 0 : 10;

  const renderItem = ({ item }) => (
    <View style={[tw`flex-row p-4 mb-3 rounded-lg`, { backgroundColor: theme.semiWhite }]}>
      <Image source={{ uri: getImageUrl(item.image) }} style={tw`w-20 h-20 rounded-lg`} />
      <View style={tw`flex-1 ml-4`}>
        <Text style={[tw`text-lg font-semibold`, { color: theme.black }]}>{item.name}</Text>
        <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{item.des}</Text>
        <View style={tw`flex-row justify-between items-center mt-2`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>${(item.price * item.quantity).toFixed(2)}</Text>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity - 1)} style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: theme.lightGray }]}>
              <Icon name="remove" size={16} color={theme.black} />
            </TouchableOpacity>
            <Text style={[tw`mx-3`, { color: theme.black }]}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity + 1)} style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: theme.primary }]}>
              <Icon name="add" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={tw`ml-2 p-2`}>
        <Icon name="delete" size={20} color={theme.red} />
      </TouchableOpacity>
    </View>
  );

  if (!cart.length)
    return (
      <View style={[tw`flex-1 items-center justify-center px-6`, { backgroundColor: theme.white }]}>
        <Header title="Cart" showBack={false} showCart={false} />
        <Icon name="shopping-cart" size={80} color={theme.darkGray} />
        <Text style={[tw`text-xl font-bold mt-4`, { color: theme.black }]}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={[tw`py-4 px-8 rounded-lg mt-6`, { backgroundColor: theme.primary }]}>
          <Text style={[tw`text-lg font-semibold text-white`]}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );

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
        {[["Items", totalItems], ["Subtotal", `$${totalPrice.toFixed(2)}`], ["Shipping", shipping === 0 ? "Free" : "$10.00"]].map(([label, val], i) => (
          <View key={i} style={tw`flex-row justify-between mb-2`}>
            <Text style={{ color: theme.darkGray }}>{label}:</Text>
            <Text style={{ color: label === "Shipping" ? theme.green : theme.black }}>{val}</Text>
          </View>
        ))}
        <View style={[tw`flex-row justify-between mt-2 border-t pt-3`, { borderTopColor: theme.lightGray }]}>
          <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>Total:</Text>
          <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>${(totalPrice + shipping).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {navigation.navigate("Payment")}}
          style={[tw`py-4 rounded-lg mt-4`, { backgroundColor: theme.primary }]}
        >
          <Text style={[tw`text-center text-lg font-semibold text-white`]}>Checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={[tw`py-3 mt-3 border rounded-lg`, { borderColor: theme.primary }]}>
          <Text style={[tw`text-center text-base font-semibold`, { color: theme.primary }]}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
