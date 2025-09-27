import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import ReportsScreen from '../screens/main/ReportsScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen';
import CreateReportScreen from '../screens/main/CreateReportScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportsList" component={ReportsScreen} />
    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    <Stack.Screen name="CreateReport" component={CreateReportScreen} />
  </Stack.Navigator>
);

const MapStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MapView" component={MapScreen} />
    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileView" component={ProfileScreen} />
    <Stack.Screen name="MyReports" component={MyReportsScreen} />
    <Stack.Screen name="CreateReport" component={CreateReportScreen} />
    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Reports" 
        component={ReportsStack}
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapStack}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;