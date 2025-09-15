import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator,TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

// --- استيراد الأدوات اللازمة من Stripe ---
import { useStripe, CardField } from '@stripe/stripe-react-native';

// مكون إدخال نصي معاد استخدامه
const InputField = ({ theme, handleChange, handleBlur, value, placeholder, keyboardType = "default", name }) => (
  <View style={tw`mb-4`}>
    <TextInput
      style={[tw`p-4 rounded-lg border`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite, color: theme.black }]}
      onChangeText={handleChange(name)}
      onBlur={handleBlur(name)}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.darkGray}
      keyboardType={keyboardType}
    />
  </View>
);

const Payment3 = () => {
  // --- 1. إعداد الـ Hooks والسياقات ---
  const nav = useNavigation();
  const { theme } = useAppContext();
  const { user } = useAuth();
  const { clearCartAndUpdateOrsers } = useCart();
  const { confirmPayment, loading: stripeLoading } = useStripe(); // Hook Stripe

  const [loading, setLoading] = useState(false);
  const cart = user?.cart || [];
  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 0;
  const total = subtotal + shipping;

  // --- 2. مخطط التحقق من صحة البيانات (Yup) ---
  // تم تبسيطه ليشمل فقط البيانات التي نحتاجها الآن
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    fullName: Yup.string().required("Full name is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zipCode: Yup.string().required("ZIP Code is required"),
  });

  // --- 3. الدالة النهائية والشاملة للدفع ---
  const handlePaymentSubmit = async (formValues) => {
    if (cart.length === 0) {
      Toast.show({ type: 'info', text1: 'Your cart is empty' });
      return;
    }
    setLoading(true);

    // --- الخطوة أ: طلب 'clientSecret' من الخادم ---
    let clientSecret;
    try {
      const response = await fetch("https://furniro-back-production.up.railway.app/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: total } ), // نرسل المبلغ الإجمالي فقط
      });
      const data = await response.json();
      if (data.error || !data.clientSecret) {
        throw new Error(data.error || "Failed to get payment secret from server.");
      }
      clientSecret = data.clientSecret;
    } catch (error) {
      console.error("❌ Server Error (create-payment-intent):", error);
      Toast.show({ type: 'error', text1: 'Server Error', text2: error.message });
      setLoading(false);
      return;
    }

    // --- الخطوة ب: تأكيد الدفع في الواجهة الأمامية باستخدام Stripe ---
    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        type: 'Card',
        billingDetails: {
          email: formValues.email,
          name: formValues.fullName,
          address: {
            line1: formValues.address,
            city: formValues.city,
            state: formValues.state,
            postalCode: formValues.zipCode,
            country: 'US', // يمكنك جعل هذا الحقل ديناميكيًا
          },
        },
      });

      if (error) {
        // إذا فشل الدفع (بطاقة مرفوضة، خطأ في البيانات، إلخ)
        throw new Error(error.message);
      }

      // --- الخطوة ج: الدفع نجح! ---
      console.log("✅ Payment successful! Payment Intent ID:", paymentIntent.id);
      Toast.show({ type: 'success', text1: 'Payment Successful!' });

      // الآن نقوم بمسح سلة التسوق وتحديث الطلبات
      await clearCartAndUpdateOrsers("done");
      
      // يمكنك الانتقال إلى صفحة نجاح الطلب
      // nav.navigate('OrderSuccessScreen');

    } catch (paymentError) {
      console.error("❌ Stripe Payment Error:", paymentError);
      Toast.show({ type: 'error', text1: 'Payment Failed', text2: paymentError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Payment" showBack />
      <Formik
        initialValues={{ email: user?.email || "", fullName: "", address: "", city: "", state: "", zipCode: "" }}
        validationSchema={validationSchema}
        onSubmit={handlePaymentSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
            {/* --- ملخص الطلب (Order Summary) --- */}
            <View style={[tw`p-4 rounded-lg mb-6 mt-4`, { backgroundColor: theme.semiWhite }]}>
              <Text style={[tw`text-lg font-bold mb-3`, { color: theme.black }]}>Order Summary</Text>
              {cart.map((item, i) => (
                <View key={i} style={tw`flex-row justify-between mb-2`}>
                  <Text style={[tw`flex-1`, { color: theme.darkGray }]}>{item.name} x {item.quantity}</Text>
                  <Text style={[tw`font-medium`, { color: theme.black }]}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View style={[tw`border-t pt-3 mt-3`, { borderTopColor: theme.lightGray }]}>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={{ color: theme.darkGray }}>Subtotal:</Text>
                  <Text style={{ color: theme.black }}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={tw`flex-row justify-between`}>
                  <Text style={{ color: theme.darkGray }}>Total:</Text>
                  <Text style={[tw`text-lg font-bold`, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* --- معلومات الشحن (Shipping Information) --- */}
            <View style={tw`mb-6`}>
              <InputField theme={theme} name="email" value={values.email} handleChange={handleChange} handleBlur={handleBlur} placeholder="Email Address" keyboardType="email-address" />
              {errors.email && touched.email && <Text style={tw`text-red-500 mb-2`}>{errors.email}</Text>}
              
              <InputField theme={theme} name="fullName" value={values.fullName} handleChange={handleChange} handleBlur={handleBlur} placeholder="Full Name" />
              {errors.fullName && touched.fullName && <Text style={tw`text-red-500 mb-2`}>{errors.fullName}</Text>}

              <InputField theme={theme} name="address" value={values.address} handleChange={handleChange} handleBlur={handleBlur} placeholder="Address" />
              {errors.address && touched.address && <Text style={tw`text-red-500 mb-2`}>{errors.address}</Text>}

              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}>
                  <InputField theme={theme} name="city" value={values.city} handleChange={handleChange} handleBlur={handleBlur} placeholder="City" />
                  {errors.city && touched.city && <Text style={tw`text-red-500 mb-2`}>{errors.city}</Text>}
                </View>
                <View style={tw`flex-1`}>
                  <InputField theme={theme} name="state" value={values.state} handleChange={handleChange} handleBlur={handleBlur} placeholder="State" />
                  {errors.state && touched.state && <Text style={tw`text-red-500 mb-2`}>{errors.state}</Text>}
                </View>
              </View>
              <InputField theme={theme} name="zipCode" value={values.zipCode} handleChange={handleChange} handleBlur={handleBlur} placeholder="ZIP Code" keyboardType="numeric" />
              {errors.zipCode && touched.zipCode && <Text style={tw`text-red-500 mb-2`}>{errors.zipCode}</Text>}
            </View>

            {/* --- 4. مكون Stripe الآمن لبيانات البطاقة --- */}
            <View style={tw`mb-6`}>
              <Text style={[tw`text-lg font-bold mb-3`, { color: theme.black }]}>Payment Details</Text>
              <CardField
                postalCodeEnabled={false} // قمنا بتعطيله لأننا نجمعه في حقل منفصل
                style={[tw`w-full h-14`, { color: theme.black }]}
                cardStyle={{
                  backgroundColor: theme.semiWhite,
                  textColor: theme.black,
                  borderColor: theme.lightGray,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              />
            </View>

            {/* --- زر الدفع النهائي --- */}
            <View style={[tw`p-4 border-t`, { borderTopColor: theme.lightGray }]}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || stripeLoading}
                style={[tw`py-4 rounded-lg flex-row items-center justify-center`, { backgroundColor: (loading || stripeLoading) ? theme.darkGray : theme.primary }]}
              >
                {(loading || stripeLoading) ? <ActivityIndicator color={theme.white} style={tw`mr-2`} /> : <Icon name="payment" size={20} color={theme.white} style={tw`mr-2`} />}
                <Text style={[tw`text-lg font-semibold text-white`]}>
                  {(loading || stripeLoading) ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Formik>
    </View>
  );
};

export default Payment3;
