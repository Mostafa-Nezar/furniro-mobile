import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import tw from "twrnc";
import SidebarHeader from "./SidebarHeader";
import Toast from "react-native-toast-message";

const SidebarPhoneContent = ({ user, theme, onClose, onSavePhone }) => {
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!/^0\d{9,11}$/.test(phone)) {
      return Toast.show({ type: "error", text1: "Invalid Phone Number" });
    }
    setLoading(true);
    try {
      await onSavePhone(phone);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 p-4`}>
      <SidebarHeader title={user?.phoneNumber ? "Update Phone" : "Add Phone"} theme={theme} onClose={onClose} />
      <View style={tw`mt-8`}>
        <TextInput
          style={[tw`border p-3 rounded-lg mb-4`, { borderColor: theme.primary, color: theme.black }]}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          placeholderTextColor={theme.darkGray}
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[tw`py-3 px-6 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold`}>
              {user?.phoneNumber ? "Update Phone" : "Save Phone"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SidebarPhoneContent;
