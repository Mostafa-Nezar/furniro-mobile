import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const EmptyContent = ({ icon, title, subtitle, theme }) => (
  <View style={tw`flex-1 justify-center items-center py-20`}>
    <Icon name={icon} size={60} color={theme.darkGray} />
    <Text style={[tw`text-lg font-semibold mt-4`, { color: theme.darkGray }]}>{title}</Text>
    <Text style={[tw`text-sm mt-2 text-center`, { color: theme.darkGray }]}>{subtitle}</Text>
  </View>
);

export default EmptyContent;
