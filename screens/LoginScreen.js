import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

const socket = io("http://10.0.2.2:8000"); 

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  //  Already logged in check
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const role = await AsyncStorage.getItem("userRole");
        const userId = await AsyncStorage.getItem("userId");

        if (token && role && userId) {
          handleSocketConnect(role, userId);
          if (role === "wholesaler") {
            navigation.replace("WholesalerPortal");
          } else {
            navigation.replace("RetailerPortal");
          }
        }
      } catch (err) {
        console.log("Error checking login:", err);
      }
    };
    checkLoginStatus();
  }, []);

  //  Socket role based join/create
  const handleSocketConnect = async (role, userId) => {
    if (role === "retailer") {
      socket.emit("createRoom", { retailerId: userId });
    } else if (role === "wholesaler") {
      const retailerId = await AsyncStorage.getItem("retailerId");
      if (retailerId) {
        socket.emit("joinRoom", { retailerId, wholesalerId: userId });
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      console.log("Login button clicked");
      const res = await axios.post("http://10.0.2.2:8000/login", {
        email,
        password,
      });

      console.log("API Response:", res.data);

      const { role, token, userId } = res.data;

      if (!role || !token || !userId) {
        Alert.alert("Error", "Invalid login response from server");
        return;
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userRole", role);
      await AsyncStorage.setItem("userId", userId);

      if (role === "retailer") {
        await AsyncStorage.setItem("retailerId", userId);
      }

      // Connect socket
      handleSocketConnect(role, userId);

      // Navigate based on role
      if (role === "wholesaler") {
        navigation.reset({ index: 0, routes: [{ name: "WholesalerPortal" }] });
      } else if (role === "retailer") {
        navigation.reset({ index: 0, routes: [{ name: "RetailerPortal" }] });
      } else {
        Alert.alert("Error", "Unknown role");
      }
    } catch (error) {
      console.log("Login Error:", error.response?.data || error.message);
      Alert.alert(
        "Login Error",
        error.response?.data?.message || "Invalid credentials"
      );
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        marginTop: 50,
      }}
    >
      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 27,
              fontWeight: "bold",
              marginTop: 50,
              color: "#041E42",
            }}
          >
            Login to your Account
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginTop: 70 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#D0D0D0",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >
            <MaterialIcons
              style={{ marginLeft: 8 }}
              name="email"
              size={24}
              color="gray"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: 16,
              }}
              placeholder="Enter your Email"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#D0D0D0",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >
            <AntDesign
              name="lock1"
              size={24}
              color="gray"
              style={{ marginLeft: 8 }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: 16,
              }}
              placeholder="Enter your Password"
            />
          </View>
        </View>

        <View style={{ marginTop: 60 }} />

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          style={{
            width: 200,
            backgroundColor: "blue",
            borderRadius: 6,
            marginLeft: "auto",
            marginRight: "auto",
            padding: 15,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Login
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 15 }}
        >
          <Text
            style={{ textAlign: "center", color: "gray", fontSize: 16 }}
          >
            Don't have an account? Sign Up
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
