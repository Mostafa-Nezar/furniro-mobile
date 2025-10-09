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
      <Header showBack showSearch={false}/>
      <ScrollView style={[tw`flex-1 p-4`, { backgroundColor: theme.background || theme.white }]}>
        <Text style={[tw`text-xl font-bold mb-3`, { color: theme.text }]}>Order Details</Text>

        {order._id && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Order ID: <Text style={{ color: theme.text }}>{order._id}</Text></Text>}
        {order.date && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Date: <Text style={{ color: theme.text }}>{new Date(order.date).toLocaleDateString()}</Text></Text>}
        {order.total && <Text style={[tw`text-base font-semibold mb-1`, { color: theme.primary }]}>Total: ${order.total}</Text>}
        {order.status && (
          <Text style={[tw`text-base font-semibold mb-1`, { 
            color: order.status==="pending"?theme.yellow:order.status==="delivered"?theme.green:(["canceled","refused"].includes(order.status)?theme.red:theme.text) 
          }]}>
            Status: {order.status[0].toUpperCase()+order.status.slice(1)}
          </Text>
        )}
        {order.deliveryDate && <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>Delivery Date: <Text style={{ color: theme.text }}>{order.deliveryDate}</Text></Text>}

        {order.customerInfo && (
          <>
            <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text }]}>Customer Info</Text>
            {order.customerInfo.fullName && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Name: {order.customerInfo.fullName}</Text>}
            {order.customerInfo.email && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Email: {order.customerInfo.email}</Text>}
            {(order.customerInfo.address || order.customerInfo.city || order.customerInfo.state || order.customerInfo.zipCode) && (
              <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>
                Address: {order.customerInfo.address||""} {order.customerInfo.city||""} {order.customerInfo.state||""} {order.customerInfo.zipCode||""}
              </Text>
            )}
          </>
        )}

        {order.payment && (
          <>
            <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text }]}>Payment Info</Text>
            {order.payment.method && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Method: {order.payment.method}</Text>}
            {order.paymentdone && <Text style={[tw`text-base mb-1`, { color: order.paymentdone==="done"?theme.green:theme.red }]}>Payment Status: {order.paymentdone}</Text>}
            {order.payment.card && (
              <>
                {order.payment.card.brand && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Card Brand: {order.payment.card.brand}</Text>}
                {order.payment.card.last4 && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Last4: {order.payment.card.last4}</Text>}
                {(order.payment.card.exp_month && order.payment.card.exp_year) && <Text style={[tw`text-base mb-3`, { color: theme.gray }]}>Exp: {order.payment.card.exp_month}/{order.payment.card.exp_year}</Text>}
              </>
            )}
          </>
        )}

        {order.products?.length > 0 && (
          <>
            <Text style={[tw`text-lg font-bold mb-1`, { color: theme.text }]}>Products</Text>
            {order.products.map((p,i) => (
              <View key={p._id||i} style={tw`mb-10`}>
                {p.name && <Text style={[tw`text-base mb-1`, { color: theme.text }]}>Name: {p.name}</Text>}
                {p.quantity && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>Quantity: {p.quantity}</Text>}
                {p.size && <Text style={[tw`text-base mb-1`, { color: theme.gray }]}>size: {p.size}</Text>}
                {p.color && <Text style={[tw`text-base mb-2`, { color: theme.gray }]}>color: {p.color}</Text>}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
};

export default OrderDetailsScreen;
