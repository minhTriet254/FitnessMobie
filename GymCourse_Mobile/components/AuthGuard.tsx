// components/AuthGuard.tsx
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
    
    // CHO PHÉP CÁC ROUTE NÀY KHÔNG BỊ REDIRECT
    const allowedRoutes = ['course', 'lesson', 'premium'];
    const isAllowedRoute = allowedRoutes.includes(segments[0]);

    console.log('AuthGuard - segments:', segments);
    console.log('AuthGuard - isAllowedRoute:', isAllowedRoute);

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated) {
      if (isNewUser && !inProfile) {
        router.replace('/profile');
      }
      else if (!isNewUser && !isTabs && !inProfile && !isAllowedRoute) {
        // CHỈ REDIRECT KHI KHÔNG PHẢI ALLOWED ROUTE
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