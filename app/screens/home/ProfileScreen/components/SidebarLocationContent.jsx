import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";
import SidebarHeader from "./SidebarHeader";

const SidebarLocationContent = ({ user, theme, onClose, isLocationLoading, onUpdateLocation }) => (
  <View style={tw`flex-1 p-4`}>
    <SidebarHeader title="My Location" theme={theme} onClose={onClose} />
    {isLocationLoading && !user?.location ? (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[tw`mt-4`, { color: theme.darkGray }]}>Updating Location...</Text>
      </View>
    ) : user?.location ? (
      <View style={tw`items-center justify-center flex-1`}>
        <Icon name="location-on" size={60} color={theme.red} />
        <Text style={[tw`text-lg font-bold mt-4 mb-2 text-center`, { color: theme.black }]}>Current Location Saved</Text>
        <Text style={[tw`text-base text-center px-4`, { color: theme.darkGray }]}>{user.location}</Text>
        <TouchableOpacity 
          onPress={onUpdateLocation} 
          disabled={isLocationLoading} 
          style={[tw`mt-8 py-3 px-6 rounded-lg border flex-row items-center justify-center`, { borderColor: theme.primary }]}
        >
          {isLocationLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[tw`font-semibold`, { color: theme.primary }]}>Update My Location</Text>
          )}
        </TouchableOpacity>
      </View>
    ) : (
      <View style={tw`items-center justify-center flex-1`}>
        <Icon name="location-off" size={60} color={theme.darkGray} />
        <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>No Location Found</Text>
        <Text style={[tw`text-sm mt-1 text-center px-6`, { color: theme.darkGray }]}>Set your location to get better service.</Text>
        <TouchableOpacity 
          onPress={onUpdateLocation} 
          disabled={isLocationLoading} 
          style={[tw`mt-6 py-3 px-6 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary }]}
        >
          {isLocationLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[tw`text-white font-semibold`]}>Set My Location</Text>
          )}
        </TouchableOpacity>
      </View>
    )}
  </View>
);

export default SidebarLocationContent;
