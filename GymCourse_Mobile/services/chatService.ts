import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { ChatMessage } from '../types/chat';

const BASE_URL = 'http://192.168.1.2:5086'; 
// đổi thành IP máy chạy backend của bạn

class ChatService {
  private connection: signalR.HubConnection | null = null;

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('userToken');
  }

  async getMessages(): Promise<ChatMessage[]> {
    const res = await api.get('/api/Chat/messages');
    return res.data;
  }

  async connect(
    onReceiveMessage: (message: ChatMessage) => void,
    onConnected?: () => void
  ) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return this.connection;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/chatHub?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      onReceiveMessage(message);
    });

    this.connection.on('UserConnected', () => {
      onConnected?.();
    });

    await this.connection.start();
    return this.connection;
  }

  async sendMessage(content: string) {
    if (!this.connection) {
      throw new Error('Chưa kết nối chat');
    }

    await this.connection.invoke('SendMessage', content);
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  getConnectionState() {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }
}

export default new ChatService();