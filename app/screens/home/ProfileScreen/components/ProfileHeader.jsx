import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const ProfileHeader = ({ user, theme, cart, favorites, isUploading, onPickImage, onEditField }) => (
  <View style={[tw`p-6 items-center`, { backgroundColor: theme.lightBeige }]}>
    <TouchableOpacity onPress={onPickImage} disabled={isUploading} style={[tw`w-24 h-24 rounded-full items-center justify-center mb-4 shadow-sm`, { backgroundColor: theme.primary }]}>
      {user?.image ? (<Image source={{ uri: user.image }} style={tw`w-24 h-24 rounded-full`} />) : (<Icon name="person" size={40} color={theme.white} />)}
      {isUploading && (
        <View style={[tw`absolute inset-0 items-center justify-center rounded-full`, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <ActivityIndicator color={theme.white} />
        </View>
      )}
      <View style={[tw`absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm`, { backgroundColor: theme.primary }]}>
        <Icon name="camera-alt" size={16} color={theme.white} />
      </View>
    </TouchableOpacity>
    <View style={tw`flex-row items-center mb-1`}>
      <Text style={[tw`text-2xl font-bold`, { color: theme.black }]}>{user?.name}</Text>
      <TouchableOpacity onPress={() => onEditField("name", user?.name)} style={[tw`ml-3 p-1.5 rounded-full`, { backgroundColor: `${theme.primary}15` }]}>
        <Icon name="mode-edit" size={18} color={theme.primary} />
      </TouchableOpacity>
    </View>
    <View style={tw`flex-row items-center`}>
      <Text style={[tw`text-base`, { color: theme.darkGray }]}>{user?.email}</Text>
      <TouchableOpacity onPress={() => onEditField("email", user?.email)} style={[tw`ml-2 p-1 rounded-full`, { backgroundColor: `${theme.primary}10` }]}>
        <Icon name="edit" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
    <View style={[tw`w-full flex-row mt-8 justify-center px-4`]}>
      <View style={[tw`flex-row items-center px-6 py-2 rounded-2xl mx-2`, { backgroundColor: theme.white }]}>
        <Icon name="shopping-cart" size={24} color={theme.primary} />
        <View style={tw`ml-3`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>{cart.length}</Text>
        </View>
      </View>
      <View style={[tw`flex-row items-center px-6 py-2 rounded-2xl mx-2`, { backgroundColor: theme.white }]}>
        <Icon name="favorite" size={24} color={theme.primary} />
        <View style={tw`ml-3`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>{favorites.length}</Text>
        </View>
      </View>
    </View>
  </View>
);

export default ProfileHeader;
