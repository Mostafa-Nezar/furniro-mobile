import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";

const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params;
  const { theme, orders } = useAppContext();
  const order = orders.find((o) => o._id === orderId);

  if (!order) return (
    <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme.background || theme.white }]}>
      <Text style={[tw`text-base`, { color: theme.darkGray }]}>Order not found</Text>
    </View>
  );

  return (
    <>
      <Header showBack={true} showSearch={false}/>
      <ScrollView style={[tw`flex-1 p-4`, { backgroundColor: theme.background || theme.white }]}>
        <Text style={[tw`text-xl font-bold mb-3`, { color: theme.text || theme.black }]}>Order Details</Text>

        {/* Basic Info */}
        <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>
          Order ID: <Text style={{ color: theme.text || theme.black }}>{order._id}</Text>
        </Text>
        <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>
          Date: <Text style={{ color: theme.text || theme.black }}>{new Date(order.date).toLocaleDateString()}</Text>
        </Text>
        <Text style={[tw`text-base font-semibold mb-1`, { color: theme.primary }]}>Total: ${order.total}</Text>
        <Text style={[tw`text-base font-semibold mb-1`, { color: order.status==="pending"?theme.yellow:order.status==="delivered"?theme.green:(order.status==="canceled"||order.status==="refused")?theme.red:theme.text || theme.black }]}>
          Status: {order.status[0].toUpperCase() + order.status.slice(1)}
        </Text>
        <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>
          Delivery Date: <Text style={{ color: theme.text || theme.black }}>{order.deliveryDate}</Text>
        </Text>

        {/* Customer Info */}
        <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text || theme.black }]}>Customer Info</Text>
        <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Name: {order.customerInfo.fullName}</Text>
        <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Email: {order.customerInfo.email}</Text>
        <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>
          Address: {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state}, {order.customerInfo.zipCode}
        </Text>

        {/* Payment Info */}
        <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text || theme.black }]}>Payment Info</Text>
        <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Method: {order.payment.method}</Text>
        <Text style={[tw`text-base mb-1`, { color: order.paymentdone==="done"?theme.green:theme.red }]}>Payment Status: {order.paymentdone}</Text>
        {order.payment.card && (
          <>
            <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Card Brand: {order.payment.card.brand}</Text>
            <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Last4: {order.payment.card.last4}</Text>
            <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>Exp: {order.payment.card.exp_month}/{order.payment.card.exp_year}</Text>
          </>
        )}

        {/* Products */}
        <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text || theme.black }]}>Products</Text>
        {order.products.map((p) => (
          <View key={p._id} style={tw`mb-2`}>
            <Text style={[tw`text-base mb-1`, { color: theme.text || theme.black }]}>Name: {p.name}</Text>
            <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Quantity: {p.quantity}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default OrderDetailsScreen;
