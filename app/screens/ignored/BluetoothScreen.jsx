// import * as React from 'react';
// import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import * as Bluetooth from 'expo-bluetooth';
// import tw from 'twrnc';

// export default function BluetoothScreen() {
//   const [enabled, setEnabled] = React.useState(false);

//   const enableBluetooth = async () => {
//     try {
//       const state = await Bluetooth.getAvailabilityAsync();
//       if (!state) {
//         Alert.alert('⚠️', 'البلوتوث غير متاح على هذا الجهاز.');
//         return;
//       }

//       const permission = await Bluetooth.requestEnabledAsync();
//       if (permission) {
//         setEnabled(true);
//         Alert.alert('✅', 'تم تشغيل البلوتوث بنجاح!');
//       } else {
//         Alert.alert('❌', 'تم رفض تشغيل البلوتوث.');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('حدث خطأ أثناء تشغيل البلوتوث.');
//     }
//   };

//   return (
//     <View style={tw`flex-1 justify-center items-center bg-white`}>
//       <Text style={tw`text-xl mb-4`}>
//         {enabled ? '🔵 البلوتوث مفعل' : '⚪ البلوتوث غير مفعل'}
//       </Text>
//       <TouchableOpacity
//         onPress={enableBluetooth}
//         style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
//       >
//         <Text style={tw`text-white text-lg`}>افتح البلوتوث</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
