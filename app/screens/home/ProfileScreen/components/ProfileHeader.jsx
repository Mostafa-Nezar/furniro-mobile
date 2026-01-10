import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const ProfileHeader = ({ user, theme, cart, favorites, isUploading, onPickImage }) => (
  <View style={[tw`p-6 items-center`, { backgroundColor: theme.lightBeige }]}>
    <TouchableOpacity 
      onPress={onPickImage} 
      disabled={isUploading} 
      style={[tw`w-24 h-24 rounded-full items-center justify-center mb-4`, { backgroundColor: theme.primary }]}
    >
      {user?.image ? (
        <Image source={{ uri: user.image }} style={tw`w-24 h-24 rounded-full`} />
      ) : (
        <Icon name="person" size={40} color={theme.white} />
      )}
      {isUploading && (
        <View style={[tw`absolute inset-0 items-center justify-center rounded-full`, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <ActivityIndicator color={theme.white} />
        </View>
      )}
      <View style={[tw`absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center border-2 border-white`, { backgroundColor: theme.primary }]}>
        <Icon name="camera-alt" size={14} color={theme.white} />
      </View>
    </TouchableOpacity>
    <Text style={[tw`text-xl font-bold mb-1`, { color: theme.black }]}>{user?.name}</Text>
    <Text style={[tw`text-base`, { color: theme.darkGray }]}>{user?.email}</Text>
    <View style={tw`flex-row mt-4`}>
      <View style={tw`items-center mx-4`}>
        <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>{cart.length}</Text>
        <Text style={[tw`text-sm`, { color: theme.darkGray }]}>In Cart</Text>
      </View>
      <View style={tw`items-center mx-4`}>
        <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>{favorites.length}</Text>
        <Text style={[tw`text-sm`, { color: theme.darkGray }]}>Favorites</Text>
      </View>
    </View>
  </View>
);

export default ProfileHeader;
