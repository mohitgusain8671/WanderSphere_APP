import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { TabBadge } from "../../components/ui/TabBadge";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store";
import { USER_ROLES } from "../../utils/constants";

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const { user, unreadCount, friendRequests } = useAppStore();

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            height: Platform.OS === 'ios' ? 95 : 75,
            paddingBottom: Platform.OS === 'ios' ? 32 : 18,
            paddingTop: 6,
            position: 'absolute',
            left: 15,
            right: 15,
            bottom: Platform.OS === 'ios' ? 35 : 25,
            borderRadius: 20,
            marginHorizontal: 0,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(229, 231, 235, 0.3)',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginTop: -2,
          },
          tabBarIconStyle: {
            marginTop: -2,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "airplane" : "airplane-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          href: null, // Hide from tab bar, can still be accessed programmatically
        }}
      />

      <Tabs.Screen
        name="add-friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={focused ? "people" : "people-outline"} 
                size={focused ? size + 2 : size} 
                color={color} 
              />
              <TabBadge count={friendRequests?.length || 0} color="#10B981" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={focused ? "heart" : "heart-outline"} 
                size={focused ? size + 2 : size} 
                color={color} 
              />
              <TabBadge count={unreadCount || 0} color="#EF4444" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          href: isAdmin ? "/admin" : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />

      {/* Hidden screens - accessible programmatically but not in tab bar */}
      <Tabs.Screen
        name="add-post"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="add-story"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="stories"
        options={{
          href: null,
        }}
      />
      </Tabs>
      
      {/* White bar below tab bar to cover gray area */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 35,
          backgroundColor: '#ffffff',
          zIndex: 999,
        }}
      />
    </View>
  );
}
