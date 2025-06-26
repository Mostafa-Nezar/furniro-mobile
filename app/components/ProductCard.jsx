import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useAppContext } from '../context/AppContext.jsx';
import { DataService } from '../services/DataService.jsx';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProductCard = ({ product, onPress }) => {
  const { theme, addToCart, toggleFavorite, favorites } = useAppContext();
  
  const isFavorite = favorites.includes(product.id);
  const hasDiscount = product.oldprice && product.oldprice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('تم الإضافة', 'تم إضافة المنتج إلى السلة بنجاح');
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
  };

  // Get the correct image URL
  const imageUrl = DataService.getImageUrl(product.image) || `file:///home/ubuntu/FurniroMobile/assets/images/${product.image}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw`m-2 rounded-lg overflow-hidden shadow-lg`,
        { backgroundColor: theme.white, elevation: 5 }
      ]}
    >
      {/* Product Image */}
      <View style={tw`relative`}>
        <Image
          source={{ uri: imageUrl }}
          style={tw`w-full h-48`}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <View style={[
            tw`absolute top-2 right-2 px-2 py-1 rounded-full`,
            { backgroundColor: theme.red }
          ]}>
            <Text style={[
              tw`text-xs font-bold`,
              { color: theme.white }
            ]}>
              -{discountPercentage}%
            </Text>
          </View>
        )}

        {/* New Badge */}
        {product.new && (
          <View style={[
            tw`absolute top-2 left-2 px-2 py-1 rounded-full`,
            { backgroundColor: theme.green }
          ]}>
            <Text style={[
              tw`text-xs font-bold`,
              { color: theme.white }
            ]}>
              جديد
            </Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={[
            tw`absolute bottom-2 right-2 p-2 rounded-full`,
            { backgroundColor: theme.white }
          ]}
        >
          <Icon
            name={isFavorite ? "favorite" : "favorite-border"}
            size={20}
            color={isFavorite ? theme.red : theme.darkGray}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={tw`p-4`}>
        <Text style={[
          tw`text-lg font-semibold mb-1`,
          { color: theme.black, fontFamily: 'Poppins-SemiBold' }
        ]}>
          {product.name}
        </Text>
        
        <Text style={[
          tw`text-sm mb-3`,
          { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
        ]}>
          {product.des}
        </Text>

        {/* Price */}
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <View style={tw`flex-row items-center`}>
            <Text style={[
              tw`text-lg font-bold`,
              { color: theme.primary, fontFamily: 'Poppins-Bold' }
            ]}>
              ${product.price}
            </Text>
            {hasDiscount && (
              <Text style={[
                tw`text-sm ml-2 line-through`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                ${product.oldprice}
              </Text>
            )}
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          style={[
            tw`py-3 px-4 rounded-lg flex-row items-center justify-center`,
            { backgroundColor: theme.primary }
          ]}
        >
          <Icon name="add-shopping-cart" size={20} color={theme.white} />
          <Text style={[
            tw`ml-2 font-semibold`,
            { color: theme.white, fontFamily: 'Poppins-SemiBold' }
          ]}>
            إضافة للسلة
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

