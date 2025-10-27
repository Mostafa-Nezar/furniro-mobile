import React from "react";
import { View, ScrollView } from "react-native";
import Header from "../../components/Header";
import Toast from "react-native-toast-message";
import tw from "twrnc";
import ProfileActionsModal from "./ProfileActionsModal";
import { ProfileProvider, useProfile } from "./ProfileContext";
import ProfileHeader from ".//ProfileHeader";
import HorizontalTabBar from "./HorizontalTabBar";
import FavoritesContent from "./FavoritesContent";
import HistoryContent from "./HistoryContent";
import LocationContent from "./LocationContent";
import PhoneContent from "./PhoneContent";
import EmptyContent from "./EmptyContent";
import NotificationsContent from "./NotificationsContent";

const ProfileScreenContent = () => {
  const { activeTab } = useProfile();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return <FavoritesContent />;
      case 'history':
        return <HistoryContent />;
      case 'location':
        return <LocationContent />;
      case 'phone':
        return <PhoneContent />;
              case 'notifications':
        return <NotificationsContent />;
      default:
        return <EmptyContent icon="info" title="Select a Tab" subtitle="Choose a tab to view its content." />;
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title="My Profile" />
      <ScrollView style={tw`flex-1`}>
        <ProfileHeader />
        <HorizontalTabBar />
        <View style={tw`flex-1`}>
          {renderTabContent()}
        </View>
      </ScrollView>
      <Toast />
      <ProfileActionsModal />
    </View>
  );
};

const MyProfileScreen = () => (
  <ProfileProvider>
    <ProfileScreenContent />
  </ProfileProvider>
);

export default MyProfileScreen;
