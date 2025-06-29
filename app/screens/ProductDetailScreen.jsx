import React, { useState } from "react";
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

const ProductDetailScreen = () => {
const { user } = useAppContext();
  const route = useRoute();
  const { product } = route.params;
  const { theme, addToCart, toggleFavorite, favorites } = useAppContext();

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
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

  const getImageUri = (image) =>
    image?.startsWith("http")
      ? image
      : `http://localhost:3001/uploads/${image}`;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    Alert.alert("Added", `${quantity} of ${product.name} added to cart.`);
  };
const handleRatingSubmit = async (selectedRate) => {
  try {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to rate.");
      return;
    }

    const userId = user.id;
    const rateId = `${userId}-${product.id}`;

    // أرسل التقييم
    await fetch("http://localhost:3001/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userid: userId,
        productid: product.id,
        rateid: rateId,
        rate: selectedRate,
      }),
    });

    // هات كل التقييمات
    const res = await fetch("http://localhost:3001/api/ratings");
    const allRatings = await res.json();

    // فلتر التقييمات الخاصة بالمنتج
    const productRatings = allRatings.filter(
      (r) => r.productid === product.id
    );
    const total = productRatings.reduce((acc, cur) => acc + cur.rate, 0);
    const avg = total / productRatings.length;

    // حدث المنتج نفسه
    await fetch(`http://localhost:3001/api/products/db/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        averagerate: parseFloat(avg.toFixed(1)),
        ratecount: productRatings.length,
      }),
    });

    // عدل في الواجهة مباشرة
    Alert.alert("Thanks!", `You rated this product ${selectedRate} stars.`);
    setRating(selectedRate);
    product.averagerate = parseFloat(avg.toFixed(1));
    product.ratecount = productRatings.length;
  } catch (error) {
    console.error("Error rating product:", error);
    Alert.alert("Error", "Failed to submit rating.");
  }
};


  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    Alert.alert(
      isFavorite ? "Removed" : "Added",
      isFavorite ? "Removed from favorites." : "Added to favorites."
    );
  };

  const renderImageThumbnail = (imageUri, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => setSelectedImage(imageUri)}
      style={[
        tw`w-16 h-16 rounded-lg mr-2 border-2`,
        {
          borderColor:
            selectedImage === imageUri ? theme.primary : theme.lightGray,
        },
      ]}
    >
      <Image
        source={{ uri: getImageUri(imageUri) }}
        style={tw`w-full h-full rounded-lg`}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderSpecificationRow = (label, value) => (
    <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
      <Text
        style={[
          tw`text-sm`,
          { color: theme.darkGray, fontFamily: "Poppins-Regular" },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          tw`text-sm font-medium`,
          { color: theme.black, fontFamily: "Poppins-Medium" },
        ]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.white }]}>
      <Header title={product.name} showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`relative`}>
          <Image
            source={{ uri: getImageUri(selectedImage) }}
            style={[tw`w-full`, { height: width * 0.6 }]}
            resizeMode="contain"
          />

          <View style={tw`absolute top-4 right-4 flex-row`}>
            {hasDiscount && (
              <View
                style={[
                  tw`px-3 py-1 rounded-full mr-2`,
                  { backgroundColor: theme.red },
                ]}
              >
                <Text style={[tw`text-sm font-bold`, { color: theme.white }]}>
                  -{discountPercentage}%
                </Text>
              </View>
            )}
            {product.new && (
              <View
                style={[
                  tw`px-3 py-1 rounded-full`,
                  { backgroundColor: theme.green },
                ]}
              >
                <Text style={[tw`text-sm font-bold`, { color: theme.white }]}>
                  New
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              tw`absolute bottom-4 right-4 p-3 rounded-full`,
              { backgroundColor: theme.white },
            ]}
          >
            <Icon
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24}
              color={isFavorite ? theme.red : theme.darkGray}
            />
          </TouchableOpacity>
        </View>

        {productImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4 py-4`}
          >
            {productImages.map((img, i) => renderImageThumbnail(img, i))}
          </ScrollView>
        )}

        <View style={tw`px-4 py-4`}>
          <Text
            style={[
              tw`text-2xl font-bold mb-2`,
              { color: theme.black, fontFamily: "Poppins-Bold" },
            ]}
          >
            {" "}
            {product.name}{" "}
          </Text>

          <Text
            style={[
              tw`text-base mb-4`,
              { color: theme.darkGray, fontFamily: "Poppins-Regular" },
            ]}
          >
            {" "}
            {product.des}{" "}
          </Text>

          <View style={tw`flex-row items-center mb-6`}>
            <Text
              style={[
                tw`text-2xl font-bold`,
                { color: theme.primary, fontFamily: "Poppins-Bold" },
              ]}
            >
              {" "}
              ${product.price}{" "}
            </Text>
            {hasDiscount && (
              <Text
                style={[
                  tw`text-lg ml-3 line-through`,
                  { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                ]}
              >
                {" "}
                ${product.oldprice}{" "}
              </Text>
            )}
          </View>

          <View style={tw`flex-row items-center mb-6`}>
            <Text
              style={[
                tw`text-base font-semibold mr-4`,
                { color: theme.black, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              {" "}
              Quantity:{" "}
            </Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: theme.lightGray },
                ]}
              >
                <Icon name="remove" size={20} color={theme.black} />
              </TouchableOpacity>
              <Text
                style={[
                  tw`mx-4 text-lg font-semibold`,
                  { color: theme.black, fontFamily: "Poppins-SemiBold" },
                ]}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Icon name="add" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Rating Stars */}
          <View style={tw`mb-6`}>
            <View style={tw`flex-row`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingSubmit(star)}
                >
                  <Icon
                    name="star"
                    size={28}
                    color={
                      star <= (rating || product.averagerate)
                        ? "#FFD700"
                        : "#CCCCCC"
                    }
                    style={tw`mx-1`}
                  />
                </TouchableOpacity>
              ))}
              <Text
                style={[
                  tw`mt-2 text-sm`,
                  { color: theme.darkGray, fontFamily: "Poppins-Regular" },
                ]}
              >
                {product.ratecount || 0} ratings, Average:{" "}
                {product.averagerate || 0}/5
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[
              tw`py-4 rounded-lg mb-6`,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text
              style={[
                tw`text-center text-lg font-semibold`,
                { color: theme.white, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              {" "}
              Add to cart - ${(product.price * quantity).toFixed(2)}{" "}
            </Text>
          </TouchableOpacity>

          {product.general && (
            <View
              style={[
                tw`p-4 rounded-lg mb-4`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.black, fontFamily: "Poppins-Bold" },
                ]}
              >
                {" "}
                General Info{" "}
              </Text>
              {renderSpecificationRow(
                "Sales Package",
                product.general.salespackage
              )}
              {renderSpecificationRow("Model", product.general.model)}
              {renderSpecificationRow(
                "Secondary Material",
                product.general.secoundary
              )}
              {renderSpecificationRow(
                "Configuration",
                product.general.configuration
              )}
              {renderSpecificationRow(
                "Upholstery Material",
                product.general.upholsterymaterial
              )}
              {renderSpecificationRow(
                "Upholstery Color",
                product.general.upholsterycolor
              )}
            </View>
          )}

          {product.myproduct && (
            <View
              style={[
                tw`p-4 rounded-lg mb-4`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.black, fontFamily: "Poppins-Bold" },
                ]}
              >
                {" "}
                Product Details{" "}
              </Text>
              {renderSpecificationRow(
                "Filling Material",
                product.myproduct.filingmaterial
              )}
              {renderSpecificationRow(
                "Finish Type",
                product.myproduct.finishtype
              )}
              {renderSpecificationRow(
                "Adjustable Headrest",
                product.myproduct.adjustheaderest
              )}
              {renderSpecificationRow(
                "Maximum Load Capacity",
                product.myproduct.maxmumloadcapcity
              )}
              {renderSpecificationRow(
                "Country of Manufacture",
                product.myproduct.originalofmanufacture
              )}
            </View>
          )}

          {product.dimensions && (
            <View
              style={[
                tw`p-4 rounded-lg mb-4`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.black, fontFamily: "Poppins-Bold" },
                ]}
              >
                {" "}
                Dimensions{" "}
              </Text>
              {renderSpecificationRow("Width", product.dimensions.width)}
              {renderSpecificationRow("Height", product.dimensions.height)}
              {renderSpecificationRow("Depth", product.dimensions.depth)}
              {renderSpecificationRow("Weight", product.dimensions.weight)}
              {renderSpecificationRow(
                "Seat Height",
                product.dimensions.seatheight
              )}
              {renderSpecificationRow(
                "Leg Height",
                product.dimensions.legheight
              )}
            </View>
          )}

          {product.warranty && (
            <View
              style={[
                tw`p-4 rounded-lg mb-6`,
                { backgroundColor: theme.semiWhite },
              ]}
            >
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.black, fontFamily: "Poppins-Bold" },
                ]}
              >
                {" "}
                Warranty{" "}
              </Text>
              {renderSpecificationRow("Summary", product.warranty.summry)}
              {renderSpecificationRow(
                "Service Type",
                product.warranty.servicetype
              )}
              {renderSpecificationRow("Domestic", product.warranty.dominstic)}
              {renderSpecificationRow("Covered", product.warranty.covered)}
              {renderSpecificationRow(
                "Not Covered",
                product.warranty.notcovered
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;
