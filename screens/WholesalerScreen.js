// WholesalerPortal.js
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function WholesalerPortal({ navigation }) {
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

  // Card Component
  const MenuCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.cardContent}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <MaterialIcons name="keyboard-arrow-right" size={26} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Logout Floating Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Wholesaler Portal</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <MenuCard
          title="View Product List"
          color="#4cafef"
          icon={<Ionicons name="list-outline" size={24} color="#4cafef" />}
          onPress={() => navigation.navigate("ProductList")}
        />
        <MenuCard
          title="Add New Product"
          color="#66bb6a"
          icon={<Ionicons name="add-circle-outline" size={24} color="#66bb6a" />}
          onPress={() => navigation.navigate("ProductForm")}
        />
        <MenuCard
          title="Orders Dashboard"
          color="#ff9800"
          icon={<Ionicons name="cart-outline" size={24} color="#ff9800" />}
          onPress={() => navigation.navigate("OrdersDashboard")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  logoutBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    marginLeft: 10,
    color: "#333",
  },
});
