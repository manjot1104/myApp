import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { io } from "socket.io-client";

// ✅ Android Emulator ke liye localhost = 10.0.2.2
const socket = io("http://10.0.2.2:8000");

export default function WholesalerScreen({ navigation }) {
  const { mode, toggleTheme } = useTheme();
  const [newMessages, setNewMessages] = useState(0);
  const [wholesalerId, setWholesalerId] = useState(null);
  const [bannerMsg, setBannerMsg] = useState("");
  const [bannerAnim] = useState(new Animated.Value(-100));

  // 📩 Banner show karne ka function
  const showBanner = (message) => {
    setBannerMsg(message);
    Animated.timing(bannerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(bannerAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  // ✅ Wholesaler ko DB se apna Id milega (AsyncStorage se)
  useEffect(() => {
    const fetchUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      setWholesalerId(id);
    };
    fetchUser();
  }, []);

  // ✅ Socket par direct new messages listen karo
  useEffect(() => {
    socket.on("newChatMessage", (msg) => {
      if (msg?.text) {
        setNewMessages((prev) => prev + 1);
        Alert.alert("New Message", msg.text);
        showBanner(msg.text);
      }
    });

    return () => {
      socket.off("newChatMessage");
    };
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["authToken", "userRole", "userId"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // ⬇️ WholesalerScreen ke andar add karo
const startChat = (retailerId) => {
  if (!wholesalerId) {
    Alert.alert("Error", "Wholesaler ID not found");
    return;
  }

  // ✅ Backend ko event bhejo
  socket.emit("startChat", { wholesalerId, retailerId });

  // ✅ Chat screen pe jao
  navigation.navigate("ChatScreen", { wholesalerId, retailerId });
};


  const MenuCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderLeftColor: color,
          backgroundColor: mode === "light" ? "#fff" : "#1e1e1e",
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {icon}
        <Text
          style={[
            styles.cardTitle,
            { color: mode === "light" ? "#333" : "#fff" },
          ]}
        >
          {title}
        </Text>
      </View>
      <MaterialIcons
        name="keyboard-arrow-right"
        size={26}
        color={mode === "light" ? "#888" : "#ccc"}
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: mode === "light" ? "#f8f9fa" : "#121212" },
      ]}
    >
      {/* 🔔 Banner Notification */}
      <Animated.View
        style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]}
      >
        <Text style={styles.bannerText}>📩 {bannerMsg}</Text>
      </Animated.View>

      {/* 🌗 Toggle Button */}
      <View style={styles.toggleContainer}>
        <Text
          style={{
            color: mode === "light" ? "#000" : "#fff",
            marginRight: 10,
          }}
        >
          {mode === "light" ? "Light Mode" : "Dark Mode"}
        </Text>
        <Switch value={mode === "dark"} onValueChange={toggleTheme} />
      </View>

      {/* 🚪 Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text
        style={[styles.heading, { color: mode === "light" ? "#333" : "#fff" }]}
      >
        Wholesaler Portal
      </Text>

      {/* 💬 Chat Button with Badge */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => {
          setNewMessages(0);
          navigation.navigate("RetailerList", { wholesalerId,startChat: startChat,  }); // ✅ Retailer list me jaayega
        }}
      >
        <Text style={styles.chatButtonText}>Start Chat</Text>
        {newMessages > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{newMessages}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 📋 Menu Cards */}
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
          icon={
            <Ionicons name="add-circle-outline" size={24} color="#66bb6a" />
          }
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
  logoutText: { color: "white", fontWeight: "bold", marginLeft: 5 },
  card: {
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 5,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 18, marginLeft: 10 },
  chatButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  chatButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  badge: {
    backgroundColor: "red",
    borderRadius: 12,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: { color: "white", fontWeight: "bold" },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#007BFF",
    padding: 12,
    zIndex: 10,
  },
  bannerText: { color: "white", fontWeight: "bold", textAlign: "center" },
});
