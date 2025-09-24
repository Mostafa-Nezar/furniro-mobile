// import React, { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Toast from "react-native-toast-message";
// import tw from "twrnc";

// WebBrowser.maybeCompleteAuthSession();

// export default function RegisterScreen2() {
//   const [myuser, setMyuser] = useState(null);

//   // إعداد Google Login
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     androidClientId:
//       "553617187733-fvjjbctuaa91408osoccn5ggrhj1qesj.apps.googleusercontent.com", // Android client ID
//     webClientId:
//       "553617187733-oa524rs9rb0bt5efmmpr4gr3em8gic9r.apps.googleusercontent.com", // Web client ID
//   });

//   // لما يحصل Response من Google
//   useEffect(() => {
//     if (response?.type === "success") {
//       const { authentication } = response;

//       // إرسال الـ token للسيرفر بتاعك
//       fetch("https://furniro-back-production.up.railway.app/api/auth/google", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token: authentication.idToken }),
//       })
//         .then((res) => res.json())
//         .then(async (data) => {
//           if (data.user && data.token) {
//             await AsyncStorage.setItem("token", data.token);
//             await AsyncStorage.setItem("user", JSON.stringify(data.user));

//             setMyuser(data.user);
//             Toast.show({ type: "success", text1: "Google account created!" });
//           } else {
//             Toast.show({
//               type: "error",
//               text1: data.msg || "Google sign-up error",
//             });
//           }
//         })
//         .catch((err) => {
//           Toast.show({ type: "error", text1: "Login failed", text2: err.message });
//         });
//     }
//   }, [response]);

//   return (
//     <View style={tw`p-4`}>
//       <TouchableOpacity
//         disabled={!request}
//         onPress={() => promptAsync()}
//         style={[
//           tw`flex-row items-center justify-center py-3 rounded-lg mb-3 border`,
//           { borderColor: "#ccc", backgroundColor: "#fff" },
//         ]}
//       >
//         <Text style={[tw`ml-3 text-base font-medium`, { color: "#000" }]}>
//           Sign up with Google
//         </Text>
//       </TouchableOpacity>

//       {myuser && (
//         <Text style={{ marginTop: 10, color: "green" }}>
//           Logged in as {myuser.fullName || myuser.email}
//         </Text>
//       )}
//     </View>
//   );
// }
