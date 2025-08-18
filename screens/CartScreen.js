import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Login expired. Please login again.");
        return;
      }

      const res = await axios.get("http://10.0.2.2:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data);
      calculateTotal(res.data);
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch cart");
    }
  };

  const calculateTotal = (cartItems) => {
    let t = 0;
    cartItems.forEach((item) => {
      t += item.product.price * item.quantity;
    });
    setTotal(t);
  };
 const changeQuantity = async (cartItemId, currentQty, delta, stock) => {
  const newQty = currentQty + delta;
  if (newQty < 1) return;

  if (delta > 0 && newQty > stock) {
    Alert.alert("Stock limit", `Maximum stock available: ${stock}`);
    return;
  }

  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.put(
      `http://10.0.2.2:8000/api/cart/update/${cartItemId}`,
      { quantity: newQty },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedCart = cart.map((item) =>
      item._id === cartItemId ? { ...item, quantity: res.data.quantity } : item
    );
    setCart(updatedCart);
    calculateTotal(updatedCart);
  } catch (err) {
    console.error("Update quantity error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Failed to update quantity");
  }
};



  const removeFromCart = async (cartItemId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.delete(
        `http://10.0.2.2:8000/api/cart/remove/${cartItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedCart = cart.filter((item) => item._id !== cartItemId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (err) {
      console.error(
        "Remove cart item error:",
        err.response?.data || err.message
      );
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const placeOrder = async () => {
  if (cart.length === 0) {
    Alert.alert("Cart is empty", "Add some products first");
    return;
  }

  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Error", "Login expired. Please login again.");
      setLoading(false);
      return;
    }

    // Prepare items for backend
    const items = cart.map((item) => ({
      product_id: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      wholesaler_id: item.product.wholesaler_id,
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    await axios.post(
      "http://10.0.2.2:8000/api/orders",
      { items, total_amount: totalAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Alert.alert("Success", "Order placed successfully!");
    setCart([]);
    setTotal(0);
    navigation.navigate("RetailerPortal");
  } catch (err) {
    console.error("Place order error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Failed to place order");
  } finally {
    setLoading(false);
  }
};


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.product.name}</Text>
      <Text>Price: ₹{item.product.price}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={() => changeQuantity(item._id, item.quantity, -1)}
      >
        <Text style={styles.qtyText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.qtyNumber}>{item.quantity}</Text>
      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={() => changeQuantity(item._id, item.quantity, 1,item.product.stock_qty)}
      >
        <Text style={styles.qtyText}>+</Text>
      </TouchableOpacity>
    </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCart(item._id)}
      >
        <Text style={{ color: "white" }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Your cart is empty
        </Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <Text style={styles.total}>Total: ₹{total}</Text>
          <TouchableOpacity
            style={[styles.orderBtn, loading && { opacity: 0.7 }]}
            onPress={placeOrder}
            disabled={loading}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {loading ? "Placing..." : "Place Order"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  removeBtn: {
    marginTop: 5,
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  total: { fontSize: 18, fontWeight: "bold", textAlign: "right", marginTop: 10 },
  orderBtn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  qtyBtn: {
  borderWidth: 1,
  borderColor: "#ccc",
  paddingHorizontal: 10,
  paddingVertical: 5,
  marginHorizontal: 10,
  borderRadius: 5,
},
qtyText: { fontSize: 18 },
qtyNumber: { fontSize: 16, minWidth: 25, textAlign: "center" },


});
