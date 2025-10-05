import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskContext = createContext();

// Упрощенная система напоминаний
class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.setupAppStateListener();
  }

  setupAppStateListener() {
    // Исправляем устаревший метод
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      this.checkPendingNotifications();
    }
  }

  scheduleNotification(task) {
    const notificationTime = new Date(task.dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);
    
    const now = new Date();
    const timeUntilNotification = notificationTime - now;
    
    if (timeUntilNotification > 0) {
      const timeoutId = setTimeout(() => {
        this.showNotification(task);
        this.notifications.delete(task.id);
      }, timeUntilNotification);
      
      this.notifications.set(task.id, timeoutId);
      console.log('🔔 Напоминание установлено на:', notificationTime.toLocaleString());
    }
  }

  cancelNotification(taskId) {
    const timeoutId = this.notifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.notifications.delete(taskId);
    }
  }

  showNotification(task) {
    const message = `⏰ Напоминание: Задача "${task.title}" начнется через 30 минут`;
    
    Alert.alert(
      '⏰ Напоминание о задаче',
      message,
      [{ text: 'OK', style: 'default' }]
    );

    // Для веба
    if (Platform.OS === 'web') {
      this.showWebNotification(task);
    }
  }

  showWebNotification(task) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Task Manager', {
        body: `Задача "${task.title}" начнется через 30 минут`
      });
    }
  }

  async requestWebPermission() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
    }
    return 'granted'; // Для мобильных всегда считаем разрешенным
  }

  checkPendingNotifications() {
    console.log('🔍 Активных напоминаний:', this.notifications.size);
  }

  clearAll() {
    this.notifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.notifications.clear();
  }
}

const notificationManager = new NotificationManager();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'ADD_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history]
      };
    case 'SET_HISTORY':
      return {
        ...state,
        history: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  history: [],
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    loadData();
    initializeNotifications();
    
    return () => {
      notificationManager.clearAll();
    };
  }, []);

  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      const savedHistory = await AsyncStorage.getItem('history');

      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const tasksWithDates = tasks.map(task => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
        }));
        dispatch({ type: 'SET_TASKS', payload: tasksWithDates });
        
        // Перезапускаем напоминания
        tasksWithDates.forEach(task => {
          if (new Date(task.dueDate) > new Date()) {
            notificationManager.scheduleNotification(task);
          }
        });
      }

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const historyWithDates = history.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        dispatch({ type: 'SET_HISTORY', payload: historyWithDates });
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const initializeNotifications = async () => {
    await notificationManager.requestWebPermission();
  };

  const addTask = async (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
      attachments: taskData.attachments || [],
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    const historyEntry = {
      id: Date.now().toString(),
      action: 'CREATE',
      taskId: newTask.id,
      taskTitle: newTask.title,
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_HISTORY', payload: historyEntry });

    const updatedTasks = [...state.tasks, newTask];
    const updatedHistory = [historyEntry, ...state.history];
    
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));

    notificationManager.scheduleNotification(newTask);

    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const taskToUpdate = state.tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, ...updates };
    
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    
    const historyEntry = {
      id: Date.now().toString(),
      action: 'UPDATE',
      taskId: taskId,
      taskTitle: updatedTask.title,
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_HISTORY', payload: historyEntry });

    const updatedTasks = state.tasks.map(t => t.id === taskId ? updatedTask : t);
    const updatedHistory = [historyEntry, ...state.history];
    
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));

    notificationManager.cancelNotification(taskId);
    notificationManager.scheduleNotification(updatedTask);

    return updatedTask;
  };

  const deleteTask = async (taskId) => {
    const taskToDelete = state.tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    dispatch({ type: 'DELETE_TASK', payload: taskId });
    
    const historyEntry = {
      id: Date.now().toString(),
      action: 'DELETE',
      taskId: taskId,
      taskTitle: taskToDelete.title,
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_HISTORY', payload: historyEntry });

    const updatedTasks = state.tasks.filter(t => t.id !== taskId);
    const updatedHistory = [historyEntry, ...state.history];
    
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));

    notificationManager.cancelNotification(taskId);
  };

  const testNotification = () => {
    const testTask = {
      id: 'test-' + Date.now(),
      title: 'Тестовая задача',
      dueDate: new Date(Date.now() + 30000), // Через 30 секунд
    };
    
    notificationManager.scheduleNotification(testTask);
    Alert.alert('Тест', 'Тестовое напоминание установлено на 30 секунд');
  };

  const value = {
    tasks: state.tasks,
    history: state.history,
    addTask,
    updateTask,
    deleteTask,
    testNotification,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};