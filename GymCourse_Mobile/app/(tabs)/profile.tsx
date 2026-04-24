import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/Colors';
import api from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateBodyMetrics = async () => {
    if (!height || !weight) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ chiều cao và cân nặng');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum)) {
      Alert.alert('Lỗi', 'Chiều cao và cân nặng phải là số');
      return;
    }

    if (heightNum <= 0 || heightNum > 300) {
      Alert.alert('Lỗi', 'Chiều cao không hợp lệ (1-300 cm)');
      return;
    }

    if (weightNum <= 0 || weightNum > 500) {
      Alert.alert('Lỗi', 'Cân nặng không hợp lệ (1-500 kg)');
      return;
    }

    setLoading(true);
    try {
      
      const heightInMeters = heightNum / 100;
      
      const response = await api.put('/Account/body-metrics', {
        height: heightInMeters,
        weight: weightNum,
      });

      if (response.status === 200) {
        // Cập nhật user trong context
        if (user && setUser) {
          setUser({
            ...user,
            height: heightNum,
            weight: weightNum,
          });
        }

        Alert.alert('Thành công', 'Cập nhật số đo thành công!');
        setModalVisible(false);
      }
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      
      if (error.response?.status === 400) {
        Alert.alert('Lỗi', 'Chiều cao phải từ 10cm đến 300cm');
      } else {
        Alert.alert('Lỗi', 'Cập nhật số đo thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openBodyMetricsModal = () => {
    setHeight(user?.height?.toString() || '');
    setWeight(user?.weight?.toString() || '');
    setModalVisible(true);
  };

  const menuItems = [
    {
      id: 2,
      title: 'Đăng ký Premium',
      icon: 'star-outline',
      onPress: () => router.push('/premium/packages'),
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
      onPress: () => router.push('/Chat/premiumChat'),
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
      onPress: openBodyMetricsModal,
    },
    {
      id: 7,
      title: 'Profile của tôi',
      icon: 'settings-outline',
      onPress: () => router.push('/profile'),
    },
  ];

  return (
    <>
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
          

          
          {user?.isPremium && <Text style={styles.premiumBadge}>👑 Premium</Text>}
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

      {/* Modal cập nhật số đo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật số đo</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập chiều cao (vd: 170)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                editable={!loading}
              />

              <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập cân nặng (vd: 65)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.updateButton, loading && styles.disabledButton]}
                onPress={handleUpdateBodyMetrics}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.updateButtonText}>Cập nhật</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  metricsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
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
  premiumBadge: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});