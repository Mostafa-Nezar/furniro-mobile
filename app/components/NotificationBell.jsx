import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { useAppContext } from '../context/AppContext'; 
import tw from 'twrnc';

const NotificationBell = ({ navigation }) => {
  const { unreadCount, connected } = useSocket();
  const { theme } = useAppContext();

  const handlePress = () => {
    navigation.navigate('NotificationsList');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={tw`relative mr-4`}>
      <Ionicons name="notifications-outline" size={24} color={theme.black} />

      {unreadCount > 0 && (
        <View
          style={[
            tw`absolute items-center justify-center -top-1 -right-1 rounded-full min-w-[20px] h-[20px] px-1`,
            { backgroundColor: theme.red },
          ]}
        >
          <Text
            style={[
              tw`text-xs font-bold`,
              { color: theme.white }, 
            ]}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}

      {connected && (
        <View
          style={[
            tw`absolute w-2 h-2 rounded-full bottom-0 right-0`,
            { backgroundColor: theme.red },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
