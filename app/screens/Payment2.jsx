import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext.jsx";

const Payment2 = () => {
  const { user } = useAuth();
  const { cart,clearCart } = useCart();


  const x = useNavigation()
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "x",
    email: user.email,
    address: "aleishrini",
    city: "ismailia",
    state: "ismailia",
    zipCode: "41511",
  });

  const handleChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    try {
      if (!customerInfo.fullName || !customerInfo.email || !customerInfo.address) {
        return Alert.alert("خطأ", "من فضلك املأ كل الحقول المطلوبة");
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "https://furniro-back-production.up.railway.app/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            userId: user?.id,
            products: cart.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            customerInfo: {
              email: customerInfo.email,
              name: customerInfo.fullName,
              address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.zipCode,
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        await WebBrowser.openBrowserAsync(data.url);
        await clearCart();
      } else {
        console.log("Response status:", response.status);
        console.log("Response body:", data);
        Alert.alert("خطأ", data.message || "فشل في بدء عملية الدفع");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("خطأ", "حصلت مشكلة في الاتصال بالسيرفر");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>الاسم الكامل</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={customerInfo.fullName}
        onChangeText={(val) => handleChange("fullName", val)}
      />

      <Text>الإيميل</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        keyboardType="email-address"
        value={customerInfo.email}
        onChangeText={(val) => handleChange("email", val)}
      />

      <Text>العنوان</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={customerInfo.address}
        onChangeText={(val) => handleChange("address", val)}
      />

      <Text>المدينة</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={customerInfo.city}
        onChangeText={(val) => handleChange("city", val)}
      />

      <Text>المحافظة</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={customerInfo.state}
        onChangeText={(val) => handleChange("state", val)}
      />

      <Text>الرمز البريدي</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
        keyboardType="numeric"
        value={customerInfo.zipCode}
        onChangeText={(val) => handleChange("zipCode", val)}
      />

      <TouchableOpacity
        onPress={handleCheckout}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          ادفع الآن
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => x.goBack()}>
        <Text>Back to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Payment2;
