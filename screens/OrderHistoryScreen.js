import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Login expired. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://10.0.2.2:8000/api/orders/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
    } catch (err) {
      console.error("Order history fetch error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Login expired. Please login again.");
        return;
      }

      await axios.post(`http://10.0.2.2:8000/api/orders/reorder/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Reorder placed successfully!");
      fetchOrders();
    } catch (err) {
      console.error("Reorder error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to reorder");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order History</Text>

      {orders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>Order ID: {item._id}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Total: ₹{item.total_amount}</Text>
              <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>

              <TouchableOpacity
                style={styles.reorderButton}
                onPress={() => handleReorder(item._id)}
              >
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  orderCard: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderId: { fontWeight: "bold", marginBottom: 4 },
  reorderButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  reorderButtonText: { color: "#fff", textAlign: "center" },
  historyButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  historyButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
