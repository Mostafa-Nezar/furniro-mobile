import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { theme, orders, fetchOrders } = useAppContext();
  useEffect(()=>{fetchOrders()},[])
  return (
    <>
    <Header showBack={true} showSearch={false}/>
    <View style={[tw`flex-1 px-4 mb-4`,{backgroundColor:theme.primary}]}>
    <Text style={[tw`text-xl font-bold p-4`, { color: theme.black }]}>My Orders</Text>
      <FlatList
        data={[...orders].sort((a, b) => new Date(b.date) - new Date(a.date))}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("OrderDetails", { orderId: item._id })} activeOpacity={0.9} style={tw`mb-3 rounded-lg overflow-hidden shadow-md`}>
          <LinearGradient colors={[theme.red, theme.primary, theme.green]}  start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={tw`p-4`}>
            <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {item._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, { color: theme.white }]}>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.black }]}>Total: ${item.total}</Text>
          </LinearGradient>
          </TouchableOpacity>
        )}/>
    </View>
    </>
  );
};

export default OrdersScreen;
