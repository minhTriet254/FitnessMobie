import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/Colors";
import chatService from "../../services/chatService";
import { Conversation } from "../../types/chat";

// Định nghĩa type cho navigation
type RootStackParamList = {
  AdminChatDetail: {
    conversationId: number;
    userName: string;
  };
};

export default function CoachSupportScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    initAdminChat();
  }, []);

  const initAdminChat = async () => {
    try {
      setLoading(true);

      // Kết nối SignalR
      if (!chatService.isConnected()) {
        await chatService.connect({
          onPrivateMessage: () => {
            // Refresh danh sách khi có tin nhắn mới
            loadConversations();
          },
          onConversationUpdated: () => {
            loadConversations();
          },
          onConnected: () => {
            setConnected(true);
          },
        });
      } else {
        setConnected(true);
      }

      await loadConversations();
    } catch (error) {
      console.error("Init admin chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const convs = await chatService.getAllConversations(true);
      setConversations(convs);
    } catch (error) {
      console.error("Load conversations error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleOpenChat = (conversation: Conversation) => {
    // ✅ Sửa cách navigate
    navigation.navigate("AdminChatDetail", {
      conversationId: conversation.id,
      userName: conversation.userName,
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleOpenChat(item)}
    >
      <View style={styles.conversationHeader}>
        <View style={styles.userInfo}>
          <MaterialIcons name="person" size={24} color={Colors.primary} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userId}>
              ID: {item.userId.substring(0, 8)}...
            </Text>
          </View>
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      {item.lastMessage && (
        <View style={styles.lastMessage}>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
          <Text style={styles.lastMessageTime}>
            {chatService.formatMessageTime(item.lastMessage.sentAt)}
          </Text>
        </View>
      )}

      <View style={styles.conversationFooter}>
        <Text style={styles.createdAt}>{formatCreatedAt(item.createdAt)}</Text>
        {!item.adminId && (
          <View style={styles.waitingBadge}>
            <Text style={styles.waitingText}>Chờ hỗ trợ</Text>
          </View>
        )}
        {item.adminId && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Đang hỗ trợ</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatCreatedAt = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return `Hôm nay ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hỗ Trợ Premium</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>
            {connected ? "🟢 Online" : "🔴 Offline"}
          </Text>
          <Text style={styles.conversationCount}>
            {conversations.length} cuộc trò chuyện
          </Text>
        </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  conversationCount: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  userId: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  lastMessage: {
    marginBottom: 12,
  },
  lastMessageText: {
    fontSize: 14,
    color: "#666",
  },
  lastMessageTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createdAt: {
    fontSize: 12,
    color: "#999",
  },
  waitingBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  waitingText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});
