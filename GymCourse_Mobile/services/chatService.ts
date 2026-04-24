import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { ChatMessage, Conversation } from '../types/chat';

const BASE_URL = 'http://192.168.1.3:5086';

// Types for event handlers
export interface ChatEventHandlers {
  onGlobalMessage?: (message: ChatMessage) => void;
  onPrivateMessage?: (message: ChatMessage) => void;
  onAdminJoined?: (conversationId: number, adminId: string) => void;
  onMessagesRead?: (conversationId: number) => void;
  onConversationUpdated?: (conversationId: number) => void;
  onConnected?: (message: string) => void;
  onError?: (error: string) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onDisconnected?: () => void;
}

class ChatService {
  private connection: signalR.HubConnection | null = null;
  private currentConversationId: number | null = null;
  private eventHandlers: ChatEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // ========== UTILITY METHODS ==========
  
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user?.id || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async isPremium(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user?.isPremium || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  // ========== GLOBAL CHAT API ==========

  async getGlobalMessages(take: number = 50): Promise<ChatMessage[]> {
    try {
      const res = await api.get(`/api/Chat/messages?take=${take}`);
      return res.data;
    } catch (error) {
      console.error('Error getting global messages:', error);
      throw error;
    }
  }

  async sendGlobalMessage(content: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Chưa kết nối chat');
    }

    if (!content.trim()) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    try {
      await this.connection.invoke('SendGlobalMessage', content.trim());
    } catch (error) {
      console.error('Error sending global message:', error);
      throw error;
    }
  }

  // ========== PRIVATE CHAT API (PREMIUM) ==========

  async getMyConversation(): Promise<Conversation> {
    try {
      const res = await api.get('/api/Chat/conversation');
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Bạn cần nâng cấp Premium để sử dụng chat hỗ trợ');
      }
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async getPrivateMessages(conversationId: number, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    try {
      const res = await api.get(`/api/Chat/messages/private/${conversationId}?skip=${skip}&take=${take}`);
      return res.data;
    } catch (error) {
      console.error('Error getting private messages:', error);
      throw error;
    }
  }

  async sendPrivateMessage(conversationId: number, content: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Chưa kết nối chat');
    }

    if (!content.trim()) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    try {
      await this.connection.invoke('SendPrivateMessage', conversationId, content.trim());
    } catch (error) {
      console.error('Error sending private message:', error);
      throw error;
    }
  }

  async closeConversation(conversationId: number): Promise<void> {
    try {
      await api.post(`/api/Chat/conversation/${conversationId}/close`);
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  }

  setCurrentConversation(conversationId: number | null): void {
    this.currentConversationId = conversationId;
  }

  getCurrentConversation(): number | null {
    return this.currentConversationId;
  }

  // ========== ADMIN API ==========

  async getAllConversations(activeOnly: boolean = true): Promise<Conversation[]> {
    try {
      const res = await api.get(`/api/Chat/admin/conversations?activeOnly=${activeOnly}`);
      return res.data;
    } catch (error) {
      console.error('Error getting all conversations:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: number, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    try {
      const res = await api.get(`/api/Chat/admin/messages/${conversationId}?skip=${skip}&take=${take}`);
      return res.data;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  async adminJoinConversation(conversationId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Chưa kết nối chat');
    }

    try {
      await this.connection.invoke('AdminJoinConversation', conversationId);
    } catch (error) {
      console.error('Error joining conversation:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Chưa kết nối chat');
    }

    try {
      await this.connection.invoke('MarkAsRead', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // ========== SIGNALR CONNECTION ==========

  setEventHandlers(handlers: ChatEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // ========== CLEANUP EVENT HANDLERS ==========

  offGlobalMessage(): void {
    this.eventHandlers.onGlobalMessage = undefined;
    console.log('🔇 Đã gỡ callback Global Chat khỏi UI');
  }

  offPrivateMessage(): void {
    this.eventHandlers.onPrivateMessage = undefined;
    console.log('🔇 Đã gỡ callback Premium Chat khỏi UI');
  }

  async connect(handlers?: ChatEventHandlers): Promise<signalR.HubConnection> {
    if (handlers) {
      this.setEventHandlers(handlers);
    }

    const token = await this.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token - Vui lòng đăng nhập lại');
    }

    // Nếu đã kết nối, trả về connection hiện tại
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    // Nếu đang connecting, đợi
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connecting) {
      return this.connection;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/chatHub?access_token=${token}`)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            this.reconnectAttempts++;
            console.log(`Reconnect attempt ${this.reconnectAttempts}`);
            
            if (this.reconnectAttempts > this.maxReconnectAttempts) {
              return null; // Stop retrying
            }
            
            this.eventHandlers.onReconnecting?.();
            return Math.min(this.reconnectAttempts * 1000, 10000); // Max 10 seconds
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register event handlers
      this.registerEventHandlers();

      await this.connection.start();
      this.reconnectAttempts = 0;
      console.log('✅ SignalR Connected');
      
      return this.connection;
    } catch (error) {
      console.error('❌ SignalR Connection Error:', error);
      this.eventHandlers.onError?.('Không thể kết nối đến máy chủ chat');
      throw error;
    }
  }

  private registerEventHandlers(): void {
    if (!this.connection) return;

    // Global chat
    this.connection.on('ReceiveGlobalMessage', (message: ChatMessage) => {
      console.log('📨 Global message received:', message);
      this.eventHandlers.onGlobalMessage?.(message);
    });

    // Private chat
    this.connection.on('ReceivePrivateMessage', (message: ChatMessage) => {
      console.log('📨 Private message received:', message);
      this.eventHandlers.onPrivateMessage?.(message);
    });

    // Admin joined
    this.connection.on('AdminJoined', (conversationId: number, adminId: string) => {
      console.log('👤 Admin joined conversation:', conversationId);
      this.eventHandlers.onAdminJoined?.(conversationId, adminId);
    });

    // Messages read
    this.connection.on('MessagesRead', (conversationId: number) => {
      console.log('✓ Messages read:', conversationId);
      this.eventHandlers.onMessagesRead?.(conversationId);
    });

    // Conversation updated
    this.connection.on('ConversationUpdated', (conversationId: number) => {
      console.log('🔄 Conversation updated:', conversationId);
      this.eventHandlers.onConversationUpdated?.(conversationId);
    });

    // Connection events
    this.connection.on('UserConnected', (message: string) => {
      console.log('✅', message);
      this.eventHandlers.onConnected?.(message);
    });

    this.connection.on('ChatError', (error: string) => {
      console.error('❌ Chat error:', error);
      this.eventHandlers.onError?.(error);
    });

    // Auto-reconnect events
    this.connection.onreconnecting(() => {
      console.log('🔄 Reconnecting...');
      this.eventHandlers.onReconnecting?.();
    });

    this.connection.onreconnected(() => {
      console.log('✅ Reconnected');
      this.reconnectAttempts = 0;
      this.eventHandlers.onReconnected?.();
    });

    this.connection.onclose(() => {
      console.log('🔌 Connection closed');
      this.eventHandlers.onDisconnected?.();
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('👋 Disconnected from SignalR');
      } catch (error) {
        console.error('Error disconnecting:', error);
      } finally {
        this.connection = null;
        this.currentConversationId = null;
        this.reconnectAttempts = 0;
      }
    }
  }

  async reconnect(): Promise<signalR.HubConnection> {
    await this.disconnect();
    return await this.connect();
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionId(): string | null {
    return this.connection?.connectionId ?? null;
  }

  // ========== MESSAGE UTILITIES ==========

  async isMessageFromCurrentUser(message: ChatMessage): Promise<boolean> {
    const currentUserId = await this.getCurrentUserId();
    return message.senderId === currentUserId;
  }

  formatMessageTime(sentAt: string): string {
    if (!sentAt) return "";

    const iso = sentAt.endsWith("Z") ? sentAt : sentAt + "Z";

    const date = new Date(iso);

    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  groupMessagesByDate(messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.sentAt);
      const dateKey = date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
  }
}

// Export singleton instance
export default new ChatService();