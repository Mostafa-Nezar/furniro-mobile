import { useState, useEffect } from "react";
import { View, Button, ActivityIndicator } from "react-native";
import BraintreeDropIn from "react-native-braintree-xplat";
import tw from "twrnc";
import Toast from "react-native-toast-message";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Braintree({ navigation }) {
  const [clientToken, setClientToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(), { cart } = useCart();

  useEffect(() => {
    fetch("https://furniro-back-production.up.railway.app/api/braintree/token")
      .then(res => res.json())
      .then(data => setClientToken(data.clientToken))
      .catch(err => {
        console.error("Token fetch error:", err);
        Toast.show({ type: "error", text1: "Failed to get payment token" });
      });
  }, []);

  const handlePayment = async () => {
    if (!clientToken) {
      Toast.show({ type: "error", text1: "Client token not available" });
      return;
    }

    try {
      const result = await BraintreeDropIn.show({
        clientToken: clientToken,
        merchantIdentifier: "",
        googlePayMerchantId: "",
        countryCode: "ُEG",
        currencyCode: "USD",
        vaultManager: true,
        cardDisabled: false,
        applePay: false,
        googlePay: false,
        paypal: true
      });

      if (result && result.nonce) {
        setLoading(true);
        const res = await fetch("https://furniro-back-production.up.railway.app/api/braintree/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodNonce: result.nonce,
            amount: "10.00", 
            userId: user.id,
            products: cart, 
            customerInfo: { fullName: user.id, email: user.email } 
          })
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
          Toast.show({ type: "success", text1: "Payment successful!" });
          navigation.replace("Ordersuccessscreen"); 
        } else {
          Toast.show({ type: "error", text1: "Payment failed", text2: data.error });
        }
      }
    } catch (err) {
      console.error("Braintree payment error:", err);
      Toast.show({ type: "error", text1: "Payment cancelled or failed" });
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      {loading && <ActivityIndicator size="large" />}
      <Button title="Pay with Braintree" onPress={handlePayment} />
    </View>
  );
}
