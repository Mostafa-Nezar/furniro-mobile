import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const SpecificationRow = ({ label, value, theme }) => (
  <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
    <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>
      {label}
    </Text>
    <Text style={[tw`text-sm font-medium`, { color: theme.black, fontFamily: "Poppins-Medium" }]}>
      {value}
    </Text>
  </View>
);

const ProductDetailScreen = () => {
  const { user, theme, addToCart, toggleFavorite, favorites,getImageUrl } = useAppContext();
  const { product } = useRoute().params;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);

  const isFavorite = favorites.includes(product.id);
  const hasDiscount = product.oldprice && product.oldprice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100)
    : 0;

  const productImages = [product.image, product.image1, product.image2, product.image3, product.image4].filter(Boolean);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    Alert.alert("Added", `${quantity} of ${product.name} added to cart.`);
  };

  const handleRatingSubmit = async (selectedRate) => {
    if (!user?.id) return Alert.alert("Error", "You must be logged in to rate.");

    try {
      const userId = user.id;
      const rateId = `${userId}-${product.id}`;

      await fetch("http://localhost:3001/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId, productid: product.id, rateid: rateId, rate: selectedRate }),
      });

      const res = await fetch("http://localhost:3001/api/ratings");
      const allRatings = await res.json();

      const productRatings = allRatings.filter(r => r.productid === product.id);
      const avg = productRatings.reduce((acc, cur) => acc + cur.rate, 0) / productRatings.length;

      await fetch(`http://localhost:3001/api/products/db/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ averagerate: +avg.toFixed(1), ratecount: productRatings.length }),
      });

      Alert.alert("Thanks!", `You rated this product ${selectedRate} stars.`);
      setRating(selectedRate);
      product.averagerate = +avg.toFixed(1);
      product.ratecount = productRatings.length;
    } catch {
      Alert.alert("Error", "Failed to submit rating.");
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Alert.alert(isFavorite ? "Removed" : "Added", isFavorite ? "Removed from favorites." : "Added to favorites.");
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title={product.name} showBack showSearch={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`relative`}>
          <Image source={{ uri: getImageUrl(selectedImage) }} style={[tw`w-full`, { height: width * 0.6 }]} resizeMode="contain" />

          <View style={tw`absolute top-4 right-4 flex-row`}>
            {hasDiscount && (
              <View style={[tw`px-3 py-1 rounded-full mr-2`, { backgroundColor: theme.red }]}>
                <Text style={[tw`text-sm font-bold`, { color: theme.white }]}>-{discountPercentage}%</Text>
              </View>
            )}
            {product.new && (
              <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: theme.green }]}>
                <Text style={[tw`text-sm font-bold`, { color: theme.white }]}>New</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handleToggleFavorite} style={[tw`absolute bottom-4 right-4 p-3 rounded-full`, { backgroundColor: theme.white }]}>
            <Icon name={isFavorite ? "favorite" : "favorite-border"} size={24} color={isFavorite ? theme.red : theme.darkGray} />
          </TouchableOpacity>
        </View>

        {productImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-4 py-4`}>
            {productImages.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedImage(img)}
                style={[tw`w-16 h-16 rounded-lg mr-2 border-2`, { borderColor: selectedImage === img ? theme.primary : theme.lightGray }]}
              >
                <Image source={{ uri: getImageUrl(img) }} style={tw`w-full h-full rounded-lg`} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={tw`px-4 py-4`}>
          <Text style={[tw`text-2xl font-bold mb-2`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>{product.name}</Text>
          <Text style={[tw`text-base mb-4`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{product.des}</Text>

          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[tw`text-2xl font-bold`, { color: theme.primary, fontFamily: "Poppins-Bold" }]}>${product.price}</Text>
            {hasDiscount && <Text style={[tw`text-lg ml-3 line-through`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{`$${product.oldprice}`}</Text>}
          </View>

          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[tw`text-base font-semibold mr-4`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Quantity:</Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.lightGray }]}>
                <Icon name="remove" size={20} color={theme.black} />
              </TouchableOpacity>
              <Text style={[tw`mx-4 text-lg font-semibold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.primary }]}>
                <Icon name="add" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating */}
          <View style={tw`mb-6`}>
            <View style={tw`flex-row`}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => handleRatingSubmit(star)}>
                  <Icon name="star" size={28} color={star <= (rating || product.averagerate) ? "#FFD700" : "#CCC"} style={tw`mx-1`} />
                </TouchableOpacity>
              ))}
              <Text style={[tw`mt-2 text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>
                {product.ratecount || 0} ratings, Average: {product.averagerate || 0}/5
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleAddToCart} style={[tw`py-4 rounded-lg mb-6`, { backgroundColor: theme.primary }]}>
            <Text style={[tw`text-center text-lg font-semibold`, { color: theme.white, fontFamily: "Poppins-SemiBold" }]}>
              Add to cart - ${(product.price * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>

          {/* Specs Sections */}
          {[ 
            { title: "General Info", data: product.general },
            { title: "Product Details", data: product.myproduct },
            { title: "Dimensions", data: product.dimensions },
            { title: "Warranty", data: product.warranty },
          ].map(({ title, data }, idx) => 
            data ? (
              <View key={idx} style={[tw`p-4 rounded-lg mb-4`, { backgroundColor: theme.semiWhite }]}>
                <Text style={[tw`text-lg font-bold mb-4`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>{title}</Text>
                {Object.entries(data).map(([key, val]) => (
                  <SpecificationRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={val} theme={theme} />
                ))}
              </View>
            ) : null
          )}

        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;
