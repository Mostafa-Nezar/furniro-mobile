// import { Modal, View, Text, TouchableOpacity } from 'react-native';
// import tw from "twrnc";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useProfile } from './ProfileContext';
// import { useNavigation } from '@react-navigation/native';

// const ProfileActionsModal = () => {
//   const { isActionsModalVisible, toggleActionsModal, theme } = useProfile();
//   const navigation = useNavigation();

//   const actionButtons = [
//     { name: "Settings", icon: "settings", screen: "SettingsScreen" },
//     { name: "Addresses", icon: "location-city", screen: "AddressesScreen" },
//     { name: "Payment Methods", icon: "payment", screen: "PaymentMethodsScreen" },
//     { name: "Help & Support", icon: "help-outline", screen: "HelpScreen" },
//   ];

//   const handlePress = (screen) => {
//     toggleActionsModal(); 
//     navigation.navigate(screen);
//   };

//   const ActionButton = ({ name, icon, screen }) => (
//     <TouchableOpacity
//       style={[tw`flex-row items-center p-4 border-b`, { borderColor: theme.semiWhite }]}
//       onPress={() => handlePress(screen)}
//     >
//       <Icon name={icon} size={24} color={theme.primary} style={tw`mr-4`} />
//       <Text style={[tw`text-lg font-medium`, { color: theme.black }]}>{name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       animationType="fade"
//       transparent={true}
//       visible={isActionsModalVisible}
//       onRequestClose={toggleActionsModal}
//     >
//       <TouchableOpacity 
//         style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
//         activeOpacity={1}
//         onPress={toggleActionsModal} // إغلاق الموديل عند الضغط خارج المحتوى
//       >
//         <View 
//           style={[tw`w-11/12 rounded-lg p-4`, { backgroundColor: theme.white }]}
//           onStartShouldSetResponder={() => true} // لمنع إغلاق الموديل عند الضغط على محتواه
//         >
//           <View style={tw`flex-row justify-between items-center mb-4`}>
//             <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>Profile Actions</Text>
//             <TouchableOpacity onPress={toggleActionsModal}>
//               <Icon name="close" size={24} color={theme.darkGray} />
//             </TouchableOpacity>
//           </View>

//           {actionButtons.map((btn) => (
//             <ActionButton key={btn.name} {...btn} />
//           ))}
          
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// export default ProfileActionsModal;

import { Modal, View, Text, TouchableOpacity } from 'react-native';
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useProfile } from './ProfileContext';
import { useNavigation } from '@react-navigation/native';

const ProfileActionsModal = () => {
  const { isActionsModalVisible, toggleActionsModal, theme } = useProfile();
  const navigation = useNavigation();

  const actionButtons = [
    { name: "Settings", icon: "settings", screen: "SettingsScreen" },
    { name: "Addresses", icon: "location-city", screen: "AddressesScreen" },
    { name: "Payment Methods", icon: "payment", screen: "PaymentMethodsScreen" },
    { name: "Help & Support", icon: "help-outline", screen: "HelpScreen" },
  ];

  const handlePress = (screen) => {
    toggleActionsModal(); 
    navigation.navigate(screen);
  };

  const ActionButton = ({ name, icon, screen }) => (
    <TouchableOpacity
      style={[tw`flex-row items-center p-4 border-b`, { borderColor: theme.semiWhite }]}
      onPress={() => handlePress(screen)}
    >
      <Icon name={icon} size={24} color={theme.primary} style={tw`mr-4`} />
      <Text style={[tw`text-lg font-medium`, { color: theme.black }]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isActionsModalVisible}
      onRequestClose={toggleActionsModal}
  statusBarTranslucent={true}

    >
      <TouchableOpacity 
        style={tw`flex-1 justify-end bg-black bg-opacity-50`}
        activeOpacity={1}
        onPress={toggleActionsModal}
      >
        <View 
          style={[
            tw`w-full rounded-t-2xl p-4`,
            { 
              backgroundColor: theme.white,
              maxHeight: '80%', // ارتفاع المودال
            }
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* رأس المودال */}
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={[tw`text-xl font-bold`, { color: theme.black }]}>Profile Actions</Text>
            <TouchableOpacity onPress={toggleActionsModal}>
              <Icon name="close" size={24} color={theme.darkGray} />
            </TouchableOpacity>
          </View>

          {/* الأزرار */}
          {actionButtons.map((btn) => (
            <ActionButton key={btn.name} {...btn} />
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ProfileActionsModal;
