import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BulkUploadScreen({ navigation }) {
  const [file, setFile] = useState(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert("Please select a CSV file first");
      return;
    }

    const token = await AsyncStorage.getItem("authToken");
    const formData = new FormData();

    // ⚡ web me "file" object hota hai
    if (file.file) {
      formData.append("file", file.file);
    } else {
      // native ke liye fallback
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "text/csv",
      });
    }

    try {
      const res = await axios.post("http://10.0.2.2:8000/products/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", `${res.data.count} products uploaded`);
      navigation.goBack();
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickFile}>
        <Text style={styles.btnText}>Pick CSV File</Text>
      </TouchableOpacity>

      {file && (
        <TouchableOpacity style={styles.button} onPress={uploadFile}>
          <Text style={styles.btnText}>Upload File</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { backgroundColor: "blue", padding: 15, margin: 10, borderRadius: 5 },
  btnText: { color: "#fff" },
});
