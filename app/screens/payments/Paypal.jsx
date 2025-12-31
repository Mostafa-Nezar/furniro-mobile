import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import tw from "twrnc";

export default function Paypal({ route, navigation }) {
  const { approveLink } = route.params;
  const verifyPayment = async (orderID) => {
  const res = await fetch(
    `https://furniro-back-production.up.railway.app/api/paypal2/orders/${orderID}/capture`,
    { method: "POST" }
  );
  const data = await res.json();
  if (data.status === "COMPLETED") {
    Toast.show({type:"success",text1:"Payment successful!"});
      navigation.replace("Ordersuccessscreen");
  } else {
    Toast.show({type:"error",text1:"Payment fail!"});
  }
};


  return (
    <WebView
      source={{ uri: approveLink }}
      startInLoadingState={true}
      renderLoading={() => <ActivityIndicator style={tw`flex-1 justify-center items-center`} />}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes("/checkout/success")) {
          const token = new URL(navState.url).searchParams.get("token");
          verifyPayment(token);
        }
      }}
    />
  );
}

