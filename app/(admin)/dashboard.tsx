import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { 
  ChartWrapper, 
  UserGrowthChart, 
  ContentDistributionChart, 
  UserStatusPieChart,
  SystemHealthChart,
  StatCard,
  ActivityCard,
  PerformanceMetricCard,
} from '../../components/admin';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const {
    dashboardData,
    isAdminDashboardLoading,
    getDashboardAnalytics,
  } = useAppStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await getDashboardAnalytics();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (isAdminDashboardLoading && !dashboardData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, marginTop: 15 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Stats Grid */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16, paddingHorizontal: 24 }}>
          Overview
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24 }}>
          <StatCard
            title="Total Users"
            value={dashboardData?.overview?.totalUsers || 0}
            icon="people"
            color="#3B82F6"
            trend="+12%"
          />
          <StatCard
            title="Total Posts"
            value={dashboardData?.overview?.totalPosts || 0}
            icon="images"
            color="#10B981"
            trend="+8%"
          />
          <StatCard
            title="Total Stories"
            value={dashboardData?.overview?.totalStories || 0}
            icon="book"
            color="#F59E0B"
            trend="+15%"
          />
          <StatCard
            title="Pending Queries"
            value={dashboardData?.overview?.pendingQueries || 0}
            icon="help-circle"
            color="#EF4444"
            trend="-5%"
          />
          <StatCard
            title="Active Users"
            value={dashboardData?.overview?.activeUsers || 0}
            icon="pulse"
            color="#8B5CF6"
            trend="+20%"
          />
          <StatCard
            title="Itineraries"
            value={dashboardData?.overview?.totalItineraries || 0}
            icon="map"
            color="#06B6D4"
            trend="+25%"
          />
        </View>
      </View>

      {/* User Growth Chart */}
      <ChartWrapper title="User Growth Trend">
        <UserGrowthChart data={dashboardData?.userGrowth} />
      </ChartWrapper>

      {/* Content Distribution Chart */}
      <ChartWrapper title="Content Distribution">
        <ContentDistributionChart
          posts={dashboardData?.overview?.totalPosts}
          stories={dashboardData?.overview?.totalStories}
          queries={dashboardData?.overview?.pendingQueries}
          itineraries={dashboardData?.overview?.totalItineraries}
        />
      </ChartWrapper>

      {/* User Status Pie Chart */}
      <ChartWrapper title="User Activity Status">
        <UserStatusPieChart
          activeUsers={dashboardData?.overview?.activeUsers}
          totalUsers={dashboardData?.overview?.totalUsers}
        />
      </ChartWrapper>

      {/* System Health Chart */}
      <ChartWrapper title="System Health Monitoring">
        <SystemHealthChart />
      </ChartWrapper>

      {/* Performance Metrics */}
      <View style={{ marginBottom: 24, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
          Performance Metrics
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PerformanceMetricCard
            title="Avg Response Time"
            value="245ms"
            icon="speedometer"
            color="#3B82F6"
            trend="-12ms"
          />
          <PerformanceMetricCard
            title="Error Rate"
            value="0.02%"
            icon="warning"
            color="#10B981"
            trend="-0.01%"
          />
          <PerformanceMetricCard
            title="Active Sessions"
            value="1,247"
            icon="people"
            color="#F59E0B"
            trend="+156"
          />
          <PerformanceMetricCard
            title="Memory Usage"
            value="68%"
            icon="hardware-chip"
            color="#8B5CF6"
            trend="+2%"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={{ marginBottom: 24, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
          Recent Activity
        </Text>
        
        <View style={{ gap: 12 }}>
          <ActivityCard
            action="New user registered"
            user="John Doe"
            time="2 minutes ago"
            icon="person-add"
            color="#10B981"
          />
          <ActivityCard
            action="Post reported"
            user="Jane Smith"
            time="5 minutes ago"
            icon="flag"
            color="#EF4444"
          />
          <ActivityCard
            action="Query submitted"
            user="Mike Johnson"
            time="10 minutes ago"
            icon="help-circle"
            color="#F59E0B"
          />
          <ActivityCard
            action="Itinerary created"
            user="Sarah Wilson"
            time="15 minutes ago"
            icon="map"
            color="#8B5CF6"
          />
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
