import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const menuItems = [

    {
      id: 2,
      title: 'Đăng ký Premium',
      icon: 'star-outline',
      onPress: () => Alert.alert('Đăng ký Premium', 'Đăng ký khóa học mới'),
    },
    {
      id: 3,
      title: 'Cộng đồng',
      icon: 'people-outline',
      onPress: () => router.push('/(tabs)/community'),
    },
    {
      id: 4,
      title: 'Huấn luyện viên',
      icon: 'body-outline',
      onPress: () => Alert.alert('Huấn luyện viên', 'Danh sách huấn luyện viên'),
    },
    {
      id: 5,
      title: 'Phân tích',
      icon: 'bar-chart-outline',
      onPress: () => Alert.alert('Phân tích', 'Thống kê tập luyện'),
    },
    {
      id: 6,
      title: 'Số đo',
      icon: 'book-outline',
      onPress: () => Alert.alert('Số đo', 'Lịch sử đo chỉ số cơ thể'),
    },
    {
      id: 7,
      title: 'Profile của tôi',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Profile của tôi', 'Cài đặt thông tin cá nhân'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.userName?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.userName || 'Người dùng'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={Colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: Colors.gray,
  },
});