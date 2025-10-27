import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useProfile } from './ProfileContext';
import EmptyContent from './EmptyContent';

const FavoritesContent = () => {
  const { theme, favoriteProducts, getImageUrl, toggleFavorite, favorites } = useProfile();

  return (
    <ScrollView style={tw`flex-1 p-4`}>
      {favoriteProducts.length > 0 ? favoriteProducts.map((item) => (
        <View key={item.id} style={[tw`flex-row p-4 mb-3 rounded-lg items-center`, { backgroundColor: theme.semiWhite }]}>
          <Image source={{ uri: getImageUrl(item.image) }} style={tw`w-15 h-15 rounded-lg`} />
          <View style={tw`ml-3 flex-1`}>
            <Text style={[tw`text-base font-semibold`, { color: theme.black }]}>{item.name}</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray }]}>${item.price}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Icon name={favorites.includes(item.id) ? "favorite" : "favorite-border"} size={24} color={theme.red} />
          </TouchableOpacity>
        </View>
      )) : <EmptyContent icon="favorite-border" title="No Favorites" subtitle="Add items to your favorites" />}
    </ScrollView>
  );
};

export default FavoritesContent;