import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Rect, Polygon, Line, Path, G } from 'react-native-svg';
import Animated, {useSharedValue, useAnimatedProps, withTiming, withDelay, withRepeat, Easing,} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

 function AnimatedLoader({ size = 40, stroke = 2, color = "#000" }) {
  const dash1 = useSharedValue(4);
  const dash2 = useSharedValue(28);
  const dash3 = useSharedValue(8);

  const rot2 = useSharedValue(0); 
  const rot3 = useSharedValue(0);

  useEffect(() => {
    dash1.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
    dash2.value = withDelay(
      200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    dash3.value = withDelay(
      600,
      withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) })
    );

    rot2.value = withDelay(
      900,
      withRepeat(
        withTiming(0, { duration: 6000, easing: Easing.linear }),
        -1,
        false
      )
    );
    rot3.value = withDelay(
      1100,
      withRepeat(
        withTiming(0, { duration: 6000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => ({
    strokeDashoffset: dash1.value,
  }));

  const animatedProps2 = useAnimatedProps(() => ({
    strokeDashoffset: dash2.value,
  }));

  const animatedProps3 = useAnimatedProps(() => ({
    strokeDashoffset: dash3.value,
  }));

  const animatedGroupProps = useAnimatedProps(() => {
    return {
      transform: `rotate(0 12 3)`,
    };
  });

  return (
    <View style={[tw`p-10`,{ width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <AnimatedG 
          animatedProps={animatedGroupProps}
          stroke="none"
        >
          <AnimatedPath
            d="M12 3v2"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            strokeDasharray="4"
            animatedProps={animatedProps1}
            fill="none"
          />

          <AnimatedPath
            d="M12 5c-3.31 0 -6 2.69 -6 6l0 6c-1 0 -2 1 -2 2h8M12 5c3.31 0 6 2.69 6 6l0 6c1 0 2 1 2 2h-8"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            strokeDasharray="28"
            animatedProps={animatedProps2}
            fill="none"
          />
        </AnimatedG>

        <AnimatedPath
          d="M10 20c0 1.1 0.9 2 2 2c1.1 0 2 -0.9 2 -2"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={stroke}
          strokeDasharray="8"
          animatedProps={animatedProps3}
          fill="none"
        />
      </Svg>
    </View>
  );
}

 function SvgComponent(props) {
  return (
    <Svg height="50%" width="50%" viewBox="0 0 100 100" {...props}>
      <Polygon points="50,15 90,50 10,50" fill="black" />
      <Rect x="25" y="50" width="50" height="35" fill="#ffc107" stroke="#333" strokeWidth="2" />
      <Rect x="45" y="65" width="10" height="20" fill="red" />
      <Line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="2" />
    </Svg>
  );
}


function SvgComponent2(props) {
  return (
    <Svg height="50px" width="50px" viewBox="0 0 100 100" {...props}>
      <Path
        d="M10 50 L50 15 L90 50 V85 H65 V65 H35 V85 H10 Z"
        fill="black"
        stroke="#333"
        strokeWidth="2"
      />
    </Svg>
  );
}





const ShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, products: contextProducts } = useAppContext(), [filteredProducts, setFilteredProducts] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false), [searchQuery, setSearchQuery] = useState(''), [showFilters, setShowFilters] = useState(false), [sortBy, setSortBy] = useState('name'), [priceRange, setPriceRange] = useState({ min: 0, max: 2000 }), [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'All'), [page, setPage] = useState(1), [pageSize] = useState(10), [hasMore, setHasMore] = useState(true), categories = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Lighting'], sortOptions = [ { key: 'name', label: 'Name' }, { key: 'price_low', label: 'Price: Low to High' }, { key: 'price_high', label: 'Price: High to Low' }, { key: 'newest', label: 'Newest' }];
  useEffect(() => { filterAndSortProducts();}, [contextProducts, searchQuery, sortBy, priceRange, selectedCategory, page]);
  const filterAndSortProducts = () => {
    let filtered = [...contextProducts];
    if (searchQuery) filtered = filtered.filter( p =>  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.des.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== 'All') filtered = filtered.filter(p => p.des.toLowerCase().includes(selectedCategory.toLowerCase()));
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    switch (sortBy) {
      case 'price_low': filtered.sort((a, b) => a.price - b.price);break;
      case 'price_high': filtered.sort((a, b) => b.price - a.price);break;
      case 'newest': filtered.sort((a, b) => b.id - a.id);break;
    }

    const end = page * pageSize;
    setFilteredProducts(filtered.slice(0, end));
    setHasMore(end < filtered.length);
    setLoading(false);
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setRefreshing(false);
  };
  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  };
  const renderProduct = ({ item }) => (
    <View style={tw`w-1/2 px-1`}>
      <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { product: item })}/>
    </View>
  );
  const renderFilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
      <View style={tw`flex-1 justify-end`}>
        <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: theme.white, maxHeight: '80%' }]}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={[tw`text-xl font-bold`, { color: theme.black, fontFamily: 'Poppins-Bold' }]}>Filters & Sorting</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={theme.black} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[tw`text-lg font-semibold mb-3`, { color: theme.black, fontFamily: 'Poppins-SemiBold' }]}>Categories</Text>
            <View style={tw`flex-row flex-wrap mb-6`}>
              {categories.map(category => (
                <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)} style={[tw`px-4 py-2 rounded-full mr-2 mb-2`, { backgroundColor: selectedCategory === category ? theme.primary : theme.lightGray }]}>
                  <Text style={[tw`font-medium`, { color: selectedCategory === category ? theme.white : theme.black, fontFamily: 'Poppins-Medium' }]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[tw`text-lg font-semibold mb-3`, { color: theme.black, fontFamily: 'Poppins-SemiBold' }]}>Sort By</Text>
            {sortOptions.map(option => (
              <TouchableOpacity key={option.key} onPress={() => setSortBy(option.key)} style={tw`flex-row items-center py-3`} >
                <Icon name={sortBy === option.key ? "radio-button-checked" : "radio-button-unchecked"} size={20} color={theme.primary} />
                <Text style={[tw`ml-3 text-base`, { color: theme.black, fontFamily: 'Poppins-Regular' }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[tw`text-lg font-semibold mb-3 mt-6`, { color: theme.black, fontFamily: 'Poppins-SemiBold' }]}>Price Range: ${priceRange.min} - ${priceRange.max}</Text>
            <View style={tw`flex-row items-center mb-4`}>
              <TextInput style={[tw`flex-1 border rounded-lg px-3 py-2 mr-2`, { borderColor: theme.lightGray, color: theme.black }]} placeholder="Min" value={priceRange.min.toString()} onChangeText={text => setPriceRange(prev => ({ ...prev, min: parseInt(text) || 0 }))} keyboardType="numeric"/>
              <TextInput style={[tw`flex-1 border rounded-lg px-3 py-2`, { borderColor: theme.lightGray, color: theme.black }]} placeholder="Max" value={priceRange.max.toString()} onChangeText={text => setPriceRange(prev => ({ ...prev, max: parseInt(text) || 2000 }))} keyboardType="numeric"/>
            </View>
          </ScrollView>
          <TouchableOpacity onPress={() => setShowFilters(false)} style={[tw`py-4 rounded-lg mt-4`, { backgroundColor: theme.primary }]}>
            <Text style={[tw`text-center text-lg font-semibold`, { color: theme.white, fontFamily: 'Poppins-SemiBold' }]}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
   function SvgComponent3(props) {
  return (
    <Svg style={tw`p-5 m-2`} width={24} height={24} viewBox="0 0 24 24" {...props}>
      <Path
        fill={theme.primary}
        d="m11.05 17l4.15-2.65q.45-.3.45-.85t-.45-.85L11.05 10q-.5-.325-1.025-.05t-.525.875v5.35q0 .6.525.875T11.05 17M4 21q-.825 0-1.412-.587T2 19V7q0-.425.288-.712T3 6h5V4q0-.825.588-1.412T10 2h4q.825 0 1.413.588T16 4v2h5q.425 0 .713.288T22 7v12q0 .825-.587 1.413T20 21zm6-15h4V4h-4z"
      />
    </Svg>
  );
}
  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="Shop" showBack={false} />
      {/* <AnimatedLoader/> */}
      {/* <SvgComponent/> */}
      <SvgComponent3/>
      {/* <SvgComponent2/> */}
      <View style={tw`px-4 py-3`}>
        <View style={[tw`flex-row items-center border rounded-lg px-4 py-3`, { borderColor: theme.lightGray, backgroundColor: theme.semiWhite }]}>
          <Icon name="search" size={20} color={theme.darkGray} />
          <TextInput style={[tw`flex-1 ml-3 text-base`, { color: theme.black, fontFamily: 'Poppins-Regular' }]} placeholder="Search products..." placeholderTextColor={theme.darkGray} value={searchQuery} onChangeText={setSearchQuery}/>
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Icon name="tune" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={tw`px-4 pb-2`}>
        <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: 'Poppins-Regular' }]}>
          {filteredProducts.length} products{selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </Text>
      </View>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={[tw`text-base`, { color: theme.darkGray, fontFamily: 'Poppins-Regular' }]}>Loading...</Text>
        </View>
      ) : (
        <FlatList data={filteredProducts} renderItem={renderProduct} keyExtractor={item => item.id.toString()} numColumns={2} contentContainerStyle={tw`px-3 pb-6`} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} onEndReached={loadMore} onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={tw`py-4`}>
                <ActivityIndicator color={theme.primary} size="large" style={tw`flex-1 justify-center items-center mt-10`} />
              </View>
            ) : null
          }
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

export default ShopScreen;
