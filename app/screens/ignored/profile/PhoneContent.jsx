import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import tw from "twrnc";
import Toast from "react-native-toast-message";
import { useProfile } from './ProfileContext';

const PhoneContent = () => {
  const { theme, user, updatePhone } = useProfile();
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [loading, setLoading] = useState(false);

  const handleSavePhone = async () => {
    if (!/^0\d{9,11}$/.test(phone)) { return Toast.show({ type: "error", text1: "Invalid Phone Number" }) }
    setLoading(true);
    try {
      const success = await updatePhone(user.id, phone);
      if (success) {
        Toast.show({type: "success", text1: user?.phoneNumber ? "Phone updated" : "Phone added", text2: phone });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 p-4`}>
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
          onPress={handleSavePhone}
          disabled={loading}
          style={[tw`py-3 px-6 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold`}>{user?.phoneNumber ? "Update Phone" : "Add Phone"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhoneContent;