import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { theme, orders } = useAppContext();
  return (
    <>
    <View style={tw`flex-1 px-4 mb-4`}>
    <Header showBack={true} showSearch={false}/>
    <Text style={[tw`text-xl font-bold p-4`, { color: theme.black }]}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("OrderDetails", { orderId: item._id })}
            style={[tw`p-4 mb-3 rounded-lg`, { backgroundColor: theme.semiWhite }]}
          >
            <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {item._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.primary }]}>Total: ${item.total}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
    </>
  );
};

export default OrdersScreen;
