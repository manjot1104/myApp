import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

export default function RetailerListScreen({ navigation, route }) {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { wholesalerId, startChat } = route.params; 

  useEffect(() => {
    axios
      .get("http://10.0.2.2:8000/api/chat/retailers")
      .then((res) => {
        setRetailers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching retailers:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Retailer to Chat</Text>

      <FlatList
        data={retailers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.retailerButton}
            onPress={() => {
              if (startChat) {
                startChat(item._id); //  retailerId pass
              }
              navigation.navigate("ChatScreen", {
                retailerId: item._id,
                wholesalerId: wholesalerId,
              });
            }}
          >
            <Text style={styles.retailerName}>{item.name}</Text>
            <Text style={styles.retailerEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  retailerButton: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  retailerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  retailerEmail: {
    fontSize: 14,
    color: "gray",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
