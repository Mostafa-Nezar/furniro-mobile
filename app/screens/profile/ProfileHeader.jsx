import React from 'react';
import { View, Text, TouchableOpacity, Image, Switch, ActivityIndicator } from 'react-native';
import tw from "twrnc";
import { useProfile } from './ProfileContext';

const ProfileHeader = () => {
  const { 
    theme, 
    user, 
    isDarkMode, 
    toggleTheme, 
    getImageUrl, 
    pickImage, 
    handleLogout, 
    isUploading 
  } = useProfile();

  return (
    <View style={tw`p-4 items-center`}>
      <TouchableOpacity onPress={pickImage} disabled={isUploading}>
        <Image
          source={{ uri: getImageUrl(user?.image) || 'https://via.placeholder.com/150' }}
          style={tw`w-24 h-24 rounded-full border-4`}
        />
        {isUploading && (
          <View style={tw`absolute inset-0 justify-center items-center bg-black bg-opacity-50 rounded-full`}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      
      {/* User Info */}
      <Text style={[tw`text-xl font-bold mt-2`, { color: theme.black }]}>{user?.name}</Text>
      <Text style={[tw`text-sm`, { color: theme.darkGray }]}>{user?.email}</Text>
      
      {/* Dark Mode Switch */}
      <View style={tw`flex-row items-center mt-4`}>
        <Text style={[tw`mr-2`, { color: theme.black }]}>Dark Mode</Text>
        <Switch
          trackColor={{ false: theme.darkGray, true: theme.primary }}
          thumbColor={isDarkMode ? theme.white : theme.white}
          onValueChange={toggleTheme}
          value={isDarkMode}
        />
      </View>
      
      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={[tw`mt-4 py-2 px-4 rounded-lg`, { backgroundColor: theme.red }]}>
        <Text style={tw`text-white font-semibold`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;