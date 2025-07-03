import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";

const Payment = () => {
  const navigation = useNavigation();
  const { theme, user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "", fullName: "", address: "", city: "",
    state: "", zipCode: "", cardNumber: "", expiryDate: "",
    cvv: "", cardholderName: "",
  });

  const cart = user?.cart || [];
  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleInputChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const formatCardNumber = (v) => {
    v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const m = v.match(/\d{4,16}/g), parts = [];
    const match = (m && m[0]) || "";
    for (let i = 0; i < match.length; i += 4)
      parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(" ") : v;
  };
  const formatExpiryDate = (v) => {
    v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return v.length >= 2 ? v.substring(0, 2) + "/" + v.substring(2, 4) : v;
  };
  const validateForm = () => {
    const req = ["email", "fullName", "address", "city", "state", "zipCode", "cardNumber", "expiryDate", "cvv", "cardholderName"];
    for (let f of req) {
      if (!formData[f].trim()) {
        Alert.alert("Error", `Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    if (formData.cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Error", "Please enter a valid card number");
      return false;
    }
    if (formData.cvv.length < 3) {
      Alert.alert("Error", "Please enter a valid CVV");
      return false;
    }
    return true;
  };

  const createCheckoutSession = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/payment/create-checkout-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          customerInfo: {
            email: formData.email,
            name: formData.fullName,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
            },
          },
          paymentMethod: {
            card: {
              number: formData.cardNumber.replace(/\s/g, ""),
              exp_month: formData.expiryDate.split("/")[0],
              exp_year: "20" + formData.expiryDate.split("/")[1],
              cvc: formData.cvv,
            },
            billing_details: { name: formData.cardholderName },
          },
        }),
      });
      const data = await res.json();
      res.ok && data.url
        ? Linking.openURL(data.url)
        : Alert.alert("Payment Failed", data.error || "Something went wrong");
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    maxLength,
    secureTextEntry = false,
  }) => (
    <View style={tw`mb-4`}>
      <TextInput
        style={[
          tw`p-4 rounded-lg border`,
          {
            borderColor: theme.lightGray,
            backgroundColor: theme.semiWhite,
            color: theme.black,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.darkGray}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Payment" showBack={true} showCart={false} />
      <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
        <View style={[tw`p-4 rounded-lg mb-6 mt-4`, { backgroundColor: theme.semiWhite }]}>
          <Text style={[tw`text-lg font-bold mb-3`, { color: theme.black }]}>Order Summary</Text>
          {cart.map((item, i) => (
            <View key={i} style={tw`flex-row justify-between mb-2`}>
              <Text style={[tw`flex-1`, { color: theme.darkGray }]}>{item.name} x {item.quantity}</Text>
              <Text style={[tw`font-medium`, { color: theme.black }]}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={[tw`border-t pt-3 mt-3`, { borderTopColor: theme.lightGray }]}>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={{ color: theme.darkGray }}>Subtotal:</Text>
              <Text style={{ color: theme.black }}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={{ color: theme.darkGray }}>Shipping:</Text>
              <Text style={{ color: shipping === 0 ? theme.green : theme.black }}>
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </Text>
            </View>
            <View style={tw`flex-row justify-between mt-2 pt-2 border-t border-gray-200`}>
              <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>Total:</Text>
              <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View style={tw`mb-6`}>
          <InputField value={formData.email} onChangeText={(v) => handleInputChange("email", v)} placeholder="Email Address" keyboardType="email-address" />
          <InputField value={formData.fullName} onChangeText={(v) => handleInputChange("fullName", v)} placeholder="Full Name" />
          <InputField value={formData.address} onChangeText={(v) => handleInputChange("address", v)} placeholder="Address" />
          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <InputField value={formData.city} onChangeText={(v) => handleInputChange("city", v)} placeholder="City" />
            </View>
            <View style={tw`flex-1`}>
              <InputField value={formData.state} onChangeText={(v) => handleInputChange("state", v)} placeholder="State" />
            </View>
          </View>
          <InputField value={formData.zipCode} onChangeText={(v) => handleInputChange("zipCode", v)} placeholder="ZIP Code" keyboardType="numeric" maxLength={10} />
        </View>

        <View style={tw`mb-6`}>
          <InputField value={formData.cardholderName} onChangeText={(v) => handleInputChange("cardholderName", v)} placeholder="Cardholder Name" />
          <InputField value={formData.cardNumber} onChangeText={(v) => handleInputChange("cardNumber", formatCardNumber(v))} placeholder="Card Number" keyboardType="numeric" maxLength={19} />
          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <InputField value={formData.expiryDate} onChangeText={(v) => handleInputChange("expiryDate", formatExpiryDate(v))} placeholder="MM/YY" keyboardType="numeric" maxLength={5} />
            </View>
            <View style={tw`flex-1`}>
              <InputField value={formData.cvv} onChangeText={(v) => handleInputChange("cvv", v.replace(/[^0-9]/g, ""))} placeholder="CVV" keyboardType="numeric" maxLength={4} secureTextEntry={true} />
            </View>
          </View>
        </View>

        <View style={[tw`p-4 rounded-lg mb-6 flex-row`, { backgroundColor: theme.lightBeige }]}>
          <Icon name="security" size={20} color={theme.primary} style={tw`mr-3 mt-1`} />
          <View style={tw`flex-1`}>
            <Text style={[tw`text-sm font-medium`, { color: theme.black }]}>Secure Payment</Text>
            <Text style={[tw`text-xs mt-1`, { color: theme.darkGray }]}>Your payment information is encrypted and secure. We use Stripe for payment processing.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}>
        <TouchableOpacity onPress={createCheckoutSession} disabled={loading} style={[tw`py-4 rounded-lg flex-row items-center justify-center`, { backgroundColor: loading ? theme.darkGray : theme.primary }]}>
          {loading ? (
            <ActivityIndicator color={theme.white} style={tw`mr-2`} />
          ) : (
            <Icon name="payment" size={20} color={theme.white} style={tw`mr-2`} />
          )}
          <Text style={[tw`text-lg font-semibold text-white`]}>
            {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`py-3 mt-3 border rounded-lg`, { borderColor: theme.primary }]}>
          <Text style={[tw`text-center text-base font-semibold`, { color: theme.primary }]}>
            Back to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Payment;
