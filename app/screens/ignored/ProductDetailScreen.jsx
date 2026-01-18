import { useState,useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import Header from "../../components/Header";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");
const SpecificationRow = ({ label, value, theme }) => (
  <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
    <Text style={[tw`text-sm`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{label}</Text>
    <Text style={[tw`text-sm font-medium`, { color: theme.black, fontFamily: "Poppins-Medium" }]}>{value}</Text>
  </View>
);

const ProductDetailScreen = () => {
  const { theme, toggleFavorite, favorites, getImageUrl } = useAppContext(), {cart, addToCart, decreaseCartQuantity, syncCart }=useCart(),{ user }=useAuth();
  const { product } = useRoute().params;
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [rating, setRating] = useState(0);
  const [toprates, settoprates] = useState([]);
  const itemInCart = cart?.find((item) => item.id === product.id);
  const quantity = itemInCart?.quantity ?? 0;
  const isFavorite = favorites.includes(product.id);
  const productImages = [product.image, product.image1, product.image2, product.image3, product.image4].filter(Boolean);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
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
  };
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
  const gettop = async () => {
    settoprates(await (await fetch(`https://furniro-back-production.up.railway.app/api/ratings/top-ratings/${product.id}`)).json());
  };
  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Toast.show({ type: isFavorite ? "error" : "success", text1: isFavorite ? "Removed from Favorites" : "Added to Favorites", text2: `${product.name}` });
  };
  const sendcomment = async (e) => {
    e.preventDefault();
    if (!user?.id) return togglePopup("Please log in first", "error");
    if (!comment.trim()) return togglePopup("Comment cannot be empty", "error");

    setLoading(true);
    try {
      const rateId = `${user.id}-${product.id}`;
      const res = await fetch("https://furniro-back-production.up.railway.app/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user.id, productid: product.id, rateid: rateId, rate: 0, comment }),
      });
      const data = await res.json();
      togglePopup(data.msg || "Comment submitted successfully", "success");
      setComment("");
    } catch {
      togglePopup("Failed to submit comment", "error");
    } finally {
        gettop();
      setLoading(false);
      setComment("");
    }
  };
  useEffect(() => {
    if (!product) return;
    setSelectedSize(cart.find((item) => item.id === product.id)?.size || "l");
    setSelectedColor(cart.find((item) => item.id === product.id)?.color || null);
    gettop();
  }, [cart, product]);
  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title={product.name} showBack showSearch={false} showNotification={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`relative`}>
          <Image source={{ uri: getImageUrl(selectedImage) }} style={[tw`w-full`, { height: width * 0.6 }]} resizeMode="contain" />
            {(product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30)) || product.sale ? (
              <View style={[ tw`absolute top-2 left-2 px-2 py-1 rounded-full`, { backgroundColor: product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30) ? theme.green : theme.red }]}>
                <Text style={[tw`text-xs font-bold`, { color: theme.white }]}>
                  {product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30) ? "New" : `${product.sale}%`}
                </Text>
              </View>
            ) : null}
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
            {product.sale && <Text style={[tw`text-lg ml-3 line-through`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>${product?.oldprice}</Text>}
          </View>
          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[tw`text-base font-semibold mr-4`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>Quantity:</Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={() => decreaseCartQuantity(product)} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.lightGray }]}>
                <Icon name="remove" size={20} color={theme.black} />
              </TouchableOpacity>
              <Text style={[tw`mx-4 text-lg font-semibold`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => addToCart(product)} style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: theme.primary }]}>
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
          <TouchableOpacity onPress={() => addToCart(product)} style={[tw`py-4 rounded-lg mb-6`, { backgroundColor: theme.primary }]}>
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
            {["mediumslateblue", "black", "#B88E2F"].map((color) => ( <TouchableOpacity key={color} onPress={() => { setSelectedColor(color); SelectOrColor(product.id, "color", color) }} style={tw.style(`w-8 h-8 mr-2 rounded-full`, { backgroundColor: color, borderWidth: selectedColor === color ? 2 : 0, borderColor: "#000" })}/>))}
            </View>
          </View>
          {[{ title: "General Info", data: product.general }, { title: "Product Details", data: product.myproduct }, { title: "Dimensions", data: product.dimensions } ]
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
              <View style={tw`px-4 my-2`}>
              <Text style={[tw`text-center font-bold text-xl mb-5`, { color: theme.black }]}>Top Reviews</Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                {toprates.filter(r => r.user?.name && r.user?.image).map((r, i) => (
                  <View key={i} style={[tw`w-[48%] p-3 mb-4 rounded-2xl shadow`, { backgroundColor: theme.semiWhite, borderColor: theme.lightGray, borderWidth: 1 }]}>
                    <MaterialIcons name="auto-graph" size={16} color={theme.primary} style={tw`absolute top-2 right-2 opacity-60`} />
                    <View style={tw`items-center`}>
                      <Image source={{ uri: r.user.image }} style={[tw`rounded-full w-12 h-12 mb-2`, { borderWidth: 2, borderColor: theme.primary }]} />
                      <Text style={[tw`font-semibold text-sm`, { color: theme.black }]}>{r.user.name}</Text>
                      <View style={tw`flex-row mt-1`}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <FontAwesome key={s} name="star" size={14} color={s <= r.rate ? theme.yellow : theme.darkGray} />
                        ))}
                      </View>
                    </View>
                    <Text numberOfLines={3} style={[tw`italic mt-3 text-xs text-center`, { borderLeftWidth: 3, borderColor: theme.primary, paddingLeft: 6, color: theme.gray }]}>
                      “{r.comment || "No comment"}”
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {product.warranty && (
              <View style={[tw`p-4 rounded-xl mb-5`, { backgroundColor: theme.semiWhite }]}>
                <Text style={[tw`text-lg font-bold mb-3`, { color: theme.black, fontFamily: "Poppins-Bold" }]}>Warranty</Text>
                {Object.entries(product.warranty).map(([k, v]) => (
                  <View key={k} style={tw`mb-2`}>
                    <Text style={[tw`text-sm font-medium`, { color: theme.gray }]}>
                      {k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    </Text>
                    <Text style={[tw`text-sm leading-5`, { color: theme.black }]}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>
        <View style={tw`px-4 my-8`}>
          <View style={[ tw`p-5 rounded-3xl shadow-sm`, { backgroundColor: theme.white, borderColor: theme.lightGray, borderWidth: 1, borderTopLeftRadius: 0 } ]} >
            <Text
              style={[ tw`text-base font-semibold mb-3`, { color: theme.black, fontFamily: "Poppins-SemiBold" } ]}>
              Leave a Comment 💬
            </Text>
            <TextInput
              style={[ tw`p-3 rounded-xl border mb-4`,
                {
                  backgroundColor: theme.semiWhite,
                  borderColor: theme.lightGray,
                  color: theme.black,
                  textAlignVertical: "top",
                  minHeight: 90,
                },
              ]}
              placeholder="Share your thoughts..."
              placeholderTextColor={theme.gray}
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity
              onPress={sendcomment}
              disabled={loading}
              style={[
                tw`self-end rounded-full px-5 py-2`,
                {
                  backgroundColor: theme.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-semibold`,
                  { color: theme.white, fontFamily: "Poppins-SemiBold" },
                ]}
              >
                {loading ? "Sending..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;
