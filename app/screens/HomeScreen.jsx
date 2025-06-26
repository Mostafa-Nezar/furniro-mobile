import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext.jsx';
import { DataService } from '../services/DataService.jsx';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme, setProducts, products, isOffline } = useAppContext();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await DataService.getProducts();
      setProducts(productsData);
      // Get first 6 products as featured
      setFeaturedProducts(productsData.slice(0, 8));
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

  const renderFeaturedProduct = ({ item }) => (
    <View style={tw`w-64 mr-4`}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  const categories = [
    { id: 1, name: 'غرف المعيشة', icon: 'chair', image: 'Image-living room.png' },
    { id: 2, name: 'غرف النوم', icon: 'bed', image: 'bedroom.png' },
    { id: 3, name: 'المطبخ', icon: 'kitchen', image: 'kit.png' },
    { id: 4, name: 'الإضاءة', icon: 'lightbulb', image: 'lamp.png' },
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Shop', { category: item.name })}
      style={[
        tw`m-2 rounded-lg overflow-hidden shadow-lg`,
        { backgroundColor: theme.white, width: (width - 60) / 2, elevation: 3 }
      ]}
    >
      <Image
        source={{ uri: `file:///home/ubuntu/FurniroMobile/assets/images/${item.image}` }}
        style={tw`w-full h-32`}
        resizeMode="cover"
      />
      <View style={tw`p-3 items-center`}>
        <Text style={[
          tw`text-base font-semibold text-center`,
          { color: theme.black, fontFamily: 'Poppins-SemiBold' }
        ]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={tw`relative`}>
          <Image
            source={{ uri: '../../../assets/images/background.png' }}
            style={tw`w-full h-64`}
            resizeMode="cover"
          />
          <View style={[
            tw`absolute inset-0 justify-center items-center`,
            { backgroundColor: 'rgba(0,0,0,0.4)' }
          ]}>
            <View style={[
              tw`p-6 rounded-lg mx-4`,
              { backgroundColor: theme.lightBeige }
            ]}>
              <Text style={[
                tw`text-2xl font-bold text-center mb-2`,
                { color: theme.primary, fontFamily: 'Poppins-Bold' }
              ]}>
                أثاث عصري وأنيق
              </Text>
              <Text style={[
                tw`text-base text-center mb-4`,
                { color: theme.black, fontFamily: 'Poppins-Regular' }
              ]}>
                اكتشف مجموعتنا الجديدة من الأثاث المنزلي
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Shop')}
                style={[
                  tw`py-3 px-6 rounded-lg`,
                  { backgroundColor: theme.primary }
                ]}
              >
                <Text style={[
                  tw`text-center font-semibold`,
                  { color: theme.white, fontFamily: 'Poppins-SemiBold' }
                ]}>
                  تسوق الآن
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Offline Indicator */}
        {isOffline && (
          <View style={[
            tw`mx-4 mt-4 p-3 rounded-lg flex-row items-center`,
            { backgroundColor: theme.red }
          ]}>
            <Icon name="wifi-off" size={20} color={theme.white} />
            <Text style={[
              tw`ml-2 font-medium`,
              { color: theme.white, fontFamily: 'Poppins-Medium' }
            ]}>
              أنت تتصفح في وضع عدم الاتصال
            </Text>
          </View>
        )}

        {/* Categories Section */}
        <View style={tw`mt-6`}>
          <Text style={[
            tw`text-xl font-bold mx-4 mb-4`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            تسوق حسب الفئة
          </Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={tw`px-2`}
            scrollEnabled={false}
          />
        </View>

        {/* Featured Products Section */}
        <View style={tw`mt-6`}>
          <View style={tw`flex-row justify-between items-center mx-4 mb-4`}>
            <Text style={[
              tw`text-xl font-bold`,
              { color: theme.black, fontFamily: 'Poppins-Bold' }
            ]}>
              المنتجات المميزة
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={[
                tw`text-base font-medium`,
                { color: theme.primary, fontFamily: 'Poppins-Medium' }
              ]}>
                عرض الكل
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={tw`flex-1 justify-center items-center py-8`}>
              <Text style={[
                tw`text-base`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                جاري التحميل...
              </Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-4`}
            />
          )}
        </View>

        {/* Features Section */}
        <View style={[
          tw`mt-8 mx-4 p-4 rounded-lg`,
          { backgroundColor: theme.lightBeige }
        ]}>
          <Text style={[
            tw`text-lg font-bold text-center mb-4`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            لماذا تختار Furniro؟
          </Text>
          
          <View style={tw`flex-row flex-wrap justify-between`}>
            {[
              { icon: 'local-shipping', title: 'شحن مجاني', desc: 'للطلبات أكثر من $100' },
              { icon: 'support-agent', title: 'دعم 24/7', desc: 'خدمة عملاء متميزة' },
              { icon: 'verified', title: 'ضمان الجودة', desc: 'منتجات عالية الجودة' },
              { icon: 'payment', title: 'دفع آمن', desc: 'طرق دفع متعددة' },
            ].map((feature, index) => (
              <View key={index} style={tw`w-1/2 items-center mb-4`}>
                <Icon name={feature.icon} size={32} color={theme.primary} />
                <Text style={[
                  tw`text-sm font-semibold mt-2 text-center`,
                  { color: theme.black, fontFamily: 'Poppins-SemiBold' }
                ]}>
                  {feature.title}
                </Text>
                <Text style={[
                  tw`text-xs text-center`,
                  { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
                ]}>
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={tw`h-6`} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

