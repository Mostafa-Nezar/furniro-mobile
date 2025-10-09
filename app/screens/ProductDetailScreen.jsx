import { useState,useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const SpecificationRow = ({ label, value, theme }) => (
  <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
    <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{label}</Text>
    <Text style={[tw`text-sm font-medium`, { color: theme.black, fontFamily: "Poppins-Medium" }]}>{value}</Text>
  </View>
);

const ProductDetailScreen = () => {
  const { theme, toggleFavorite, favorites, getImageUrl } = useAppContext(), {cart, addToCart, updateCartQuantity, removeFromCart, syncCart }=useCart(),{ user }=useAuth();
  const { product } = useRoute().params;
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [rating, setRating] = useState(0);
  const itemInCart = cart?.find((item) => item.id === product.id);
  const quantity = itemInCart?.quantity ?? 0;
  const isFavorite = favorites.includes(product.id);
  const hasDiscount = product.oldprice && product.oldprice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100) : 0;
  const productImages = [product.image, product.image1, product.image2, product.image3, product.image4].filter(Boolean);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

useEffect(() => {
  if (!product) return;
  setSelectedSize(cart.find((item) => item.id === product.id)?.size || "l");
  setSelectedColor(cart.find((item) => item.id === product.id)?.color || null);
}, [cart, product]);

function SelectOrColor(productId, key, value) {
  const existingItem = cart.find((item) => item.id === productId);
  if (!existingItem) { Toast.show({type: "error",text1: "Not In Cart" });
    return;
  }
  const updatedCart = cart.map((item) =>
    item.id === productId ? { ...item, [key]: value } : item
  );
  syncCart(updatedCart);
  Toast.show({ type: "success", text1: `Updated ${key}` });
}

  const handleRatingSubmit = async (selectedRate) => {
    if (!user?.id) return;
    try {
      const rateId = `${user.id}-${product.id}`;
      await fetch("https://furniro-back-production.up.railway.app/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user.id, productid: product.id, rateid: rateId, rate: selectedRate }),
      });
      const res = await fetch("https://furniro-back-production.up.railway.app/api/ratings");
      const allRatings = await res.json();
      const productRatings = allRatings.filter((r) => r.productid === product.id);
      const avg = productRatings.reduce((acc, cur) => acc + cur.rate, 0) / productRatings.length;
      await fetch(`https://furniro-back-production.up.railway.app/api/products/db/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ averagerate: +avg.toFixed(1), ratecount: productRatings.length }),
      });
      Toast.show({ type: "success", text1: "Thanks!", text2: `You rated this product ${selectedRate} stars.` });
      setRating(selectedRate);
      product.averagerate = +avg.toFixed(1);
      product.ratecount = productRatings.length;
    } catch {
      Toast.show({ type: "error", text1: "Fail to Rate" });
    }
  };
  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Toast.show({ type: isFavorite ? "error" : "success", text1: isFavorite ? "Removed from Favorites" : "Added to Favorites", text2: `${product.name}` });
  };
  const modifyCartQuantity = (type) => {
    if (!itemInCart) {
      if (type === "increase") {
        addToCart(product);
        Toast.show({ type: "success", text1: "Added to cart", text2: `${product.name} has been added.` });
      } else {
        Toast.show({ type: "info", text1: "Product not in cart", text2: "Please add the product first." });
      }
      return;
    }
    const newQuantity = type === "increase" ? itemInCart.quantity + 1 : itemInCart.quantity - 1;
    if (newQuantity < 1) {
      removeFromCart(product.id);
      Toast.show({ type: "info", text1: "Removed from cart", text2: `${product.name} has been removed.` });
      return;
    }
    updateCartQuantity(product.id, newQuantity);
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title={product.name} showBack showSearch={false} showNotification={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`relative`}>
          <Image source={{ uri: getImageUrl(selectedImage) }} style={[tw`w-full`, { height: width * 0.6 }]} resizeMode="contain" />
          <View style={tw`absolute top-4 right-4 flex-row`}>
            {hasDiscount && <View style={[tw`px-3 py-1 rounded-full mr-2`, { backgroundColor: theme.red }]}><Text style={[tw`text-sm font-bold`, { color: theme.white }]}>-{discountPercentage}%</Text></View>}
            {product.new && <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: theme.green }]}><Text style={[tw`text-sm font-bold`, { color: theme.white }]}>New</Text></View>}
          </View>
          <TouchableOpacity onPress={handleToggleFavorite} style={[tw`absolute bottom-4 right-4 p-3 rounded-full`, { backgroundColor: theme.white }]}>
            <Icon name={isFavorite ? "favorite" : "favorite-border"} size={24} color={isFavorite ? theme.red : theme.darkGray} />
          </TouchableOpacity>
        </View>

        {productImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-4 py-4`}>
            {productImages.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedImage(img)} style={[tw`w-16 h-16 rounded-lg mr-2 border-2`, { borderColor: selectedImage === img ? theme.primary : theme.lightGray }]}>
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
            {hasDiscount && <Text style={[tw`text-lg ml-3 line-through`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>${product.oldprice}</Text>}
          </View>

          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[tw`text-base font-semibold mr-4`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Quantity:</Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={() => modifyCartQuantity("decrease")} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.lightGray }]}>
                <Icon name="remove" size={20} color={theme.black} />
              </TouchableOpacity>
              <Text style={[tw`mx-4 text-lg font-semibold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => modifyCartQuantity("increase")} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.primary }]}>
                <Icon name="add" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`mb-6`}>
            <View style={tw`flex-row`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRatingSubmit(star)}>
                  <Icon name="star" size={28} color={star <= (rating || product.averagerate) ? "#FFD700" : "#CCC"} style={tw`mx-1`} />
                </TouchableOpacity>
              ))}
              <Text style={[tw`mt-2 text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>
                {product.ratecount || 0} ratings, Average: {product.averagerate || 0}/5
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => modifyCartQuantity("increase")} style={[tw`py-4 rounded-lg mb-6`, { backgroundColor: theme.primary }]}>
            <Text style={[tw`text-center text-lg font-semibold`, { color: theme.white }]}>
              Add to cart {(product.price * quantity).toFixed()} $
            </Text>
          </TouchableOpacity>
          <View style={tw`my-2`}>
            <Text style={tw`font-bold mb-1`}>Size</Text>
            <View style={tw`flex-row`}>
              {["l", "xl", "xs"].map((size) => {
                const bgColor = selectedSize === size ? "#B88E2F" : "#FDF5E6"; 
                const textColor = selectedSize === size ? "#fff" : "#000";
                return (
                  <TouchableOpacity key={size} onPress={() => { setSelectedSize(size); SelectOrColor(product.id, "size", size) }} style={tw.style(`px-3 py-2 mr-2 rounded`, { backgroundColor: bgColor })}>
                    <Text style={tw.style({ color: textColor })}> {size.toUpperCase()}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
          <View style={tw`my-2`}>
            <Text style={tw`font-bold mb-1`}>Color</Text>
            <View style={tw`flex-row`}>
              {["mediumslateblue", "black", "#B88E2F"].map((color) => (
                <TouchableOpacity key={color} onPress={() => { setSelectedColor(color); SelectOrColor(product.id, "color", color) }} style={tw.style(`w-8 h-8 mr-2 rounded-full`, { backgroundColor: color, borderWidth: selectedColor === color ? 2 : 0, borderColor: "#000" })}/>
              ))}
            </View>
          </View>
          {[{ title: "General Info", data: product.general }, { title: "Product Details", data: product.myproduct }, { title: "Dimensions", data: product.dimensions }, { title: "Warranty", data: product.warranty }]
            .map(({ title, data }, idx) =>
              data ? (
                <View key={idx} style={[tw`p-4 rounded-lg mb-4`, { backgroundColor: theme.semiWhite }]}>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>{title}</Text>
                  {Object.entries(data).map(([key, val]) => (
                    <SpecificationRow key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} value={val} theme={theme} />
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
