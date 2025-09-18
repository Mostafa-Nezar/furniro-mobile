import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";
import * as Yup from "yup";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../components/Header.jsx";

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zipCode: Yup.string().required("ZIP code is required"),
});

// Reusable InputField component
const InputField = ({ handleChange, handleBlur, value, placeholder, keyboardType = "default", name, error, touched, theme }) => (
  <View style={tw`mb-4`}>
    <TextInput
      style={[
        tw`p-4 rounded-lg border`,
        {
          borderColor: touched && error ? "red" : theme.lightGray,
          backgroundColor: theme.semiWhite,
          color: theme.black,
        },
      ]}
      onChangeText={handleChange(name)}
      onBlur={handleBlur(name)}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.darkGray}
      keyboardType={keyboardType}
    />
    {touched && error && <Text style={tw`text-red-500 mt-1`}>{error}</Text>}
  </View>
);

const Payment2 = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { theme } = useAppContext();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url.includes("https://furniro-react-jade.vercel.app" )) {
        clearCart();
        Alert.alert("Success", "Your payment was successful!");
        navigation.navigate("Home");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [clearCart, navigation]);

  const handleCheckout = async (values) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://furniro-back-production.up.railway.app/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` } ),
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
              fullName: values.fullName,
              email: values.email,
              address: values.address,
              city: values.city,
              state: values.state,
              zipCode: values.zipCode,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      } else {
        Alert.alert("Error", data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("Error", "A server connection issue occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Payment" showBack />
      <Formik
        initialValues={{
          fullName:user?.name || "",
          email: user?.email || "",
          address: user?.location || "",
          city: "",
          state: "",
          zipCode: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleCheckout}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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
                  <Text style={{ color: shipping === 0 ? theme.green : theme.black }}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</Text>
                </View>
                <View style={tw`flex-row justify-between mt-2 pt-2 border-t border-gray-200`}>
                  <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>Total:</Text>
                  <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
            <View style={tw`mb-6`}>
              <InputField name="fullName" value={values.fullName} handleChange={handleChange} handleBlur={handleBlur} placeholder="Full Name" error={errors.fullName} touched={touched.fullName} theme={theme} />
              <InputField name="email" value={values.email} handleChange={handleChange} handleBlur={handleBlur} placeholder="Email Address" keyboardType="email-address" error={errors.email} touched={touched.email} theme={theme} />
              <InputField name="address" value={values.address} handleChange={handleChange} handleBlur={handleBlur} placeholder="Address" error={errors.address} touched={touched.address} theme={theme} />
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}><InputField name="city" value={values.city} handleChange={handleChange} handleBlur={handleBlur} placeholder="City" error={errors.city} touched={touched.city} theme={theme} /></View>
                <View style={tw`flex-1`}><InputField name="state" value={values.state} handleChange={handleChange} handleBlur={handleBlur} placeholder="State" error={errors.state} touched={touched.state} theme={theme} /></View>
              </View>
              <InputField name="zipCode" value={values.zipCode} handleChange={handleChange} handleBlur={handleBlur} placeholder="ZIP Code" keyboardType="numeric" error={errors.zipCode} touched={touched.zipCode} theme={theme} />
            </View>
            <View style={[tw`p-4 rounded-lg mb-6 flex-row`, { backgroundColor: theme.lightBeige }]}>
              <Icon name="security" size={20} color={theme.primary} style={tw`mr-3 mt-1`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-sm font-medium`, { color: theme.black }]}>Secure Payment</Text>
                <Text style={[tw`text-xs mt-1`, { color: theme.darkGray }]}>Your payment information is encrypted and secure. We use Stripe for payment processing.</Text>
              </View>
            </View>
            <View style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}>
              <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[tw`py-4 rounded-lg flex-row items-center justify-center`, { backgroundColor: loading ? theme.darkGray : theme.primary }]}>
                {loading ? <ActivityIndicator color={theme.white} style={tw`mr-2`} /> : <Icon name="payment" size={20} color={theme.white} style={tw`mr-2`} />}
                <Text style={[tw`text-lg font-semibold text-white`]}>{loading ? "Processing..." : `Pay $${total.toFixed(2)}`}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`py-3 mt-3 border rounded-lg`, { borderColor: theme.primary }]}>
                <Text style={[tw`text-center text-base font-semibold`, { color: theme.primary }]}>Back to Cart</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Formik>
    </View>
  );
};

export default Payment2;