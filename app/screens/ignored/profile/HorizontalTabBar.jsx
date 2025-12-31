import { View, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";
import { useProfile } from './ProfileContext';

const TabBarButton = ({ tabKey, iconName }) => {
  const { activeTab, setActiveTab, theme } = useProfile();
  
  return (
    <TouchableOpacity
      onPress={() => setActiveTab(tabKey)}
      style={[
        tw`flex-1 items-center justify-center py-3`,
        activeTab === tabKey && { borderBottomWidth: 2, borderBottomColor: theme.black },
      ]}
    >
      <Icon name={iconName} size={24} color={activeTab === tabKey ? theme.black : theme.darkGray} />
    </TouchableOpacity>
  );
};

const HorizontalTabBar = () => (
  <View style={tw`flex-row border-b border-gray-200 mt-4`}>
    <TabBarButton tabKey="favorites" iconName="favorite-border" />
    <TabBarButton tabKey="history" iconName="history" />
    <TabBarButton tabKey="location" iconName="location-on" />
    <TabBarButton tabKey="notifications" iconName="notifications" />
    <TabBarButton tabKey="phone" iconName="phone" />
  </View>
);

export default HorizontalTabBar;