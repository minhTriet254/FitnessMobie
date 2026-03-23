import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { loginApi } from '@/api/authApi';
import { saveToken } from '@/utils/storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const data = await loginApi(username, password);
      await saveToken(data.token);

      Alert.alert('Success', 'Login thành công');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data || 'Login failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}