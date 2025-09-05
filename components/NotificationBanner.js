// components/NotificationBanner.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";

export default function NotificationBanner({ message, onHide, onPress }) {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    // Slide-in
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 sec (agar click na kare toh)
    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onHide && onHide());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.text}>📩 {message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  text: { color: "white", fontWeight: "bold", fontSize: 16 },
});
