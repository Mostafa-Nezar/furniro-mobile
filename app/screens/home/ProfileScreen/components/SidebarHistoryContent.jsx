import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import tw from "twrnc";
import SidebarHeader from "./SidebarHeader";
import EmptyContent from "./EmptyContent";

const SidebarHistoryContent = ({ orders, theme, onClose, loadingCancel, cancelOrder, navigation }) => (
  <View style={tw`flex-1 p-4`}>
    <SidebarHeader title="Orders History" theme={theme} onClose={onClose} />
    <ScrollView>
      {orders.length > 0 ? (
        orders.map((o) => (
          <View key={o._id} style={[tw`flex-row p-4 mb-3 rounded-lg items-center`, { backgroundColor: theme.semiWhite }]}>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {o._id.slice(-6)}</Text>
              <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Date: {new Date(o.date).toLocaleDateString()}</Text>
              <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.primary }]}>Total: ${o.total}</Text>
              <Text style={[tw`text-sm font-semibold mt-2`, { color: o.status === "pending" ? theme.yellow : o.status === "delivered" ? theme.green : (o.status === "cancelled" || o.status === "refused") ? theme.red : theme.darkGray }]}>
                {o.status[0].toUpperCase() + o.status.slice(1)}
              </Text>
            </View>
            {o.status === "pending" && (
              loadingCancel === o._id ? (
                <View style={[tw`px-3 py-1 rounded-md`, { backgroundColor: theme.semiWhite }]}>
                  <Text style={[tw`text-base font-semibold italic`, { color: theme.red }]}>Cancelling...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => cancelOrder(o._id)} style={[tw`rounded-md w-24 p-2 py-1 flex-row justify-center`, { backgroundColor: theme.red }]}>
                  <Text style={tw`text-center text-base font-semibold text-white`}>Cancel</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        ))
      ) : (
        <EmptyContent icon="history" title="No Orders Yet" subtitle="Your order history is empty." theme={theme} />
      )}
    </ScrollView>
    <TouchableOpacity 
      onPress={() => {
        onClose();
        navigation.navigate("Orders");
      }} 
      style={[tw`rounded-md w-full p-3 mt-2 flex-row justify-center`, { backgroundColor: theme.primary }]}
    >
      <Text style={tw`text-center text-base font-semibold text-white`}>View All Orders</Text>
    </TouchableOpacity>
  </View>
);

export default SidebarHistoryContent;
