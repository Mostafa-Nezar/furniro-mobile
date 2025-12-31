import { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext.jsx";
import Header from "../../components/Header.jsx";
import ProductCard from "../../components/ProductCard.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import NetInfo from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");
const categories = [{ id: 1, name: "Living Room", icon: "chair", image: "Image-living room.png" }, { id: 2, name: "Bedroom", icon: "bed", image: "bedroom.png" }, { id: 3, name: "Kitchen", icon: "kitchen", image: "kit.png" }, { id: 4, name: "Lighting", icon: "lightbulb", image: "lamp.png" }, ];
const getImage = (name) =>({"Image-living room.png": require("../../../assets/images/Image-living room.png"), "kit.png": require("../../../assets/images/kit.png"), "lamp.png": require("../../../assets/images/lamp.png"), "bedroom.png": require("../../../assets/images/bedroom.png"), }[name] || require("../../../assets/images/bedroom.png"));
const features = [{ icon: "local-shipping", title: "Free Shipping", desc: "For orders over $100" }, { icon: "support-agent", title: "24/7 Support", desc: "Excellent customer service" }, { icon: "verified", title: "Quality Guarantee", desc: "High quality products" }, { icon: "payment", title: "Secure Payment", desc: "Multiple payment methods" }, ];
const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme,products: contextProducts, getProducts } = useAppContext();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isoffline, setisoffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(); 
      setFeaturedProducts(data.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  setFeaturedProducts(contextProducts.slice(0, 8));
}, [contextProducts]);
  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (!state.isConnected) {
      setisoffline(true);
    } else {
      if (isoffline) { 
        setShowBackOnline(true);
        setTimeout(() => setShowBackOnline(false), 500);
      }
      setisoffline(false);
    }
  });

  return () => unsubscribe();
}, [isoffline]);

  const onRefresh = async () => { setRefreshing(true); await loadProducts(); setRefreshing(false); };
  const renderProduct = ({ item }) => (
    <View style={tw`w-64 mr-4`}>
      <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { product: item })} />
    </View>
  );
  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={[tw`m-2 rounded-lg overflow-hidden shadow-lg`, { backgroundColor: theme.white, width: (width - 60) / 2, elevation: 3 }]}>
      <Image source={getImage(item.image)} style={tw`w-full h-32`} resizeMode="cover" />
      <View style={tw`p-3 items-center`}>
        <Text style={[tw`text-base font-semibold text-center`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={tw`relative`}>
          <Image source={require("../../../assets/images/hero.png")} style={tw`w-full h-64`} resizeMode="cover" />
          <View style={[tw`absolute inset-0 justify-center items-center`, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
            <View style={[tw`p-6 rounded-lg mx-4`, { backgroundColor: theme.lightBeige }]}>
              <Text style={[tw`text-2xl font-bold text-center mb-2`, { color: theme.primary, fontFamily: "Poppins-Bold" }]}>
                Modern & Elegant Furniture
              </Text>
              <Text style={[tw`text-base text-center mb-4`, { color: theme.black, fontFamily: "Poppins-Regular" }]}>
                Discover our new collection of home furniture
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={[tw`py-3 px-6 rounded-lg`, { backgroundColor: theme.primary }]}>
                <Text style={[tw`text-center font-semibold`, { color: theme.white, fontFamily: "Poppins-SemiBold" }]}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {isoffline && (
          <View style={[tw`mx-4 mt-4 p-3 rounded-lg flex-row items-center`, { backgroundColor: theme.red }]}>
            <Icon name="wifi-off" size={20} color={theme.white} />
            <Text style={[tw`ml-2 font-medium`, { color: theme.white, fontFamily: "Poppins-Medium" }]}>You are browsing offline</Text>
          </View>
        )}
        {showBackOnline && (
          <View style={[tw`mx-4 mt-4 p-3 rounded-lg flex-row items-center`, { backgroundColor: theme.green }]}>
            <Icon name="wifi" size={20} color={theme.white} />
            <Text style={[tw`ml-2 font-medium`, { color: theme.white, fontFamily: "Poppins-Medium" }]}>
              Back online
            </Text>
          </View>
        )}
        <View style={tw`mt-6 mx-auto`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>Shop by Category</Text>
          <FlatList data={categories} renderItem={renderCategory} keyExtractor={(item) => item.id.toString()} numColumns={2} contentContainerStyle={tw`px-2`} scrollEnabled={false} />
        </View>
        <View style={tw`mt-6`}>
          <View style={tw`flex-row justify-between items-center mx-4 mb-4`}>
            <Text style={[tw`text-xl font-bold`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Shop")}>
              <Text style={[tw`text-base font-medium`, { color: theme.primary, fontFamily: "Poppins-Medium" }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={tw`flex-1 justify-center items-center py-8`}>
              <Text style={[tw`text-base`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>Loading...</Text>
            </View>
          ) : (
            <FlatList data={featuredProducts} renderItem={renderProduct} keyExtractor={(item) => item.id.toString()} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-4`}/>
          )}
        </View>
        <View style={[tw`mt-8 mx-4 p-4 rounded-lg`, { backgroundColor: theme.lightBeige }]}>
          <Text style={[tw`text-lg font-bold text-center mb-4`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>Why Choose Furniro?</Text>
          <View style={tw`flex-row flex-wrap justify-between`}>
            {features.map((f, i) => (
              <View key={i} style={tw`w-1/2 items-center mb-4`}>
                <Icon name={f.icon} size={32} color={theme.primary} />
                <Text style={[tw`text-sm font-semibold mt-2 text-center`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{f.title}</Text>
                <Text style={[tw`text-xs text-center`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{f.desc}</Text>
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
