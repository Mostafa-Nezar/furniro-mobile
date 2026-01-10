import React from "react";
import { View } from "react-native";
import tw from "twrnc";
import SidebarHeader from "./SidebarHeader";
import EmptyContent from "./EmptyContent";

const SidebarGenericContent = ({ title, icon, theme, onClose }) => (
  <View style={tw`flex-1 p-4`}>
    <SidebarHeader title={title} theme={theme} onClose={onClose} />
    <EmptyContent icon={icon} title="Coming Soon" subtitle="This feature is under development." theme={theme} />
  </View>
);

export default SidebarGenericContent;
