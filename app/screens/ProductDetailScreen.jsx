import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const { theme, addToCart, toggleFavorite, favorites } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);

  const isFavorite = favorites.includes(product.id);
  const hasDiscount = product.oldprice && product.oldprice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100)
    : 0;

  const productImages = [
    product.image,
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    Alert.alert('تم الإضافة', `تم إضافة ${quantity} من ${product.name} إلى السلة`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Alert.alert(
      isFavorite ? 'تم الحذف' : 'تم الإضافة',
      isFavorite 
        ? 'تم حذف المنتج من المفضلة'
        : 'تم إضافة المنتج إلى المفضلة'
    );
  };

  const renderImageThumbnail = (imageUri, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => setSelectedImage(imageUri)}
      style={[
        tw`w-16 h-16 rounded-lg mr-2 border-2`,
        {
          borderColor: selectedImage === imageUri ? theme.primary : theme.lightGray
        }
      ]}
    >
      <Image
        source={{ uri: `file:///home/ubuntu/FurniroMobile/assets/images/${imageUri}` }}
        style={tw`w-full h-full rounded-lg`}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderSpecificationRow = (label, value) => (
    <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
      <Text style={[
        tw`text-sm`,
        { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
      ]}>
        {label}
      </Text>
      <Text style={[
        tw`text-sm font-medium`,
        { color: theme.black, fontFamily: 'Poppins-Medium' }
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title={product.name} showBack={true} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={tw`relative`}>
          <Image
            source={{ uri: `file:///home/ubuntu/FurniroMobile/assets/images/${selectedImage}` }}
            style={[tw`w-full`, { height: width }]}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={tw`absolute top-4 right-4 flex-row`}>
            {hasDiscount && (
              <View style={[
                tw`px-3 py-1 rounded-full mr-2`,
                { backgroundColor: theme.red }
              ]}>
                <Text style={[
                  tw`text-sm font-bold`,
                  { color: theme.white }
                ]}>
                  -{discountPercentage}%
                </Text>
              </View>
            )}
            
            {product.new && (
              <View style={[
                tw`px-3 py-1 rounded-full`,
                { backgroundColor: theme.green }
              ]}>
                <Text style={[
                  tw`text-sm font-bold`,
                  { color: theme.white }
                ]}>
                  جديد
                </Text>
              </View>
            )}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              tw`absolute bottom-4 right-4 p-3 rounded-full`,
              { backgroundColor: theme.white }
            ]}
          >
            <Icon
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24}
              color={isFavorite ? theme.red : theme.darkGray}
            />
          </TouchableOpacity>
        </View>

        {/* Image Thumbnails */}
        {productImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4 py-4`}
          >
            {productImages.map((image, index) => renderImageThumbnail(image, index))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={tw`px-4 py-4`}>
          <Text style={[
            tw`text-2xl font-bold mb-2`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            {product.name}
          </Text>
          
          <Text style={[
            tw`text-base mb-4`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            {product.des}
          </Text>

          {/* Price */}
          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[
              tw`text-2xl font-bold`,
              { color: theme.primary, fontFamily: 'Poppins-Bold' }
            ]}>
              ${product.price}
            </Text>
            {hasDiscount && (
              <Text style={[
                tw`text-lg ml-3 line-through`,
                { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
              ]}>
                ${product.oldprice}
              </Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={tw`flex-row items-center mb-6`}>
            <Text style={[
              tw`text-base font-semibold mr-4`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              الكمية:
            </Text>
            
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: theme.lightGray }
                ]}
              >
                <Icon name="remove" size={20} color={theme.black} />
              </TouchableOpacity>
              
              <Text style={[
                tw`mx-4 text-lg font-semibold`,
                { color: theme.black, fontFamily: 'Poppins-SemiBold' }
              ]}>
                {quantity}
              </Text>
              
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: theme.primary }
                ]}
              >
                <Icon name="add" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            style={[
              tw`py-4 rounded-lg mb-6`,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-center text-lg font-semibold`,
              { color: theme.white, fontFamily: 'Poppins-SemiBold' }
            ]}>
              إضافة إلى السلة - ${(product.price * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>

          {/* Product Specifications */}
          {product.general && (
            <View style={[
              tw`p-4 rounded-lg mb-4`,
              { backgroundColor: theme.semiWhite }
            ]}>
              <Text style={[
                tw`text-lg font-bold mb-4`,
                { color: theme.black, fontFamily: 'Poppins-Bold' }
              ]}>
                المواصفات العامة
              </Text>
              
              {renderSpecificationRow('حزمة المبيعات', product.general.salespackage)}
              {renderSpecificationRow('الموديل', product.general.model)}
              {renderSpecificationRow('المادة الثانوية', product.general.secoundary)}
              {renderSpecificationRow('التكوين', product.general.configuration)}
              {renderSpecificationRow('مادة التنجيد', product.general.upholsterymaterial)}
              {renderSpecificationRow('لون التنجيد', product.general.upholsterycolor)}
            </View>
          )}

          {/* Dimensions */}
          {product.dimensions && (
            <View style={[
              tw`p-4 rounded-lg mb-4`,
              { backgroundColor: theme.semiWhite }
            ]}>
              <Text style={[
                tw`text-lg font-bold mb-4`,
                { color: theme.black, fontFamily: 'Poppins-Bold' }
              ]}>
                الأبعاد
              </Text>
              
              {renderSpecificationRow('العرض', product.dimensions.width)}
              {renderSpecificationRow('الارتفاع', product.dimensions.height)}
              {renderSpecificationRow('العمق', product.dimensions.depth)}
              {renderSpecificationRow('الوزن', product.dimensions.weight)}
              {renderSpecificationRow('ارتفاع المقعد', product.dimensions.seatheight)}
              {renderSpecificationRow('ارتفاع الساق', product.dimensions.legheight)}
            </View>
          )}

          {/* Warranty */}
          {product.warranty && (
            <View style={[
              tw`p-4 rounded-lg mb-6`,
              { backgroundColor: theme.semiWhite }
            ]}>
              <Text style={[
                tw`text-lg font-bold mb-4`,
                { color: theme.black, fontFamily: 'Poppins-Bold' }
              ]}>
                الضمان
              </Text>
              
              {renderSpecificationRow('ملخص الضمان', product.warranty.summry)}
              {renderSpecificationRow('نوع الخدمة', product.warranty.servicetype)}
              {renderSpecificationRow('الضمان المحلي', product.warranty.dominstic)}
              {renderSpecificationRow('مشمول بالضمان', product.warranty.covered)}
              {renderSpecificationRow('غير مشمول بالضمان', product.warranty.notcovered)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;

