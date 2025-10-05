import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider } from './src/context/ThemeContext';
import { TaskProvider } from './src/context/TaskContext';
import Ionicons from '@expo/vector-icons/Ionicons';

// Импортируем все экраны
import TaskListScreen from './src/screens/TaskListScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Tasks') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Map') {
                  iconName = focused ? 'map' : 'map-outline';
                } else if (route.name === 'History') {
                  iconName = focused ? 'time' : 'time-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
            })}
          >
            <Tab.Screen 
              name="Tasks" 
              component={TaskListScreen}
              options={{ title: 'Задачи' }}
            />
            <Tab.Screen 
              name="Map" 
              component={MapScreen}
              options={{ title: 'Карта' }}
            />
            <Tab.Screen 
              name="History" 
              component={HistoryScreen}
              options={{ title: 'История' }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Настройки' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </ThemeProvider>
  );
}