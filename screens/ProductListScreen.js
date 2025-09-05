
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (token) fetchProducts(token);
    }, [token])
  );

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    const storedToken = await AsyncStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchProducts(storedToken);
    }
  };

  const fetchProducts = async (authToken = token) => {
    try {
      const res = await axios.get("http://10.0.2.2:8000/products", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const deleteProduct = async (id) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            console.log("Trying to delete:", id);

            await axios.delete(`http://10.0.2.2:8000/products/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Product deleted successfully");
            fetchProducts(token);
          } catch (err) {
            console.error("Error deleting product:", err);
            Alert.alert("Error", "Failed to delete product");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
  <View style={styles.card}>
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
    <Text>SKU: {item.sku}</Text>
    <Text>₹{item.price}</Text>
    <Text>Stock: {item.stock_qty}</Text>
    {item.stock_qty <= 5 && (
      <Text style={{ color: "red", fontWeight: "bold" }}>⚠ Low Stock</Text>
    )}
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductForm", { product: item })}
      >
        <Text style={styles.edit}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteProduct(item._id)}>
        <Text style={styles.delete}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
       <TouchableOpacity 
    style={styles.bulkButton}
    onPress={() => navigation.navigate("BulkUpload")}
  >
    <Text style={{ color: "#fff" }}>Bulk Upload</Text>
  </TouchableOpacity>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  card: { padding: 10, borderWidth: 1, borderColor: "#ccc", marginBottom: 10, borderRadius: 5 },
  image: { width: 100, height: 100, marginBottom: 5 },
  placeholder: {
    width: 100,
    height: 100,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  bulkButton: {
  backgroundColor: "blue",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 15,
},
  name: { fontWeight: "bold", fontSize: 16 },
  actions: { flexDirection: "row", marginTop: 5 },
  edit: { color: "blue", marginRight: 10 },
  delete: { color: "red" },
});
