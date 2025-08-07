import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";

const SearchScreen = () => {
  const navigation = useNavigation();
  const { theme, searchProducts } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState(["Chair", "Table", "Bed", "Wardrobe", "Lamp", "Sofa", "Desk", "Shelf"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchQuery.length > 2 ? performSearch() : setSearchResults([]);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = (query) => setSearchQuery(query);
  const clearRecentSearches = () => setRecentSearches([]);

  const renderProduct = ({ item }) => (
    <View style={tw`w-1/2 px-1`}>
      <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { product: item })} />
    </View>
  );

  const renderSearchSuggestion = (title, onPress, showClear = false) => (
    <TouchableOpacity
      onPress={onPress}
      style={[tw`flex-row items-center justify-between p-3 border-b`, { borderBottomColor: theme.lightGray }]}
    >
      <View style={tw`flex-row items-center flex-1`}>
        <Icon name="search" size={20} color={theme.darkGray} />
        <Text style={[tw`ml-3 text-base`, { color: theme.black, fontFamily: "Poppins-Regular" }]}>{title}</Text>
      </View>
      {showClear && (
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); clearRecentSearches(); }}>
          <Icon name="clear" size={20} color={theme.darkGray} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Search" showBack showSearch={false} />
      <View style={tw`px-4 py-3`}>
        <View style={[tw`flex-row items-center border rounded-lg px-4 py-3`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }]}>
          <Icon name="search" size={20} color={theme.darkGray} />
          <TextInput
            style={[tw`flex-1 ml-3 text-base`, { color: theme.black, fontFamily: "Poppins-Regular" }]}
            placeholder="Search for products..."
            placeholderTextColor={theme.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}> <Icon name="clear" size={20} color={theme.darkGray} /> </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length > 2 ? (
        <View style={tw`flex-1`}>
          {loading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={[tw`text-base`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <View style={tw`px-4 py-2`}>
                <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}> {searchResults.length} results found for "{searchQuery}" </Text>
              </View>
              <FlatList
                data={searchResults}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={tw`px-3 pb-6`}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={tw`flex-1 justify-center items-center px-6`}>
              <Icon name="search-off" size={64} color={theme.darkGray} />
              <Text style={[tw`text-lg font-semibold mt-4 text-center`, { color: theme.darkGray, fontFamily: "Poppins-SemiBold" }]}>No results found</Text>
              <Text style={[tw`text-base mt-2 text-center`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>Try searching with different keywords</Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={tw`flex-1`}>
          {recentSearches.length > 0 && (
            <View style={tw`mb-6`}>
              <View style={tw`flex-row items-center justify-between px-4 py-3`}>
                <Text style={[tw`text-lg font-semibold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={[tw`text-sm`, { color: theme.primary, fontFamily: "Poppins-Regular" }]}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <View key={index}>{renderSearchSuggestion(search, () => handleSearchPress(search), index === 0)}</View>
              ))}
            </View>
          )}

          <View>
            <Text style={[tw`text-lg font-semibold px-4 py-3`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Popular Searches</Text>
            <View style={tw`px-4 pb-4`}>
              <View style={tw`flex-row flex-wrap`}>
                {popularSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSearchPress(search)}
                    style={[tw`px-4 py-2 rounded-full mr-2 mb-2`, { backgroundColor: theme.lightGray }]}
                  >
                    <Text style={[tw`text-sm`, { color: theme.black, fontFamily: "Poppins-Regular" }]}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[tw`mx-4 p-4 rounded-lg`, { backgroundColor: theme.lightBeige }]}>
            <Text style={[tw`text-base font-semibold mb-2`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Search Tips</Text>
            <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>• Use simple keywords • Try product name or category • Check your spelling</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default SearchScreen;
