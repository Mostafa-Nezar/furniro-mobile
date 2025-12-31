import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import tw from "twrnc";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";

const GetStarted = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext();

  const [clickCount, setClickCount] = useState(0);
  const images = [
    { title: "Welcome to Our App!", image: require("../../../assets/bro2.png"), des: "We provide the best home Furniture for you."},
    { title: "Our Services", image: require("../../../assets/bro3.png"), des: "We offer a wide range of luxury furniture"},
    { title: "Let’s get Start", image: require("../../../assets/bro4.png"), des: "Connecting you with skilled professionals"}
  ];

  const handleGetStartedPress = () => { clickCount < 2 ? setClickCount(clickCount + 1) : navigation.navigate("Login") }

  return (
    <View style={[tw`flex-1 justify-center items-center p-6`, { backgroundColor: theme.white }]}>
      <Animated.View key={clickCount} entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)}>
      <Animated.Image source={images[clickCount].image} style={tw`w-50 h-50`} entering={SlideInRight.duration(500)} exiting={SlideOutLeft.duration(500)} resizeMode="contain"/>
      </Animated.View>
      <Text style={[tw`text-xl font-semibold text-center mt-5 mb-2`, { color: theme.black }]}>
        {images[clickCount].title}
      </Text>
      <Text style={[tw`text-sm text-center mt-2`, { color: theme.darkGray }]}>
        {images[clickCount].des}
      </Text>
      <View style={tw`flex-row mt-4 mb-6`}>
        {images.map((_, index) => (
          <View key={index} style={[ tw`w-2 h-2 rounded-full mx-1`, { backgroundColor: index === clickCount ? theme.red : theme.darkGray } ]}/>
        ))}
      </View>
      <TouchableOpacity style={[tw`w-72 py-4 rounded-lg`, { backgroundColor: theme.primary }]} onPress={handleGetStartedPress}>
        <Text style={[tw`text-center text-lg font-semibold`, { color: "white" }]}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GetStarted;
