import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, getProducts } = useAppContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'All');

  const categories = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Lighting'];
  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'price_low', label: 'Price: Low to High' },
    { key: 'price_high', label: 'Price: High to Low' },
    { key: 'newest', label: 'Newest' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sortBy, priceRange, selectedCategory]);

const loadProducts = async () => {
  try {
    setLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    setLoading(false);
  }
};


  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.des.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product =>
        product.des.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  };

  const renderProduct = ({ item }) => (
    <View style={tw`w-1/2 px-1`}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={tw`flex-1 justify-end`}>
        <View style={[
          tw`rounded-t-3xl p-6`,
          { backgroundColor: theme.white, maxHeight: '80%' }
        ]}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={[
              tw`text-xl font-bold`,
              { color: theme.black, fontFamily: 'Poppins-Bold' }
            ]}>
              Filters & Sorting
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={theme.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[
              tw`text-lg font-semibold mb-3`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              Categories
            </Text>
            <View style={tw`flex-row flex-wrap mb-6`}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    tw`px-4 py-2 rounded-full mr-2 mb-2`,
                    {
                      backgroundColor: selectedCategory === category
                        ? theme.primary
                        : theme.lightGray
                    }
                  ]}
                >
                  <Text style={[
                    tw`font-medium`,
                    {
                      color: selectedCategory === category
                        ? theme.white
                        : theme.black,
                      fontFamily: 'Poppins-Medium'
                    }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[
              tw`text-lg font-semibold mb-3`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              Sort By
            </Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSortBy(option.key)}
                style={tw`flex-row items-center py-3`}
              >
                <Icon
                  name={sortBy === option.key ? "radio-button-checked" : "radio-button-unchecked"}
                  size={20}
                  color={theme.primary}
                />
                <Text style={[
                  tw`ml-3 text-base`,
                  { color: theme.black, fontFamily: 'Poppins-Regular' }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[
              tw`text-lg font-semibold mb-3 mt-6`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              Price Range: ${priceRange.min} - ${priceRange.max}
            </Text>
            <View style={tw`flex-row items-center mb-4`}>
              <TextInput
                style={[
                  tw`flex-1 border rounded-lg px-3 py-2 mr-2`,
                  { borderColor: theme.lightGray, color: theme.black }
                ]}
                placeholder="Min"
                value={priceRange.min.toString()}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  tw`flex-1 border rounded-lg px-3 py-2`,
                  { borderColor: theme.lightGray, color: theme.black }
                ]}
                placeholder="Max"
                value={priceRange.max.toString()}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: parseInt(text) || 2000 }))}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={[
              tw`py-4 rounded-lg mt-4`,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-center text-lg font-semibold`,
              { color: theme.white, fontFamily: 'Poppins-SemiBold' }
            ]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Shop" showBack={false} />

      <View style={tw`px-4 py-3`}>
        <View style={[
          tw`flex-row items-center border rounded-lg px-4 py-3`,
          { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }
        ]}>
          <Icon name="search" size={20} color={theme.darkGray} />
          <TextInput
            style={[
              tw`flex-1 ml-3 text-base`,
              { color: theme.black, fontFamily: 'Poppins-Regular' }
            ]}
            placeholder="Search products..."
            placeholderTextColor={theme.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Icon name="tune" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`px-4 pb-2`}>
        <Text style={[
          tw`text-sm`,
          { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
        ]}>
          {filteredProducts.length} products
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </Text>
      </View>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={[
            tw`text-base`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={tw`px-3 pb-6`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={tw`flex-1 justify-center items-center py-12`}>
              <Icon name="search-off" size={64} color={theme.darkGray} />
              <Text style={[
                tw`text-lg font-semibold mt-4 text-center`,
                { color: theme.darkGray, fontFamily: 'Poppins-SemiBold' }
              ]}>
                No products found
              </Text>
              <Text style={[
                tw`text-base mt-2 text-center`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                Try changing the search or filters
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

export default ShopScreen;
