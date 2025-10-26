import Header from "../components/Header"
import { useEffect, useState } from "react";
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { useAppContext } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
const postsPerPage = 4; 
const About = () => {
  const navigation = useNavigation();
  const [blogPosts, setblogPosts] = useState([]);
    useEffect(() => {
      const fetchPosts = async () => {
      const cached = await AsyncStorage.getItem("blogPosts");
      if (cached) return setblogPosts(JSON.parse(cached));
      const res = await fetch("https://furniro-back-production.up.railway.app/api/post");
      const data = await res.json();
      setblogPosts(data);
      await AsyncStorage.setItem("blogPosts", JSON.stringify(data));
    };
      fetchPosts();
    }, []);
    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        });
      };


  const { theme, isDarkMode } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const renderPost = ({ item }) => (
    <View style={tw.style(`mb-4 flex-1 mx-1 p-3 rounded-lg shadow`, { backgroundColor: theme.white })}>
      <Image source={{ uri: item.image }} style={tw`w-full h-32 rounded-md mb-2`} />
      <Text style={tw.style(`text-sm mb-1`, { color: theme.gray })}>
        {formatDate(item.date)} | {item.category}
      </Text>
      <Text style={tw.style(`text-md font-bold mb-1`, { color: theme.black })}>{item.title}</Text>
      <Text style={tw.style(`text-sm mb-2`, { color: theme.darkGray })} numberOfLines={2}>
        {item.content}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate("Readmore", { id: item._id })} style={tw.style(`px-3 py-1 rounded`, { backgroundColor: theme.primary, alignSelf: "flex-start" })}>
        <Text style={tw.style(`text-white text-sm`)}>Read More</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecentPost = (post, index) => (
    <View key={index} style={tw`mr-4 w-40`}>
      <Image source={{ uri: post.image }} style={tw`w-full h-24 rounded-md mb-2`} />
      <Text style={tw.style(`font-semibold`, { color: theme.black })} numberOfLines={1}>{post.title}</Text>
      <Text style={tw.style(`text-sm`, { color: theme.gray })}>{formatDate(post.date)}</Text>
    </View>
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <>
      <Header/>
    <View style={tw.style(`flex-1 p-4`, { backgroundColor: isDarkMode ? "black" : theme.white  })}>
      <TextInput
        style={tw.style(`border rounded px-3 py-2 mb-4`, { borderColor: theme.gray, backgroundColor: theme.white, color: theme.black })}
        placeholder="Search..."
        placeholderTextColor={theme.darkGray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Recent Posts Horizontal */}
      <View style={tw.style(`mb-6`)}>
        <Text style={tw.style(`text-lg font-bold mb-3`, { color: theme.black })}>Recent Posts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {blogPosts.filter(post => {
              const postDate = new Date(post.date);
              const now = new Date();
              const diffDays = (now - postDate) / (1000 * 60 * 60 * 24);
              return diffDays <= 30;
            }).map(renderRecentPost)}

        </ScrollView>
      </View>

      <FlatList
        data={currentPosts}
        renderItem={renderPost}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} // 2 عمود
        contentContainerStyle={tw`pb-4`}
      />

      {/* Pagination Buttons */}
      <View style={tw`flex-row justify-center mt-4`}>
        {Array.from({ length: totalPages }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setCurrentPage(i + 1)}
            style={tw.style(`px-3 py-1 mx-1 rounded`, {
              backgroundColor: currentPage === i + 1 ? theme.primary : theme.lightBeige,
            })}
          >
            <Text style={tw.style(`font-bold text-sm`, { color: currentPage === i + 1 ? theme.white : theme.black })}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    </>
  );
};

export default About;
