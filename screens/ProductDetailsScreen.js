import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Error", "Login expired. Please login again.");
      setLoading(false);
      return;
    }

    await axios.post(
      "http://10.0.2.2:8000/api/cart/add", // must include /add
      { productId: product._id, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Alert.alert("Success", "Product added to cart!",[
      {
        text: "OK",
        onPress: () => navigation.navigate("RetailerPortal"),
      },
    ]);

  } catch (err) {
    console.error("Add to cart error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Failed to add to cart");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: `http://10.0.2.2:8000${product.image_url}` }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}><Text>No Image</Text></View>
      )}

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.stock}>Stock: {product.stock_qty}</Text>
      <Text style={styles.description}>{product.description}</Text>

      {/* Quantity Selector */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
        >
          <Text style={styles.qtyText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.qtyNumber}>{quantity}</Text>

        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add to Cart */}
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={addToCart}
        disabled={loading}
      >
        <Text style={styles.cartBtnText}>{loading ? "Adding..." : "Add to Cart"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  image: { width: "100%", height: 250, marginBottom: 10 },
  placeholder: { width: "100%", height: 250, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  price: { fontSize: 18, color: "green", marginBottom: 5 },
  stock: { fontSize: 16, marginBottom: 5 },
  description: { fontSize: 14, marginBottom: 10 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  qtyBtn: { padding: 10, borderWidth: 1, borderColor: "#ccc" },
  qtyText: { fontSize: 18 },
  qtyNumber: { marginHorizontal: 20, fontSize: 16 },
  cartBtn: { backgroundColor: "blue", padding: 15, borderRadius: 5, alignItems: "center" },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
