import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

export default function AdminLayout() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAppStore();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/(admin)/dashboard', icon: 'stats-chart' },
    { name: 'Users', path: '/(admin)/users', icon: 'people' },
    { name: 'Posts', path: '/(admin)/posts', icon: 'images' },
    { name: 'Stories', path: '/(admin)/stories', icon: 'book' },
    { name: 'Queries', path: '/(admin)/queries', icon: 'chatbubbles' },
    { name: 'Quizzes', path: '/(admin)/quizzes', icon: 'help-circle' },
    { name: 'Contests', path: '/(admin)/contests', icon: 'trophy' },
    { name: 'Buddy Management', path: '/(admin)/buddy-management', icon: 'person-circle' },
    { name: 'Buddy Bookings', path: '/(admin)/buddy-bookings-admin', icon: 'calendar' },
    { name: 'Buddy Reports', path: '/(admin)/buddy-reports-admin', icon: 'flag' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path as any);
    setShowMenu(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      {/* Admin Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border || 'rgba(0,0,0,0.1)',
        }}
      >
        {/* Back to App Button */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)' as any)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: colors.text }}>
            Back to App
          </Text>
        </TouchableOpacity>

        {/* Admin Title */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
            Admin Panel
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Text>
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={{
            backgroundColor: '#EF4444',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Ionicons name={showMenu ? 'close' : 'menu'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Overlay */}
      {showMenu && (
        <View
          style={{
            position: 'absolute',
            top: 70,
            right: 20,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 1000,
            minWidth: 200,
          }}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigate(item.path)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: pathname.includes(item.path.split('/').pop() || '')
                  ? isDarkMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)'
                  : 'transparent',
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={pathname.includes(item.path.split('/').pop() || '') ? '#EF4444' : colors.text}
              />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontWeight: pathname.includes(item.path.split('/').pop() || '') ? '600' : '400',
                  color: pathname.includes(item.path.split('/').pop() || '') ? '#EF4444' : colors.text,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="users" />
        <Stack.Screen name="posts" />
        <Stack.Screen name="stories" />
        <Stack.Screen name="queries" />
        <Stack.Screen name="quizzes" />
        <Stack.Screen name="quiz-details" />
        <Stack.Screen name="contests" />
        <Stack.Screen name="contest-details" />
        <Stack.Screen name="buddy-management" />
        <Stack.Screen name="buddy-bookings-admin" />
        <Stack.Screen name="buddy-reports-admin" />
        <Stack.Screen name="buddy-details" />
      </Stack>
    </SafeAreaView>
  );
}
