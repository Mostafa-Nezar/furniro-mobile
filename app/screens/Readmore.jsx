import { useEffect, useState } from "react";
import { Text, Image, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";

export default function Readmore({ route }) {
  const { id } = route.params;
  const [post, setPost] = useState(null);
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem("blogPosts");
        if (data) setPost(JSON.parse(data).find(p => p._id === id));
      } catch (err) { console.log(err); }
    })();
  }, [id]);

  if (!post) return <ActivityIndicator size="large" style={tw`mt-12`} />;

  return (
    <>
      <Header showBack />
      <ScrollView style={tw`p-4`}>
        <Image
          source={{ uri: post.image }}
          style={tw`w-full h-52 rounded-lg mb-4`}
        />
        <Text
          style={[
            tw`text-xl font-bold mb-2`,
            { color: isDarkMode ? "white" : "black" },
          ]}
        >
          {post.title}
        </Text>
        <Text
          style={[
            tw`text-base leading-6`,
            { color: isDarkMode ? "#ddd" : "#333" },
          ]}
        >
          {post.content}
        </Text>
        <Text style={tw`text-gray-500 mt-3`}>
          {new Date(post.date).toLocaleDateString()}
        </Text>
      </ScrollView>
    </>
  );
}
