import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);

  // Get token
  useEffect(() => {
    const getToken = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      setToken(authToken);
    };
    getToken();
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://10.0.2.2:8000/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.log("Error fetching orders", err.response?.data || err.message);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://10.0.2.2:8000/api/orders/update-status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log("Error updating order status", err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Wholesaler Orders Dashboard</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>
              Retailer: {item.user?.name || "Unknown"}
            </Text>

            {item.items.map((orderItem, idx) => (
              <View key={idx} style={{ marginBottom: 5 }}>
                <Text style={styles.text}>Product: {orderItem.name}</Text>
                <Text style={styles.text}>Price: ₹{orderItem.unit_price}</Text>
                <Text style={styles.text}>Quantity: {orderItem.quantity}</Text>
              </View>
            ))}

            <Text style={styles.text}>Status: {item.status}</Text>

            <View style={styles.buttonRow}>
              {item.status === "Pending" && (
                <>
                  <Button title="Accept" onPress={() => updateOrderStatus(item._id, "Accepted")} />
                  <Button title="Reject" color="red" onPress={() => updateOrderStatus(item._id, "Rejected")} />
                </>
              )}
              {item.status === "Accepted" && (
                <Button title="Mark Shipped" onPress={() => updateOrderStatus(item._id, "Shipped")} />
              )}
              {item.status === "Shipped" && (
                <Button title="Mark Delivered" onPress={() => updateOrderStatus(item._id, "Delivered")} />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  text: { fontSize: 16, marginBottom: 5 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  }
});
