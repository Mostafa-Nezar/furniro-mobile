import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const ProfileHeader = ({ user, theme, cart, favorites, isUploading, onPickImage, onEditField }) => (
  <View style={[tw`p-6 items-center bg-[${theme.lightBeige}]`]}>
    <TouchableOpacity onPress={onPickImage} disabled={isUploading} style={tw`relative w-24 h-24 rounded-full items-center justify-center mb-3 shadow-sm bg-[${theme.primary}]`}>
      {user?.image ? ( <Image source={{ uri: user.image }} style={tw`w-24 h-24 rounded-full`} />) : ( <Icon name="person" size={40} color={theme.white} />)}
      {isUploading && (
        <View style={tw`absolute inset-0 items-center justify-center rounded-full bg-black/50`}>
          <ActivityIndicator color={theme.white} />
        </View>
      )}
      <View style={tw`absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm bg-[${theme.primary}]`}>
        <Icon name="camera-alt" size={16} color={theme.white} />
      </View>
    </TouchableOpacity>
    <View style={tw`w-full items-center mb-4`}>
      <View style={tw`flex-row items-center justify-center mb-1 relative`}>
        <Text style={tw`text-2xl font-bold text-[${theme.black}] text-center`}>{user?.name}</Text>
        <TouchableOpacity onPress={() => onEditField("name", user?.name)} style={tw`absolute ml-2 p-1.5 right-[-4rem] rounded-2xl bg-[${theme.primary}15]`}>
          <Icon name="mode-edit" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
      <View style={tw`flex-row items-center justify-center relative`}>
        <Text style={tw`text-base text-[${theme.darkGray}] text-center`}>{user?.email}</Text>
        <TouchableOpacity onPress={() => onEditField("email", user?.email)} style={tw`absolute ml-2 p-1 right-[-5rem] rounded-2xl bg-[${theme.primary}10]`}>
          <Icon name="edit" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
    
    <View style={tw`w-full flex-row justify-center px-4`}>
      <View style={[tw`flex-row items-center px-6 py-2 rounded-2xl mx-2`,{backgroundColor:theme.white}]}>
        <Icon name="shopping-cart" size={24} color={theme.primary} />
        <Text style={tw`ml-3 text-lg font-bold text-[${theme.black}]`}>{cart.length}</Text>
      </View>
      <View style={[tw`flex-row items-center px-6 py-2 rounded-2xl mx-2`,{backgroundColor:theme.white}]}>
        <Icon name="favorite" size={24} color={theme.primary} />
        <Text style={tw`ml-3 text-lg font-bold text-[${theme.black}]`}>{favorites.length}</Text>
      </View>
    </View>
  </View>
);

export default ProfileHeader;
