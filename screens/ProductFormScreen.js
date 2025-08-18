import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProductFormScreen({ route, navigation }) {
  const product = route.params?.product || {};
  const [name, setName] = useState(product.name || "");
  const [sku, setSku] = useState(product.sku || "");
  const [price, setPrice] = useState(product.price?.toString() || "");
  const [description, setDescription] = useState(product.description || "");
  const [stock, setStock] = useState(product.stock_qty?.toString() || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pick Image
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted)
      return Alert.alert(
        "Permission required",
        "Camera roll permission is required to select images."
      );

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0]);
  };

  // Save or Update Product
  const saveProduct = async () => {
    if (!name || !sku || !price) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // Get token and userId from AsyncStorage
      const token = await AsyncStorage.getItem("authToken");
      const wholesalerId = await AsyncStorage.getItem("userId");

      if (!token || !wholesalerId) {
        Alert.alert("Error", "Login expired. Please login again.");
        setLoading(false);
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("stock_qty", stock);

      if (image) {
        formData.append("image", {
          uri: image.uri.startsWith("file://")
            ? image.uri
            : "file://" + image.uri,
          name: "product.jpg",
          type: "image/jpeg",
        });
      }

      // URL & method
      const url = product?._id
        ? `http://10.0.2.2:8000/products/${product._id}`
        : "http://10.0.2.2:8000/products";
      const method = product?._id ? "put" : "post";

      // Axios request with proper headers
      const res = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert(
        "Success",
        product?._id ? "Product updated successfully" : "Product added successfully"
      );
      navigation.goBack();
    } catch (err) {
      console.error("Save product error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="SKU"
        value={sku}
        onChangeText={setSku}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Stock Quantity"
        value={stock}
        onChangeText={setStock}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>
          {image ? "Change Image" : "Pick Image"}
        </Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveProduct}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {product._id ? "Update Product" : "Add Product"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  imageButtonText: { color: "#fff" },
  preview: { width: 100, height: 100, marginBottom: 10 },
  saveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
});
