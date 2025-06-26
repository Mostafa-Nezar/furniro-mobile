import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext.jsx';
import Header from '../components/Header.jsx';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CartScreen = () => {
  const navigation = useNavigation();
  const { theme, cart, removeFromCart, updateCartQuantity } = useAppContext();

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'حذف المنتج',
      'هل أنت متأكد من حذف هذا المنتج من السلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => removeFromCart(productId) }
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('السلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً');
      return;
    }
    
    Alert.alert(
      'إتمام الطلب',
      `إجمالي الطلب: $${totalPrice.toFixed(2)}\nعدد المنتجات: ${totalItems}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد الطلب', onPress: () => {
          // Here you would typically navigate to a checkout screen
          Alert.alert('تم الطلب', 'تم إرسال طلبك بنجاح!');
        }}
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={[
      tw`flex-row p-4 mb-3 rounded-lg`,
      { backgroundColor: theme.semiWhite }
    ]}>
      <Image
        source={{ uri: `file:///home/ubuntu/FurniroMobile/assets/images/${item.image}` }}
        style={tw`w-20 h-20 rounded-lg`}
        resizeMode="cover"
      />
      
      <View style={tw`flex-1 ml-4`}>
        <Text style={[
          tw`text-lg font-semibold mb-1`,
          { color: theme.black, fontFamily: 'Poppins-SemiBold' }
        ]}>
          {item.name}
        </Text>
        
        <Text style={[
          tw`text-sm mb-2`,
          { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
        ]}>
          {item.des}
        </Text>
        
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={[
            tw`text-lg font-bold`,
            { color: theme.primary, fontFamily: 'Poppins-Bold' }
          ]}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
          
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              style={[
                tw`w-8 h-8 rounded-full items-center justify-center`,
                { backgroundColor: theme.lightGray }
              ]}
            >
              <Icon name="remove" size={16} color={theme.black} />
            </TouchableOpacity>
            
            <Text style={[
              tw`mx-3 text-base font-semibold`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              {item.quantity}
            </Text>
            
            <TouchableOpacity
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              style={[
                tw`w-8 h-8 rounded-full items-center justify-center`,
                { backgroundColor: theme.primary }
              ]}
            >
              <Icon name="add" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={() => handleRemoveItem(item.id)}
        style={tw`ml-2 p-2`}
      >
        <Icon name="delete" size={20} color={theme.red} />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
        <Header title="السلة" showBack={false} showCart={false} />
        
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <Icon name="shopping-cart" size={80} color={theme.darkGray} />
          <Text style={[
            tw`text-xl font-bold mt-4 text-center`,
            { color: theme.black, fontFamily: 'Poppins-Bold' }
          ]}>
            السلة فارغة
          </Text>
          <Text style={[
            tw`text-base mt-2 text-center`,
            { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
          ]}>
            ابدأ بإضافة منتجات إلى سلة التسوق
          </Text>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Shop')}
            style={[
              tw`py-4 px-8 rounded-lg mt-6`,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-lg font-semibold`,
              { color: theme.white, fontFamily: 'Poppins-SemiBold' }
            ]}>
              تسوق الآن
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title="السلة" showBack={false} showCart={false} />
      
      <View style={tw`flex-1`}>
        {/* Cart Items */}
        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={tw`px-4 py-4`}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Cart Summary */}
        <View style={[
          tw`p-4 border-t`,
          { backgroundColor: theme.white, borderTopColor: theme.lightGray }
        ]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[
              tw`text-base`,
              { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
            ]}>
              عدد المنتجات:
            </Text>
            <Text style={[
              tw`text-base font-semibold`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              {totalItems}
            </Text>
          </View>
          
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[
              tw`text-base`,
              { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
            ]}>
              المجموع الفرعي:
            </Text>
            <Text style={[
              tw`text-base font-semibold`,
              { color: theme.black, fontFamily: 'Poppins-SemiBold' }
            ]}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
          
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[
              tw`text-base`,
              { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
            ]}>
              الشحن:
            </Text>
            <Text style={[
              tw`text-base font-semibold`,
              { color: theme.green, fontFamily: 'Poppins-SemiBold' }
            ]}>
              {totalPrice >= 100 ? 'مجاني' : '$10.00'}
            </Text>
          </View>
          
          <View style={[
            tw`flex-row justify-between items-center py-3 border-t`,
            { borderTopColor: theme.lightGray }
          ]}>
            <Text style={[
              tw`text-lg font-bold`,
              { color: theme.black, fontFamily: 'Poppins-Bold' }
            ]}>
              الإجمالي:
            </Text>
            <Text style={[
              tw`text-lg font-bold`,
              { color: theme.primary, fontFamily: 'Poppins-Bold' }
            ]}>
              ${(totalPrice + (totalPrice >= 100 ? 0 : 10)).toFixed(2)}
            </Text>
          </View>
          
          {totalPrice < 100 && (
            <Text style={[
              tw`text-sm text-center mb-4`,
              { color: theme.darkGray, fontFamily: 'Poppins-Regular' }
            ]}>
              أضف ${(100 - totalPrice).toFixed(2)} للحصول على شحن مجاني
            </Text>
          )}
          
          <TouchableOpacity
            onPress={handleCheckout}
            style={[
              tw`py-4 rounded-lg`,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-center text-lg font-semibold`,
              { color: theme.white, fontFamily: 'Poppins-SemiBold' }
            ]}>
              إتمام الطلب
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Shop')}
            style={[
              tw`py-3 mt-3 border rounded-lg`,
              { borderColor: theme.primary }
            ]}
          >
            <Text style={[
              tw`text-center text-base font-semibold`,
              { color: theme.primary, fontFamily: 'Poppins-SemiBold' }
            ]}>
              متابعة التسوق
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CartScreen;

