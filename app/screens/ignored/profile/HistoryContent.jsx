import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from "twrnc";
import { useProfile } from './ProfileContext';
import EmptyContent from './EmptyContent';

const HistoryContent = () => {
  const { theme, orders, loadingCancel, cancelOrder } = useProfile();

  return (
    <ScrollView style={tw`flex-1 p-4`}>
      {orders?.length ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).map((o) => (
        <View key={o._id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between items-center`, { backgroundColor: theme.semiWhite }]}>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-base font-bold`, { color: theme.black }]}>Order ID: {o._id.slice(-6)}</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Date: {new Date(o.date).toLocaleDateString()}</Text>
            <Text style={[tw`text-sm font-semibold mt-1`, { color: theme.primary }]}>Total: ${o.total}</Text>
            <Text style={[tw`text-sm font-semibold mt-2`, { color: o.status==="pending"?theme.yellow:o.status==="delivered"?theme.green:(o.status==="canceled"||o.status==="refused")?theme.red:theme.darkGray }]}>
              {o.status[0].toUpperCase() + o.status.slice(1)}
            </Text>
          </View>
          {o.status==="pending" && (
            loadingCancel===o._id ? (
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
      )) : <EmptyContent icon="history" title="No Orders" subtitle="Your order history will appear here." />}
    </ScrollView>
  );
};

export default HistoryContent;