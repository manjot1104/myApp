import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  // Logout function
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("userId");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const getTokenAndFetch = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        setToken(authToken);
        fetchProducts(authToken);

        // Polling every 5 sec
        const interval = setInterval(() => {
          fetchProducts(authToken);
        }, 5000);

        return () => clearInterval(interval);
      }
    };
    getTokenAndFetch();
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
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
    >
      {item.image_url ? (
        <Image
          source={{ uri: `http://10.0.2.2:8000${item.image_url}` }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text>₹{item.price}</Text>
      <Text>Stock: {item.stock_qty}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("OrderHistory")}
      >
        <Text style={styles.historyButtonText}>View Order History</Text>
      </TouchableOpacity>
      
      <TextInput
        placeholder="Search Products"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate("Cart")}
      >
        <Text style={{ color: "#fff" }}>🛒 Go to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  categories: { flexDirection: "row", marginBottom: 10, flexWrap: "wrap" },
  categoryBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  categoryActive: { backgroundColor: "blue", borderColor: "blue" },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  image: { width: "100%", height: 150, marginBottom: 5 },
  placeholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  cartButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  historyButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  historyButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  logoutBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop:60,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  }
});
