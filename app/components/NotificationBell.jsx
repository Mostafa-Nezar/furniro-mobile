import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import tw from 'twrnc';

const NotificationBell = ({ navigation }) => {
  const { unreadCount, connected } = useSocket();

  const handlePress = () => {
    navigation.navigate('NotificationsList');
  };

  return (
<TouchableOpacity onPress={handlePress} style={tw`relative mr-4`}>
  <Ionicons name="notifications-outline" size={24} color="black" />

  {unreadCount > 0 && (
    <View style={tw`absolute items-center justify-center px-1 -top-1 -right-1 bg-black rounded-full min-w-[20px] h-[20px]`}>
      <Text style={tw`text-white text-xs font-bold`}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  )}

  {connected && (
    <View style={tw`absolute w-2 h-2 bg-black rounded-full border border-white bottom-0 right-0`} />
  )}
</TouchableOpacity>

  );
};

export default NotificationBell;
