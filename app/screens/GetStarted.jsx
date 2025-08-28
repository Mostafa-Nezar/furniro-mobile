import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useAppContext } from '../context/AppContext';

export default function GetStarted() {
  const { theme } = useAppContext(); 
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate("Login"); 
  };
  

  return (
    <View style={[tw`flex-1 justify-center p-6`, { backgroundColor: theme.cream }]}>
      <View style={tw`mb-12`}>
        <Text style={[tw`text-lg mb-2`, { color: theme.primary, fontFamily: 'Poppins-SemiBold' }]}>
          Furniro
        </Text>
        <Text style={[tw`text-4xl leading-tight mb-4`, { color: theme.black, fontFamily: 'Poppins-Bold' }]}>
          The Best Furniture Comes From Us
        </Text>
        <Text style={[tw`text-base`, { color: theme.gray, fontFamily: 'Poppins-Regular' }]}>
          Discover premium quality furniture for your home.
        </Text>
      </View>
      <TouchableOpacity 
        onPress={handleGetStarted} 
        style={[
          tw`w-full flex-row justify-between items-center p-4 rounded-full shadow-lg`,
          { backgroundColor: theme.primary }
        ]}
      >
        <Text style={[tw`text-lg`, { color: theme.white, fontFamily: 'Poppins-SemiBold' }]}>
          Get Started
        </Text>
        <View style={[tw`p-2 rounded-full`, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Ionicons name="arrow-forward" size={24} color={theme.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
