import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../theme/ThemeContext";

export default function HomeScreen({ navigation }) {
  const { mode, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");
  const [retailerId, setRetailerId] = useState(""); // ✅ new

  useEffect(() => {
  const init = async () => {
    try {
      // 1. Load retailerId
      const id = await AsyncStorage.getItem("retailerId");
      if (id) setRetailerId(id);

      // 2. Load authToken
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        setToken(authToken);

        // Fetch products initially
        fetchProducts(authToken);

        // 3. Auto refresh every 5s
        const interval = setInterval(() => fetchProducts(authToken), 5000);

        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Error in init:", error);
    }
  };

  init();
}, []);


  const fetchProducts = async (authToken) => {
    const res = await axios.get("http://10.0.2.2:8000/products", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setProducts(res.data);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: mode === "light" ? "#fff" : "#1e1e1e",
          borderColor: mode === "light" ? "#ccc" : "#333",
        },
      ]}
      onPress={() =>
        navigation.navigate("ProductDetails", {
          product: item,
          retailerId: retailerId, // ✅ pass retailerId
          
        })
      }
    >
      {item.image_url ? (
        <Image
          source={{ uri: `http://10.0.2.2:8000${item.image_url}` }}
          style={styles.image}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { backgroundColor: mode === "light" ? "#eee" : "#333" },
          ]}
        >
          <Text style={{ color: mode === "light" ? "#000" : "#fff" }}>
            No Image
          </Text>
        </View>
      )}
      <Text
        style={[styles.name, { color: mode === "light" ? "#000" : "#fff" }]}
      >
        {item.name}
      </Text>
      <Text style={{ color: mode === "light" ? "#000" : "#fff" }}>
        ₹{item.price}
      </Text>
      <Text style={{ color: mode === "light" ? "#000" : "#fff" }}>
        Stock: {item.stock_qty}
      </Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("userId");

    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: mode === "light" ? "#fff" : "#121212" },
      ]}
    >
      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <Text
          style={{ color: mode === "light" ? "#000" : "#fff", marginRight: 10 }}
        >
          {mode === "light" ? "Light Mode" : "Dark Mode"}
        </Text>
        <Switch value={mode === "dark"} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Search Products"
        placeholderTextColor={mode === "light" ? "#888" : "#ccc"}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.searchInput,
          {
            backgroundColor: mode === "light" ? "#fff" : "#333",
            color: mode === "light" ? "#000" : "#fff",
            borderColor: mode === "light" ? "#ccc" : "#555",
          },
        ]}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  card: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  image: { width: "100%", height: 150, marginBottom: 5 },
  placeholder: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  logoutBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  logoutText: { color: "white", fontWeight: "bold" },
});
