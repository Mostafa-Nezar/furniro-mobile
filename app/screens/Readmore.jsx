import { useEffect, useState } from "react";
import { Text, Image, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";

export default function Readmore({ route }) {
  const { id } = route.params;
  const [post, setPost] = useState(null);

  useEffect(() => {
    const getPostFromStorage = async () => {
      try {
        const cached = await AsyncStorage.getItem("blogPosts");
        if (cached) {
          const posts = JSON.parse(cached);
          const found = posts.find((p) => p._id === id);
          if (found) setPost(found);
        }
      } catch (err) {
        console.log("Error reading post:", err);
      }
    };
    getPostFromStorage();
  }, [id]);

  if (!post)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <>
    <Header showBack={true} />
      <ScrollView style={{ padding: 16 }}>
        <Image
          source={{ uri: post.image }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            marginBottom: 16,
          }}
        />
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
          {post.title}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>{post.content}</Text>
        <Text style={{ marginTop: 10, color: "gray" }}>
          {new Date(post.date).toLocaleDateString()}
        </Text>
      </ScrollView>
    </>
  );
}
