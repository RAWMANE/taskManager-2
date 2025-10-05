import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const currentTheme = theme === 'system' ? systemColorScheme : theme;

  const themeColors = {
    light: {
      background: '#FFFFFF',
      card: '#F2F2F7',
      text: '#000000',
      subtitle: '#8E8E93',
      primary: '#007AFF',
      border: '#C6C6C8',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
    dark: {
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      subtitle: '#8E8E93',
      primary: '#0A84FF',
      border: '#38383A',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
    }
  };

  const colors = themeColors[currentTheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};