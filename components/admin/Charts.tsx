import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children }) => {
  const { colors } = useTheme();
  
  return (
    <View style={{ marginBottom: 24, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
        {title}
      </Text>
      <View style={{ 
        backgroundColor: colors.surface, 
        borderRadius: 16, 
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}>
        {children}
      </View>
    </View>
  );
};

interface UserGrowthChartProps {
  data?: number[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data = [120, 145, 180, 220, 280, 350] }) => {
  const { colors, isDarkMode } = useTheme();
  
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: data,
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 80}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

interface ContentDistributionChartProps {
  posts?: number;
  stories?: number;
  queries?: number;
  itineraries?: number;
}

export const ContentDistributionChart: React.FC<ContentDistributionChartProps> = ({ 
  posts = 45, 
  stories = 32, 
  queries = 18, 
  itineraries = 25 
}) => {
  const { colors, isDarkMode } = useTheme();
  
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
  };

  const chartData = {
    labels: ['Posts', 'Stories', 'Queries', 'Itineraries'],
    datasets: [{ data: [posts, stories, queries, itineraries] }],
  };

  return (
    <BarChart
      data={chartData}
      width={screenWidth - 80}
      height={220}
      yAxisLabel=""
      yAxisSuffix=""
      chartConfig={chartConfig}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

interface UserStatusPieChartProps {
  activeUsers?: number;
  totalUsers?: number;
}

export const UserStatusPieChart: React.FC<UserStatusPieChartProps> = ({ 
  activeUsers = 280, 
  totalUsers = 350 
}) => {
  const { colors, isDarkMode } = useTheme();
  
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
  };

  const inactiveUsers = totalUsers - activeUsers;
  
  const data = [
    {
      name: 'Active',
      population: activeUsers,
      color: '#10B981',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Inactive',
      population: inactiveUsers,
      color: '#EF4444',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  return (
    <PieChart
      data={data}
      width={screenWidth - 80}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      center={[10, 50]}
      absolute
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

interface SystemHealthChartProps {
  apiHealth?: number;
  dbHealth?: number;
  emailHealth?: number;
  socketHealth?: number;
}

export const SystemHealthChart: React.FC<SystemHealthChartProps> = ({
  apiHealth = 0.999,
  dbHealth = 0.998,
  emailHealth = 0.985,
  socketHealth = 0.997,
}) => {
  const { colors, isDarkMode } = useTheme();
  
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
  };

  const data = {
    labels: ['API', 'DB', 'Email', 'Socket'],
    data: [apiHealth, dbHealth, emailHealth, socketHealth],
  };

  return (
    <ProgressChart
      data={data}
      width={screenWidth - 80}
      height={220}
      strokeWidth={16}
      radius={32}
      chartConfig={chartConfig}
      hideLegend={false}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};
