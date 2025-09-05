import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";



const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
const [role, setRole] = useState("");
  const navigation = useNavigation();
  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      phone : phone,
      role : role,
    };

    // send a POST  request to the backend API to register the user
    axios.post("http://10.0.2.2:8000/register", user)
  .then((res) => {
    if (res.status === 201) {
      console.log("Registration success", res.data);
      navigation.navigate("OtpVerificationScreen", { email: user.email });
    } else {
      console.log("Unexpected status:", res.status);
    }
  })
  .catch((err) => {
    if (err.response) {
      console.log("Server error:", err.response.data);
    } else {
      console.log("Network error:", err.message);
    }
  });

  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center",marginTop:50  }}
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
            Register to your Account
          </Text>
        </View>

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
            <Ionicons
              name="person"
              size={24}
              color="gray"
              style={{ marginLeft: 8 }}
            />
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: name ? 16 : 16,
              }}
              placeholder="enter your name"
            />
          </View>

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
              onChangeText={(text) => setEmail(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: password ? 16 : 16,
              }}
              placeholder="enter your Email"
            />
          </View>
        </View>
        

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
  <Ionicons
    name="call"
    size={24}
    color="gray"
    style={{ marginLeft: 8 }}
  />
  <TextInput
    value={phone}
    onChangeText={setPhone}
    keyboardType="phone-pad"
    style={{
      color: "gray",
      marginVertical: 10,
      width: 300,
      fontSize: 16,
    }}
    placeholder="Enter your phone number"
  />
</View>


<View style={{ flexDirection: "row", marginTop: 30, justifyContent: "center", gap: 20 }}>
  <Pressable
    onPress={() => setRole("wholesaler")}
    style={{
      backgroundColor: role === "wholesaler" ? "blue" : "#D0D0D0",
      padding: 10,
      borderRadius: 5,
      width: 140,
      alignItems: "center",
    }}
  >
    <Text style={{ color: role === "wholesaler" ? "white" : "gray" }}>
      Wholesaler
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setRole("retailer")}
    style={{
      backgroundColor: role === "retailer" ? "blue" : "#D0D0D0",
      padding: 10,
      borderRadius: 5,
      width: 140,
      alignItems: "center",
    }}
  >
    <Text style={{ color: role === "retailer" ? "white" : "gray" }}>
      Retailer
    </Text>
  </Pressable>
</View>

        <View>
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
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: email ? 16 : 16,
              }}
              placeholder="enter your Password"
            />
          </View>
        </View>

        <View style={{ marginTop: 40 }} />

        <Pressable
          onPress={handleRegister}
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
            Register
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        >
          <Text style={{  textAlign: "center", color: "gray", fontSize: 16 }}>
            Already have an account? Sign In
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
