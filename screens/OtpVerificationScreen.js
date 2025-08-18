import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const OtpVerificationScreen = ({ route }) => {
  const { email } = route.params; // pass email from RegisterScreen after successful registration
  const [otp, setOtp] = useState("");
  const navigation = useNavigation();

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    axios
      .post("http://10.0.2.2:8000/verify-otp", { email, otp })
      .then((res) => {
    if (res.data.success) {
      const userRole = res.data.role; // backend se role aa raha hai: 'wholesaler' ya 'retailer'

      if (userRole === "wholesaler") {
        navigation.navigate("WholesalerPortal");
      } else if (userRole === "retailer") {
        navigation.navigate("RetailerPortal");
      } 
    }else {
      Alert.alert("Error",res.data.message || "OTP verification failed");
    }
  })
      .catch((error) => {
        console.log("OTP verification failed", error.response?.data || error.message);
        Alert.alert(
          "Verification Error",
          error.response?.data?.message || "Failed to verify OTP"
        );
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <Text style={styles.heading}>Verify your Email</Text>
        <Text style={styles.instruction}>
          Enter the 6-digit OTP sent to your email: {email}
        </Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter OTP"
        />

        <Pressable style={styles.button} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    letterSpacing: 12,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#103cfe",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
