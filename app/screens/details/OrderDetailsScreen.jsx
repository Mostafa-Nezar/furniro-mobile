import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useAppContext } from "../../context/AppContext";
import Header from "../../components/Header";
import Svg, { Path } from "react-native-svg";

const Icon = ({ path, color, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={path} fill={color} />
  </Svg>
);
const Section = ({ icon, title, theme, children }) => (
  <View style={[tw`mb-4 p-4 rounded-xl`, { backgroundColor: theme.semiWhite }]}>
    <View style={tw`flex-row items-center mb-2`}>
      <Icon path={icon} color={theme.text} />
      <Text style={[tw`text-lg font-bold ml-2`, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const Row = ({ label, value, color }) => value ? (<Text style={[tw`text-base mb-1`, { color }]}> {label}: {value}</Text>) : null;
const icons = {
  order: "M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Z",
  money: "M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Z",
  user: "M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z",
  payment: "M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2Zm0 4h22v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z",
  product: "M3 3h18v4H3Zm0 6h18v12H3Z",
};

const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params;
  const { theme, orders } = useAppContext();
  const order = orders.find((o) => o._id === orderId);

  if (!order)
    return (
      <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: theme.white }]}>
        <Text style={{ color: theme.darkGray }}>Order not found</Text>
      </View>
    );

  return (
    <>
      <Header showBack showSearch={false} />
      <ScrollView style={[tw`flex-1 p-4`, { backgroundColor: theme.white }]}>
        <View style={tw`flex-row items-center mb-4`}>
          <Icon path={icons.order} color={theme.text} />
          <Text style={[tw`text-xl font-bold ml-2`, { color: theme.text }]}>
            Order Details
          </Text>
        </View>
        <View style={[tw`mb-4 p-4 rounded-xl`,{backgroundColor:theme.semiWhite}]}>
          <Row label="Order ID" value={order._id} color={theme.gray} />
          {order.date && (
            <View style={tw`flex-row items-center mb-1`}>
              <Icon path={icons.calendar} color={theme.gray} />
              <Text style={[tw`ml-2`, { color: theme.gray }]}>
                {new Date(order.date).toLocaleDateString()}
              </Text>
            </View>
          )}
          {order.total && (
            <View style={[tw`flex-row items-center mb-1`]}>
              <Icon path={icons.money} color={theme.primary} />
              <Text style={[tw`ml-2 font-semibold`, { color: theme.primary }]}>
                ${order.total}
              </Text>
            </View>
          )}
          {order.status && (
            <Text style={{ color: order.status === "pending" ? theme.yellow : order.status === "delivered" ? theme.green : ["canceled", "refused"].includes(order.status) ? theme.red : theme.text }}> Status: {order.status} </Text>)}
            <Row label="Delivery Date" value={order.deliveryDate} color={theme.gray} />
        </View>
        {order.customerInfo && (
          <Section icon={icons.user} title="Customer Info" theme={theme}>
            <Row label="Name" value={order.customerInfo.fullName} color={theme.gray} />
            <Row label="Email" value={order.customerInfo.email} color={theme.gray} />
            <Row label="Address" value={`${order.customerInfo.address || ""} ${order.customerInfo.city || ""} ${order.customerInfo.state || ""} ${order.customerInfo.zipCode || ""}`} color={theme.gray}/>
          </Section>
        )}
        {order.payment && (
          <Section icon={icons.payment} title="Payment Info" theme={theme}>
            <Row label="Method" value={order.payment.method} color={theme.gray} />
            <Text style={{ color: order.paymentdone === "done" ? theme.green : theme.red }} > Payment Status: {order.paymentdone}</Text>
          </Section>
        )}

        {order.products?.length > 0 && (
          <Section icon={icons.product} title="Products" theme={theme}>
            {order.products.map((p, i) => (
              <View key={p._id || i} style={tw`border-b border-gray-200 py-3`}>
                <Row label="Name" value={p.name} color={theme.text} />
                <Row label="Quantity" value={p.quantity} color={theme.gray} />
                <Row label="Size" value={p.size} color={theme.gray} />
                <Row label="Color" value={p.color} color={theme.gray} />
              </View>
            ))}
          </Section>
        )}
      </ScrollView>
    </>
  );
};

export default OrderDetailsScreen;
