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
import { DataService } from '../services/DataService';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useAppContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'الكل');

  const categories = ['الكل', 'غرف المعيشة', 'غرف النوم', 'المطبخ', 'الإضاءة'];
  const sortOptions = [
    { key: 'name', label: 'الاسم' },
    { key: 'price_low', label: 'السعر: من الأقل للأعلى' },
    { key: 'price_high', label: 'السعر: من الأعلى للأقل' },
    { key: 'newest', label: 'الأحدث' },
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
      const productsData = await DataService.getProducts();
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

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.des.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'الكل') {
      filtered = filtered.filter(product =>
        product.des.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
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
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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
              الفلاتر والترتيب
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={theme.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <Text style={[
              tw`text-lg font-semibold mb-3`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              الفئات
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

            {/* Sort Options */}
            <Text style={[
              tw`text-lg font-semibold mb-3`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              ترتيب حسب
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

            {/* Price Range */}
            <Text style={[
              tw`text-lg font-semibold mb-3 mt-6`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              نطاق السعر: ${priceRange.min} - ${priceRange.max}
            </Text>
            <View style={tw`flex-row items-center mb-4`}>
              <TextInput
                style={[
                  tw`flex-1 border rounded-lg px-3 py-2 mr-2`,
                  { borderColor: theme.lightGray, color: theme.black }
                ]}
                placeholder="الحد الأدنى"
                value={priceRange.min.toString()}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  tw`flex-1 border rounded-lg px-3 py-2`,
                  { borderColor: theme.lightGray, color: theme.black }
                ]}
                placeholder="الحد الأقصى"
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
              تطبيق الفلاتر
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="المتجر" showBack={false} />

      {/* Search Bar */}
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
            placeholder="البحث عن المنتجات..."
            placeholderTextColor={theme.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Icon name="tune" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={tw`px-4 pb-2`}>
        <Text style={[
          tw`text-sm`,
          { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
        ]}>
          {filteredProducts.length} منتج
          {selectedCategory !== 'الكل' && ` في ${selectedCategory}`}
        </Text>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={[
            tw`text-base`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            جاري التحميل...
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
                لم يتم العثور على منتجات
              </Text>
              <Text style={[
                tw`text-base mt-2 text-center`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                جرب تغيير معايير البحث أو الفلاتر
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

