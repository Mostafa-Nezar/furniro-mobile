import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAppContext } from "../context/AppContext.jsx";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product, onPress }) => {
  const { theme, toggleFavorite, favorites, getImageUrl } = useAppContext(), { addToCart } = useCart();
  const isFavorite = favorites.includes(product.id);
  const imageUrl = getImageUrl(product.image);

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Toast.show({ type: "success", text1: isFavorite ? "Removed from Favorites" : "Added to Favorites", text2: product.name });
  };

  return (
    <TouchableOpacity onPress={onPress} style={[tw`m-2 rounded-lg overflow-hidden shadow-lg`, { backgroundColor: theme.semiWhite }]}>
      <View style={tw`relative`}>
        <Image source={{ uri: imageUrl }} style={tw`w-full h-48`} resizeMode="cover" />
          {(product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30)) || product.sale ? (
            <View style={[ tw`absolute top-2 left-2 px-2 py-1 rounded-full`, { backgroundColor: product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30) ? theme.green : theme.red }]}>
              <Text style={[tw`text-xs font-bold`, { color: theme.white }]}>
                {product.date && ((new Date() - new Date(product.date)) / (1000 * 60 * 60 * 24) < 30) ? "New" : `${product.sale}%`}
              </Text>
            </View>
          ) : null}
        <TouchableOpacity onPress={handleToggleFavorite} style={[tw`absolute bottom-2 right-2 p-2 rounded-full`, { backgroundColor: theme.white }]}>
          <Icon name={isFavorite ? "favorite" : "favorite-border"} size={20} color={isFavorite ? theme.red : theme.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={tw`p-4`}>
        <Text style={[tw`text-lg font-semibold mb-1`, { color: theme.black, fontFamily: "Poppins-SemiBold" }]}>{product.name}</Text>
        <Text style={[tw`text-sm mb-3`, { color: theme.darkGray, fontFamily: "Poppins-Regular" }]}>{product.des}</Text>
        <TouchableOpacity onPress={()=>addToCart(product)} style={[tw`py-3 px-4 rounded-lg flex-row items-center justify-center`, { backgroundColor: theme.primary }]}>
          <Icon name="add-shopping-cart" size={20} color={theme.white} />
          <Text style={[tw`ml-2 font-semibold`, { color: theme.white, fontFamily: "Poppins-SemiBold" }]}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
