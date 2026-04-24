import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

const Colors = {
  primary: '#4CAF50',
  gray: '#666',
  lightGray: '#f5f5f5',
  white: '#fff',
  border: '#ddd',
};

export default function ProfileScreen() {
  const [gender, setGender] = useState(''); // Thêm state gender
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!gender) { // Thêm validation gender
      Alert.alert('Lỗi', 'Vui lòng chọn giới tính');
      return;
    }

    if (!height || !weight) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
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
    const success = await updateProfile({ 
      gender, // Thêm gender vào request
      height: heightNum, 
      weight: weightNum 
    });
    setLoading(false);

    if (success) {
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!', [
        { text: 'Vào học ngay', onPress: () => router.replace('/(tabs)') }
      ]);
    } else {
      Alert.alert('Lỗi', 'Cập nhật thất bại, vui lòng thử lại');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>GymCourse</Text>
          <Text style={styles.subtitle}>Hoàn tất thông tin</Text>
          
          {/* Thêm phần chọn giới tính */}
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.genderOptionActive
              ]}
              onPress={() => setGender('male')}
              disabled={loading}
            >
              <Text style={[
                styles.genderText,
                gender === 'male' && styles.genderTextActive
              ]}>Nam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.genderOptionActive
              ]}
              onPress={() => setGender('female')}
              disabled={loading}
            >
              <Text style={[
                styles.genderText,
                gender === 'female' && styles.genderTextActive
              ]}>Nữ</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Chiều cao (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập chiều cao (vd: 170)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            editable={!loading}
          />

          <Text style={styles.label}>Cân nặng (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập cân nặng (vd: 65)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Hoàn tất</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray,
    marginBottom: 5,
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Thêm styles cho gender
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: Colors.gray,
    fontWeight: '500',
  },
  genderTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});