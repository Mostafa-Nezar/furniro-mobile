import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const SidebarHeader = ({ title, theme, onClose }) => (
  <View style={tw`flex-row justify-between items-center mb-6`}>
    <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>{title}</Text>
    <TouchableOpacity onPress={onClose}>
      <Icon name="close" size={24} color={theme.darkGray} />
    </TouchableOpacity>
  </View>
);

export default SidebarHeader;
