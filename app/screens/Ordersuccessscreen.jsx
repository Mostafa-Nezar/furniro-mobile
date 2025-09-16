import { View, Text,TouchableOpacity } from 'react-native'
import { useNavigation } from "@react-navigation/native";

export default function Ordersuccessscreen() {
  const x = useNavigation();
  
  return (
    <View>
      <Text>Ordersuccessscreen</Text>
      <TouchableOpacity onPress={() => x.navigate("Cart")}>
        <Text>Back to Cart</Text>
      </TouchableOpacity>
    </View>
  )
}
