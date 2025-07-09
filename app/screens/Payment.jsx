import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const Payment = () => {
  const navigation = useNavigation();
  const { theme, user, clearCartAndUpdateOrsers } = useAppContext();
  const [loading, setLoading] = useState(false);

  const cart = user?.cart || [];
  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const formatCardNumber = (v) => {
    v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const m = v.match(/\d{4,16}/g),
      parts = [];
    const match = (m && m[0]) || "";
    for (let i = 0; i < match.length; i += 4)
      parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiryDate = (v) => {
    v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return v.length >= 2 ? v.substring(0, 2) + "/" + v.substring(2, 4) : v;
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    fullName: Yup.string().required("Full name is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zipCode: Yup.string().required("ZIP Code is required"),
    cardNumber: Yup.string()
      .min(19, "Card number is too short")
      .required("Card number is required"),
    expiryDate: Yup.string()
      .matches(/^\d{2}\/\d{2}$/, "Expiry date must be MM/YY")
      .required("Expiry date is required"),
    cvv: Yup.string().min(3).max(4).required("CVV is required"),
    cardholderName: Yup.string().required("Cardholder name is required"),
  });

  const createCheckoutSession = async (values) => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            products: cart.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            customerInfo: {
              email: values.email,
              name: values.fullName,
              address: {
                line1: values.address,
                city: values.city,
                state: values.state,
                postal_code: values.zipCode,
              },
            },
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.url) {
        Linking.openURL(data.url);
        await clearCartAndUpdateOrsers();
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failure",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Network Error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePayWithPayPal = async () => {
    setLoading(true);
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        Toast.show({
          type: "error",
          text1: "User Not Found",
        });
        setLoading(false);
        return;
      }
      const userId = JSON.parse(user)?.id;
      console.log("PayPal pressed ✅", userId);
      const res = await fetch(
        "http://localhost:3001/api/paypal/create-paypal-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: total.toFixed(2),
            userId,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.approveUrl) {
        Linking.openURL(data.approveUrl);
        await clearCartAndUpdateOrsers();
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failure",
        });
      }
    } catch (err) {
      console.error("❌ PayPal error:", err);
      Toast.show({
        type: "error",
        text1: "Disconnected",
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    handleChange,
    handleBlur,
    value,
    placeholder,
    keyboardType = "default",
    maxLength,
    secureTextEntry = false,
    name,
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
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        value={value}
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
      <Formik
        initialValues={{
          email: user?.email || "",
          fullName: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        }}
        validationSchema={validationSchema}
        onSubmit={createCheckoutSession}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <ScrollView
            style={tw`flex-1 px-4`}
            showsVerticalScrollIndicator={false}
          >
            {/* Order Summary ... (keep same) */}
            <View
              style={[
                tw`p-4 rounded-lg mb-6 mt-4`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Text
                style={[tw`text-lg font-bold mb-3`, { color: theme.black }]}
              >
                Order Summary
              </Text>
              {cart.map((item, i) => (
                <View key={i} style={tw`flex-row justify-between mb-2`}>
                  <Text style={[tw`flex-1`, { color: theme.darkGray }]}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={[tw`font-medium`, { color: theme.black }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              <View
                style={[
                  tw`border-t pt-3 mt-3`,
                  { borderTopColor: theme.lightGray },
                ]}
              >
                <View style={tw`flex-row justify-between mb-1`}>
                  <Text style={{ color: theme.darkGray }}>Subtotal:</Text>
                  <Text style={{ color: theme.black }}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between mb-1`}>
                  <Text style={{ color: theme.darkGray }}>Shipping:</Text>
                  <Text
                    style={{
                      color: shipping === 0 ? theme.green : theme.black,
                    }}
                  >
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </Text>
                </View>
                <View
                  style={tw`flex-row justify-between mt-2 pt-2 border-t border-gray-200`}
                >
                  <Text style={[tw`text-lg font-bold`, { color: theme.black }]}>
                    Total:
                  </Text>
                  <Text
                    style={[tw`text-lg font-bold`, { color: theme.primary }]}
                  >
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={tw`mb-6`}>
              <InputField
                name="email"
                value={values.email}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Email Address"
                keyboardType="email-address"
              />
              <InputField
                name="fullName"
                value={values.fullName}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Full Name"
              />
              <InputField
                name="address"
                value={values.address}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Address"
              />
              {/* City + State */}
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}>
                  <InputField
                    name="city"
                    value={values.city}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    placeholder="City"
                  />
                </View>
                <View style={tw`flex-1`}>
                  <InputField
                    name="state"
                    value={values.state}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    placeholder="State"
                  />
                </View>
              </View>
              <InputField
                name="zipCode"
                value={values.zipCode}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="ZIP Code"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={tw`mb-6`}>
              <InputField
                name="cardholderName"
                value={values.cardholderName}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Cardholder Name"
              />
              <InputField
                name="cardNumber"
                value={values.cardNumber}
                handleChange={(name) => (text) =>
                  handleChange(name)(formatCardNumber(text))}
                handleBlur={handleBlur}
                placeholder="Card Number"
                keyboardType="numeric"
                maxLength={19}
              />
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}>
                  <InputField
                    name="expiryDate"
                    value={values.expiryDate}
                    handleChange={(name) => (text) =>
                      handleChange(name)(formatExpiryDate(text))}
                    handleBlur={handleBlur}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <InputField
                    name="cvv"
                    value={values.cvv}
                    handleChange={(name) => (text) =>
                      handleChange(name)(text.replace(/[^0-9]/g, ""))}
                    handleBlur={handleBlur}
                    placeholder="CVV"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={true}
                  />
                </View>
              </View>
            </View>

            {/* Secure Payment Note */}
            <View
              style={[
                tw`p-4 rounded-lg mb-6 flex-row`,
                { backgroundColor: theme.lightBeige },
              ]}
            >
              <Icon
                name="security"
                size={20}
                color={theme.primary}
                style={tw`mr-3 mt-1`}
              />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-sm font-medium`, { color: theme.black }]}>
                  Secure Payment
                </Text>
                <Text style={[tw`text-xs mt-1`, { color: theme.darkGray }]}>
                  Your payment information is encrypted and secure. We use
                  Stripe for payment processing.
                </Text>
              </View>
            </View>

            <View
              style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  tw`py-4 rounded-lg flex-row items-center justify-center`,
                  { backgroundColor: loading ? theme.darkGray : theme.primary },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.white} style={tw`mr-2`} />
                ) : (
                  <Icon
                    name="payment"
                    size={20}
                    color={theme.white}
                    style={tw`mr-2`}
                  />
                )}
                <Text style={[tw`text-lg font-semibold text-white`]}>
                  {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePayWithPayPal}
                disabled={loading}
                style={[
                  tw`py-4 rounded-lg flex-row items-center justify-center mt-3`,
                  { backgroundColor: theme.black },
                ]}
              >
                <Icon
                  name="account-balance-wallet"
                  size={20}
                  color={theme.white}
                  style={tw`mr-2`}
                />
                <Text style={[tw`text-lg font-semibold text-white`]}>
                  Pay with PayPal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[
                  tw`py-3 mt-3 border rounded-lg`,
                  { borderColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    tw`text-center text-base font-semibold`,
                    { color: theme.primary },
                  ]}
                >
                  Back to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Formik>
    </View>
  );
};

export default Payment;
