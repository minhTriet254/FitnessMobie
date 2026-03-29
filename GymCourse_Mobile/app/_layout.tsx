import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="profile" options={{ headerShown: true, title: 'Thông tin cá nhân' }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}