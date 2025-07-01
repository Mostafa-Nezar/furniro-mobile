import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Linking } from 'react-native';

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RfzAo4hpzh6swtTe5XoqvV6DcUlufkptuTb7Q4DKfuVgnDDH76ICrTlrw8pXwKGpHscUSZCr9vwniO6e0zc0VT900tEcvmgjR";

const Payment = () => {
  const navigation = useNavigation();
  const { theme, user } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const cart = user?.cart || [];
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const required = [
      "email",
      "fullName",
      "address",
      "city",
      "state",
      "zipCode",
      "cardNumber",
      "expiryDate",
      "cvv",
      "cardholderName",
    ];
    for (let field of required) {
      if (!formData[field].trim()) {
        Alert.alert(
          "Error",
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
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
      const response = await fetch(
        "http://localhost:3001/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
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
              billing_details: {
                name: formData.cardholderName,
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Payment Failed", data.error || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    maxLength,
    secureTextEntry = false,
  }) => (
    <View style={tw`mb-4`}>
      <Text style={[tw`text-sm font-medium mb-2`, { color: theme.black }]}>
        {label}
      </Text>
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
        {/* Order Summary */}
        <View
          style={[
            tw`p-4 rounded-lg mb-6 mt-4`,
            { backgroundColor: theme.semiWhite },
          ]}
        >
          <Text style={[tw`text-lg font-bold mb-3`, { color: theme.black }]}>
            Order Summary
          </Text>
          {cart.map((item, index) => (
            <View key={index} style={tw`flex-row justify-between mb-2`}>
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
              <Text style={{ color: theme.black }}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={{ color: theme.darkGray }}>Shipping:</Text>
              <Text
                style={{ color: shipping === 0 ? theme.green : theme.black }}
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
              <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Billing Information */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: theme.black }]}>
            Billing Information
          </Text>

          <InputField
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <InputField
            label="Full Name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            placeholder="Enter your full name"
          />

          <InputField
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleInputChange("address", value)}
            placeholder="Enter your address"
          />

          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <InputField
                label="City"
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                placeholder="City"
              />
            </View>
            <View style={tw`flex-1`}>
              <InputField
                label="State"
                value={formData.state}
                onChangeText={(value) => handleInputChange("state", value)}
                placeholder="State"
              />
            </View>
          </View>

          <InputField
            label="ZIP Code"
            value={formData.zipCode}
            onChangeText={(value) => handleInputChange("zipCode", value)}
            placeholder="ZIP Code"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Payment Information */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: theme.black }]}>
            Payment Information
          </Text>

          <InputField
            label="Cardholder Name"
            value={formData.cardholderName}
            onChangeText={(value) => handleInputChange("cardholderName", value)}
            placeholder="Name on card"
          />

          <InputField
            label="Card Number"
            value={formData.cardNumber}
            onChangeText={(value) =>
              handleInputChange("cardNumber", formatCardNumber(value))
            }
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
          />

          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <InputField
                label="Expiry Date"
                value={formData.expiryDate}
                onChangeText={(value) =>
                  handleInputChange("expiryDate", formatExpiryDate(value))
                }
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={tw`flex-1`}>
              <InputField
                label="CVV"
                value={formData.cvv}
                onChangeText={(value) =>
                  handleInputChange("cvv", value.replace(/[^0-9]/g, ""))
                }
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={true}
              />
            </View>
          </View>
        </View>

        {/* Security Notice */}
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
              Your payment information is encrypted and secure. We use Stripe
              for payment processing.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}>
        <TouchableOpacity
          onPress={createCheckoutSession}
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
    </View>
  );
};

export default Payment;
