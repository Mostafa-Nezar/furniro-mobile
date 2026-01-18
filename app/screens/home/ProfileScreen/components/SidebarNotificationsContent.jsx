import { View, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";
import SidebarHeader from "./SidebarHeader";
import EmptyContent from "./EmptyContent";

const SidebarNotificationsContent = ({ notifications, theme, onClose, formatDate }) => (
  <View style={tw`flex-1 p-4`}>
    <SidebarHeader title="Notifications" theme={theme} onClose={onClose} />
    <ScrollView>
      {notifications.length > 0 ? (
        notifications.map((n) => (
          <View key={n._id} style={[tw`p-4 mb-3 rounded-lg flex-row justify-between`, { backgroundColor: n.read ? theme.semiWhite : theme.lightBeige }]}>
            <View style={tw`flex-1 pr-2`}>
              <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{n.message}</Text>
              <Text style={[tw`text-sm mt-1`, { color: theme.darkGray }]}>{formatDate(n.createdAt)}</Text>
            </View>
            <Icon name={n.read ? "notifications-none" : "notifications"} size={24} color={theme.primary} />
          </View>
        ))
      ) : (
        <EmptyContent icon="notifications-off" title="No Notifications" subtitle="You have no new notifications." theme={theme} />
      )}
    </ScrollView>
  </View>
);

export default SidebarNotificationsContent;
