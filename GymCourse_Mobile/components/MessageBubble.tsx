import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors"; 
import { ChatMessage } from "../types/chat"; 

interface Props {
  message: ChatMessage;
  isMine: boolean;
  isAdmin?: boolean;
  senderName?: string;
}

export default function MessageBubble({ message, isMine, isAdmin, senderName }: Props) {
    const displaySenderName = isAdmin ? "HLV hỗ trợ" : senderName || "HLV";
    const formatTime = (dateString: string) => {
    if (!dateString) return "";
    // Nếu ngày giờ chưa có 'Z' (UTC) và chưa có offset (dấu + hoặc -), ta thêm 'Z' vào cuối
    const iso = dateString.includes('Z') || dateString.includes('+') 
                ? dateString 
                : dateString + 'Z';
    
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeString = formatTime(message.sentAt);

  if (isMine) {
    return (
      <View style={styles.myMessageRow}>
        <View style={[styles.messageBubble, styles.myMessageBubble]}>
          <Text style={[styles.messageText, styles.myMessageText]}>{message.content}</Text>
          <Text style={[styles.timeText, styles.myTimeText]}>{timeString}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherMessageRow}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {isAdmin ? (
            <MaterialIcons name="support-agent" size={18} color="#FFF" />
          ) : (
            <Text style={styles.avatarText}>
              {displaySenderName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.messageBubble, styles.otherMessageBubble]}>
        <Text style={styles.senderName}>{displaySenderName}</Text>
        <Text style={[styles.messageText, styles.otherMessageText]}>{message.content}</Text>
        <Text style={[styles.timeText, styles.otherTimeText]}>{timeString}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  myMessageRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8, paddingHorizontal: 4 },
  otherMessageRow: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 8, paddingHorizontal: 4 },
  avatarContainer: { marginRight: 8, alignSelf: "flex-end" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: { backgroundColor: "#0084FF", borderBottomRightRadius: 4 },
  otherMessageBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4 },
  senderName: { fontSize: 12, fontWeight: "600", color: Colors.primary, marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: "#FFFFFF" },
  otherMessageText: { color: "#050505" },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  myTimeText: { color: "rgba(255, 255, 255, 0.7)" },
  otherTimeText: { color: "#65676B" },
});