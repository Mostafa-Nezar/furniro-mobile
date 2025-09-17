import { View, Text,TouchableOpacity } from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header.jsx";

export default function Ordersuccessscreen() {
  const x = useNavigation();
  
  return (
    <View>
      <Header title="Cart" showBack={false} />
      <Text>Ordersuccessscreen</Text>
      <TouchableOpacity onPress={() => x.navigate("Cart")}>
        <Text>Back to Cart</Text>
      </TouchableOpacity>
    </View>
  )
}
