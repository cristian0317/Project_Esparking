import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth';

function RootLayoutNav() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadAuthData = useAuthStore((state) => state.loadAuthData);

  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);


  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <Stack initialRouteName="(auth)">
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
