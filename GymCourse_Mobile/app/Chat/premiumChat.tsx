import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MessageBubble from "../../components/MessageBubble"; // Sửa lại đường dẫn nếu cần
import ChatInput from "../../components/ChatInput";         // Sửa lại đường dẫn nếu cần
import Colors from "../../constants/Colors";
import chatService from "../../services/chatService";
import { checkPremiumStatus } from "../../services/premiumService";
import { ChatMessage, Conversation } from "../../types/chat";

export default function PremiumChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [connected, setConnected] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkPremiumAndLoadChat();
    return () => {
      // ✅ CHỈ GỠ EVENT LISTENER, KHÔNG DISCONNECT CHUNG
      // Thêm hàm này vào chatService của bạn nếu chưa có
      if (typeof chatService.offPrivateMessage === 'function') {
        chatService.offPrivateMessage();
      }
    };
  }, []);

  const checkPremiumAndLoadChat = async () => {
    try {
      const premiumStatus = await checkPremiumStatus();
      const isUserPremium = premiumStatus?.isPremium || false;
      setIsPremium(isUserPremium);

      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const myId = parsedUser?.id || parsedUser?.Id || parsedUser?.userId || parsedUser?.UserId || "";
        setCurrentUserId(String(myId));
      }

      if (!isUserPremium) {
        setLoading(false);
        return;
      }

      await initChat();
    } catch (error) {
      console.log("Check premium error:", error);
      setLoading(false);
    }
  };

  const initChat = async () => {
      try {
        setLoading(true);

        const conv = await chatService.getMyConversation();
        setConversation(conv);
        chatService.setCurrentConversation(conv.id);

        const history = await chatService.getPrivateMessages(conv.id);
        setMessages(history);

        // XÓA if/else, LUÔN LUÔN GỌI CONNECT ĐỂ NẠP LẠI CALLBACK
        await chatService.connect({
          onPrivateMessage: (message: ChatMessage) => {
            if (message.conversationId === conv.id) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
              });
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
          },
          onConnected: () => setConnected(true),
          onError: (error: string) => console.log("Chat error:", error),
        });
        
        setConnected(true);

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
      } catch (error) {
        console.log("Init chat error:", error);
      } finally {
        setLoading(false);
      }
  };

  const handleSend = useCallback(async () => {
    if (!content.trim() || sending || !connected || !conversation?.isActive) return;

    try {
      setSending(true);
      await chatService.sendPrivateMessage(conversation.id, content.trim());
      setContent("");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.");
      console.log("Send message error:", error);
    } finally {
      setSending(false);
    }
  }, [content, sending, connected, conversation]);

  const renderItem = useCallback(
      ({ item }: { item: ChatMessage }) => {
        const safeSenderId = String(item.senderId).toLowerCase();
        const safeMyId = String(currentUserId).toLowerCase();
        
        const isMine = safeSenderId === safeMyId;
        const isAdmin = item.senderId === conversation?.adminId;

        return (
          <MessageBubble 
            message={item} 
            isMine={isMine} 
            isAdmin={isAdmin} 
          />
        );
      },
      [currentUserId, conversation?.adminId]
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải chat...</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="workspace-premium" size={64} color={Colors.primary} />
        <Text style={styles.premiumTitle}>Tính năng Premium</Text>
        <Text style={styles.premiumDescription}>
          Chat trực tiếp với HLV chỉ dành cho thành viên Premium. Nâng cấp ngay để được hỗ trợ 1-1!
        </Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push("/premium/packages")}>
          <Text style={styles.upgradeButtonText}>Nâng cấp Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 Chat với HLV</Text>
          <Text style={styles.headerSubtitle}>
            {connected ? "Đã kết nối với huấn luyện viên" : "Đang kết nối..."}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
              <Text style={styles.emptySubtext}>Hãy bắt đầu cuộc trò chuyện!</Text>
            </View>
          }
        />

        <ChatInput 
          content={content}
          setContent={setContent}
          onSend={handleSend}
          sending={sending}
          disabled={!content.trim() || sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F0F2F5" },
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  centerContainer: { flex: 1, backgroundColor: "#F0F2F5", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  headerSubtitle: { marginTop: 4, fontSize: 13, color: "#65676B" },
  listContent: { paddingHorizontal: 8, paddingVertical: 12, paddingBottom: 20, flexGrow: 1 },
  loadingText: { marginTop: 10, fontSize: 15, color: "#65676B" },
  premiumTitle: { fontSize: 24, fontWeight: "700", color: Colors.primary, marginTop: 16, marginBottom: 8 },
  premiumDescription: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24, marginBottom: 24 },
  upgradeButton: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28 },
  upgradeButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#65676B", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#8A8D91" },
});