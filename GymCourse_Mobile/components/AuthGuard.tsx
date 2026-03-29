import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import Colors from '../constants/Colors';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isNewUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const inProfile = segments[0] === 'profile';
    const isTabs = segments[0] === '(tabs)';

    console.log('AuthGuard - isAuthenticated:', isAuthenticated);
    console.log('AuthGuard - isNewUser:', isNewUser);
    console.log('AuthGuard - segments:', segments);

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập -> về login
      console.log('➡️ Redirect to login');
      router.replace('/login');
    } else if (isAuthenticated) {
      // Đã đăng nhập
      if (isNewUser && !inProfile) {
        // User mới -> chuyển đến profile
        console.log('➡️ New user, redirect to profile');
        router.replace('/profile');
      } else if (!isNewUser && !isTabs && !inProfile) {
        // User cũ -> chuyển thẳng đến home
        console.log('➡️ Existing user, redirect to home');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, loading, segments, isNewUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}