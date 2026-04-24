import React from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Colors from "../constants/Colors"; // Điều chỉnh đường dẫn nếu cần

interface Props {
  content: string;
  setContent: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
}

export default function ChatInput({ content, setContent, onSend, sending, disabled }: Props) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#999"
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={disabled}
      >
        <Text style={styles.sendButtonText}>{sending ? "..." : "Gửi"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#050505",
  },
  sendButton: {
    backgroundColor: Colors.primary, // Mặc định theo Colors, bạn có thể override
    minWidth: 50,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sendButtonDisabled: { backgroundColor: "#E4E6EB" },
  sendButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
});