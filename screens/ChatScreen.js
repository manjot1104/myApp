import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://10.0.2.2:8000"); // Backend URL

export default function ChatScreen({ route }) {
  const {
    wholesalerId,
    retailerId,
    retailerName,
    wholesalerName,
    currentUserId,
  } = route.params;

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Who am I?
  const meId = currentUserId || wholesalerId;
  
  let chatWithName = "Unknown";
  if (currentUserId === wholesalerId) {
    chatWithName = retailerName || "Retailer";
  } else if (currentUserId === retailerId) {
    chatWithName = wholesalerName || "Wholesaler";
  }

  // Create / Join Room
  useEffect(() => {
    const initChat = async () => {
      try {
        // Create or get room
        const res = await axios.post(
          "http://10.0.2.2:8000/api/chat/create-room",
          {
            wholesalerId,
            retailerId,
          }
        );

        const room = res.data;
        setRoomId(room._id);

        socket.emit("joinRoom", { retailerId, wholesalerId });

        // Load old messages
        const oldMsgs = await axios.get(
          `http://10.0.2.2:8000/api/chat/${room._id}/messages`
        );
        setMessages(oldMsgs.data || []);
      } catch (err) {
        console.log("Chat init error:", err.response?.data || err.message);
      }
    };

    initChat();

    return () => {
      socket.off("newChatMessage");
    };
  }, []);

  // Listen for new messages from server
  useEffect(() => {
    const onNew = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("newChatMessage", onNew);
    return () => socket.off("newChatMessage", onNew);
  }, []);

  // Send message via SOCKET ONLY (backend socket saves + broadcasts)
  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;

    const payload = {
      retailerId, 
      wholesalerId,
      senderId: meId, 
      text: input,
    };

    try {
      // Emit to server -> server saves to DB and emits `newChatMessage`
      socket.emit("sendMessage", payload);

      // Clear input. We rely on socket `newChatMessage` to update UI (no duplicates)
      setInput("");
    } catch (err) {
      console.log("Send error:", err?.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with {chatWithName}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item, i) => (item._id ? item._id : `${i}`)}
        renderItem={({ item }) => {
          const sender = item.senderId?._id || item.senderId; // handle object or string
          const isMe = String(sender).trim() === String(meId).trim();
          return (
            <View
              style={[styles.msgBubble, isMe ? styles.myMsg : styles.otherMsg]}
            >
              <Text style={isMe ? styles.myText : styles.otherText}>
                {item.text}
              </Text>
              {item.createdAt ? (
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              ) : null}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type message..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  msgBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "70%",
  },
  myMsg: { backgroundColor: "#007bff", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },

  myText: { color: "#fff", fontSize: 16 },
  otherText: { color: "#000", fontSize: 16 },

  timeText: {
    fontSize: 10,
    color: "#555",
    marginTop: 2,
    alignSelf: "flex-end",
  },

  inputRow: { flexDirection: "row", marginTop: "auto" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    borderColor: "#ccc",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 20,
  },
  sendText: { color: "white", fontWeight: "bold" },
});
