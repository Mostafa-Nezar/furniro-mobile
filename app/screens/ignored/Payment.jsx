import { useState } from "react";
import { Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Payment = () => {
  const nav = useNavigation(), { theme } = useAppContext(),{user}=useAuth(), {clearCartAndUpdateOrsers}=useCart(), [loading, setLoading] = useState(false), [loadingPayPal, setLoadingPayPal] = useState(false), cart = user?.cart || [], subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0), shipping = subtotal >= 100 ? 0 : 0, total = subtotal + shipping;
  const formatCardNumber = (v) => (v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, ""), (v.match(/\d{4,16}/g)?.[0] || "").match(/.{1,4}/g)?.join(" ") || v), formatExpiryDate = (v) => (v = v.replace(/\s+/g, "").replace(/[^0-9]/gi, ""), v.length >= 2 ? v.substring(0, 2) + "/" + v.substring(2, 4) : v);
    validationSchema = Yup.object().shape({
      email: Yup.string().email("Invalid email").required(),
      fullName: Yup.string().required(),
      address: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zipCode: Yup.string().required(),
      cardNumber: Yup.string().min(19).required(),
      expiryDate: Yup.string().matches(/^\d{2}\/\d{2}$/).required(),
      cvv: Yup.string().min(3).max(4).required(),
      cardholderName: Yup.string().required(),
    });
  const createCheckoutSession = async (v) => {
    setLoading(true);
    try {
      const res = await fetch("https://furniro-back-production.up.railway.app/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          products: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          customerInfo: { email: v.email, name: v.fullName, address: { line1: v.address, city: v.city, state: v.state, postal_code: v.zipCode } },
        }),
      }), data = await res.json();
      res.ok && data.url ? (Linking.openURL(data.url), await clearCartAndUpdateOrsers("done")) : Toast.show({ type: "error", text1: "Payment Failure" });
    } catch {
      Toast.show({ type: "error", text1: "Network Error" });
    } finally {
      setLoading(false);
    }
  };
  const getCardType = (number) => {
    const clean = number.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^5[1-5]/.test(clean) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    return null;
  };
  const InputCardField = ({ handleChange, handleBlur, value, placeholder, name }) => {
    const [cardType, setCardType] = useState(null),
      handleInputChange = (t) => {
        const formatted = formatCardNumber(t);
        handleChange(name)(formatted);
        setCardType(getCardType(formatted));
      },
      renderCardLogo = () => {
        const logoStyle = tw`w-8 h-6 rounded bg-white`;
        switch (cardType) {
          case "mastercard": return <Image source={require("../../assets/images/mastercard.png")} style={logoStyle} />;
          case "visa": return <Image source={require("../../assets/images/visa.png")} style={logoStyle} />;
          case "paypal": return <Image source={require("../../assets/images/paypal.png")} style={logoStyle} />;
          case "amex": return <Image source={require("../../assets/images/amex.png")} style={logoStyle} />;
          default: return (
            <>
              <Image source={require("../../assets/images/mastercard.png")} style={logoStyle} />
              <Image source={require("../../assets/images/visa.png")} style={logoStyle} />
              <Image source={require("../../assets/images/paypal.png")} style={logoStyle} />
              <Image source={require("../../assets/images/amex.png")} style={logoStyle} />
            </>
          );
        }
      };

    return (
      <View style={tw`mb-4`}>
        <View style={[tw`rounded-lg border flex-row items-center px-4`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }]}>
          <TextInput
            style={[tw`flex-1 py-4`, { color: theme.black }]}
            onChangeText={handleInputChange}
            onBlur={handleBlur(name)}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={theme.darkGray}
            keyboardType="numeric"
            maxLength={19}
          />
          <View style={tw`flex-row gap-2 ml-2`}>{renderCardLogo()}</View>
        </View>
      </View>
    );
  };
  const handlePayWithPayPal = async () => {
    setLoadingPayPal(true);
    try {
      const u = await AsyncStorage.getItem("user");
      if (!u) return Toast.show({ type: "error", text1: "User Not Found" }), setLoadingPayPal(false);
      const userId = JSON.parse(u)?.id,
        res = await fetch("https://furniro-back-production.up.railway.app/api/paypal/create-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total: total.toFixed(2), userId }),
        }), data = await res.json();
      res.ok && data.approveUrl ? (Linking.openURL(data.approveUrl), await clearCartAndUpdateOrsers("done")) : Toast.show({ type: "error", text1: "Payment Failure" });
    } catch (e) {
      console.error("❌ PayPal error:", e);
      Toast.show({ type: "error", text1: "Disconnected" });
    } finally {
      setLoadingPayPal(false);
    }
  };
  const InputField = ({ handleChange, handleBlur, value, placeholder, keyboardType = "default", maxLength, secureTextEntry = false, name }) => (
    <View style={tw`mb-4`}>
      <TextInput style={[tw`p-4 rounded-lg border`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite, color: theme.black }]} onChangeText={handleChange(name)} onBlur={handleBlur(name)} value={value} placeholder={placeholder} placeholderTextColor={theme.darkGray} keyboardType={keyboardType} maxLength={maxLength} secureTextEntry={secureTextEntry}/>
    </View>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Payment" showBack />
      <Formik initialValues={{ email: user?.email || "", fullName: "", address: "", city: "", state: "", zipCode: "", cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" }} validationSchema={validationSchema} onSubmit={createCheckoutSession}>
        {({ handleChange, handleBlur, handleSubmit, values }) => (
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
              <InputField name="email" value={values.email} handleChange={handleChange} handleBlur={handleBlur} placeholder="Email Address" keyboardType="email-address" />
              <InputField name="fullName" value={values.fullName} handleChange={handleChange} handleBlur={handleBlur} placeholder="Full Name" />
              <InputField name="address" value={values.address} handleChange={handleChange} handleBlur={handleBlur} placeholder="Address" />
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}><InputField name="city" value={values.city} handleChange={handleChange} handleBlur={handleBlur} placeholder="City" /></View>
                <View style={tw`flex-1`}><InputField name="state" value={values.state} handleChange={handleChange} handleBlur={handleBlur} placeholder="State" /></View>
              </View>
              <InputField name="zipCode" value={values.zipCode} handleChange={handleChange} handleBlur={handleBlur} placeholder="ZIP Code" keyboardType="numeric" maxLength={10} />
            </View>
            <View style={tw`mb-6`}>
              <InputField name="cardholderName" value={values.cardholderName} handleChange={handleChange} handleBlur={handleBlur} placeholder="Cardholder Name" />
              <InputCardField name="cardNumber" value={values.cardNumber} handleChange={handleChange} handleBlur={handleBlur} placeholder="Card Number" />
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}><InputField name="expiryDate" value={values.expiryDate} handleChange={(n) => (t) => handleChange(n)(formatExpiryDate(t))} handleBlur={handleBlur} placeholder="MM/YY" keyboardType="numeric" maxLength={5} /></View>
                <View style={tw`flex-1`}><InputField name="cvv" value={values.cvv} handleChange={(n) => (t) => handleChange(n)(t.replace(/[^0-9]/g, ""))} handleBlur={handleBlur} placeholder="CVV" keyboardType="numeric" maxLength={4} secureTextEntry /></View>
              </View>
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
              <TouchableOpacity onPress={handlePayWithPayPal} disabled={loadingPayPal} style={[tw`py-4 rounded-lg flex-row items-center justify-center mt-3`, { backgroundColor: theme.black }]}>
                {loadingPayPal ? <ActivityIndicator color={theme.white} style={tw`mr-2`} /> : <Icon name="account-balance-wallet" size={20} color={theme.white} style={tw`mr-2`} />}
                <Text style={[tw`text-lg font-semibold`,{color:theme.white}]}>Pay with PayPal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav.goBack()} style={[tw`py-3 mt-3 border rounded-lg`, { borderColor: theme.primary }]}>
                <Text style={[tw`text-center text-base font-semibold`, { color: theme.primary }]}>Back to Cart</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Formik>
    </View>
  );
};

export default Payment;