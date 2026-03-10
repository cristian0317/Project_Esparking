import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

import { Image } from 'react-native';

export default function TabLayout() {
  const headerBackgroundColor = '#2c3e50'; // Dark Slate Blue
  const activeTabColor = '#1abc9c'; // Turquoise
  const inactiveTabColor = '#bdc3c7'; // Silver

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        tabBarStyle: {
          backgroundColor: headerBackgroundColor,
        },
        headerStyle: {
          backgroundColor: headerBackgroundColor,
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Image
            source={require('../../assets/images/iconoesparking.png')}
            style={{ width: 35, height: 35, marginLeft: 15, borderRadius: 5 }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'search' : 'search-outline'}
              color={focused ? activeTabColor : inactiveTabColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'map' : 'map-outline'}
              color={focused ? activeTabColor : inactiveTabColor}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="help"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'help-circle' : 'help-circle-outline'}
              color={focused ? activeTabColor : inactiveTabColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}
