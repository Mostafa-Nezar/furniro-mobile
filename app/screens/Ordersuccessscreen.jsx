import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import Header from "../components/Header.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function Ordersuccessscreen() {
  const navigation = useNavigation();
  const { theme, fetchOrders,getProducts } = useAppContext(),{ clearCart } =useCart();
  useEffect(() => { (async () => { await clearCart(); fetchOrders(); getProducts() })() }, []);
  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Success" showBack={true}/>
      <View style={tw`flex-1 justify-center items-center px-5`}>
        <View style={tw`mb-5`}>
          <Ionicons name="checkmark-circle" size={100} color={theme.green} />
        </View>
        <Text style={[tw`text-xl mb-2 text-center`, { color: theme.black }]}>
          Order Placed Successfully!
        </Text>
        <Text style={[tw`text-base text-center mb-8`, { color: theme.darkGray }]}>
          Thank you for shopping with us. We’ll contact you soon to confirm
          your order.
        </Text>
        <TouchableOpacity style={[tw`w-4/5 py-3 rounded-xl items-center`, { backgroundColor: theme.primary }]} onPress={() => navigation.popToTop({ animationEnabled: false })}>
          <Text style={[tw`text-base font-semibold`, { color: theme.white }]}>
            Back to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
