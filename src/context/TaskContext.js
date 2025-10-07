import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const TaskContext = createContext();

// Настройка уведомлений для standalone приложения
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Универсальная система напоминаний
class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.scheduledNotifications = new Map();
    this.setupAppStateListener();
    this.setupNotificationListeners();
    
    // Bind методов
    this.scheduleLocalNotification = this.scheduleLocalNotification.bind(this);
    this.showLocalAlert = this.showLocalAlert.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  setupNotificationListeners() {
    // Обработка нажатия на уведомление
    Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data;
        console.log('Пользователь нажал на уведомление:', data);
      } catch (error) {
        console.log('Ошибка обработки уведомления:', error);
      }
    });

    // Уведомление получено когда приложение активно
    Notifications.addNotificationReceivedListener((notification) => {
      try {
        const data = notification.request.content.data;
        console.log('Уведомление получено (приложение активно):', data);
      } catch (error) {
        console.log('Ошибка обработки полученного уведомления:', error);
      }
    });
  }

  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      this.checkPendingNotifications();
    }
  }

  async scheduleNotification(task) {
    try {
      // Запрашиваем разрешения если нужно
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      let notificationTime = new Date(task.dueDate);
      notificationTime.setMinutes(notificationTime.getMinutes() - 30);

      const now = new Date();
      
      // Для тестирования - если время меньше текущего, добавляем 1 минуту
      if (notificationTime <= now) {
        console.log('Время уведомления уже прошло, устанавливаем тестовое уведомление через 1 минуту');
        notificationTime = new Date(now.getTime() + 60000); // +1 минута
      }

      // Отменяем старое уведомление если есть
      await this.cancelScheduledNotification(task.id);

      // Создаем новое уведомление
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: task.id,
        content: {
          title: '⏰ Напоминание о задаче',
          body: `Задача "${task.title}" начнется через 30 минут`,
          data: { 
            taskId: task.id,
            taskTitle: task.title,
            type: 'task_reminder'
          },
          sound: true,
          priority: 'high',
        },
        trigger: {
          date: notificationTime,
        },
      });

      this.scheduledNotifications.set(task.id, notificationId);
      console.log('✅ Уведомление запланировано:', notificationTime.toLocaleString());

      // Дублируем локальным напоминанием
      this.scheduleLocalNotification(task);

    } catch (error) {
      console.log('❌ Ошибка планирования уведомления:', error);
      // Используем локальное напоминание как fallback
      this.scheduleLocalNotification(task);
    }
  }

  scheduleLocalNotification(task) {
    const notificationTime = new Date(task.dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);
    
    const now = new Date();
    const timeUntilNotification = notificationTime - now;
    
    if (timeUntilNotification > 0) {
      const timeoutId = setTimeout(() => {
        this.showLocalAlert(task);
        this.notifications.delete(task.id);
      }, timeUntilNotification);
      
      this.notifications.set(task.id, timeoutId);
      console.log('📅 Локальное напоминание установлено:', notificationTime.toLocaleString());
    }
  }

  async cancelScheduledNotification(taskId) {
    try {
      // Отменяем push-уведомление
      await Notifications.cancelScheduledNotificationAsync(taskId);
      this.scheduledNotifications.delete(taskId);
    } catch (error) {
      console.log('Ошибка отмены push-уведомления:', error);
    }

    // Отменяем локальное напоминание
    const timeoutId = this.notifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.notifications.delete(taskId);
    }
  }

  showLocalAlert(task) {
    const message = `⏰ Напоминание: Задача "${task.title}" начнется через 30 минут`;
    
    Alert.alert(
      '⏰ Напоминание о задаче',
      message,
      [{ text: 'OK', style: 'default' }]
    );
  }

  async testNotification() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Ошибка', 'Разрешение на уведомления не предоставлено');
          return false;
        }
      }

      // Тестовое уведомление через 10 секунд
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Тест уведомлений',
          body: 'Push-уведомления работают корректно!',
          data: { test: true },
          sound: true,
        },
        trigger: { seconds: 10 },
      });

      Alert.alert('Тест', 'Тестовое уведомление придет через 10 секунд');
      return true;
    } catch (error) {
      console.log('Ошибка тестового уведомления:', error);
      Alert.alert('Ошибка', 'Не удалось отправить тестовое уведомление');
      return false;
    }
  }

  checkPendingNotifications() {
    console.log('🔍 Активных напоминаний:', this.notifications.size);
    console.log('🔍 Запланированных push-уведомлений:', this.scheduledNotifications.size);
  }

  clearAll() {
    // Очищаем локальные напоминания
    this.notifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.notifications.clear();

    // Очищаем push-уведомления
    this.scheduledNotifications.clear();
  }
}

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
  const appStateRef = useRef(AppState.currentState);
  const notificationManagerRef = useRef(null);

  useEffect(() => {
    // Инициализируем notificationManager один раз
    notificationManagerRef.current = new NotificationManager();
    
    loadData();
    setupNotifications();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (notificationManagerRef.current) {
        notificationManagerRef.current.clearAll();
      }
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // Приложение стало активным - проверяем уведомления
      if (notificationManagerRef.current) {
        notificationManagerRef.current.checkPendingNotifications();
      }
    }
    appStateRef.current = nextAppState;
  };

  const setupNotifications = async () => {
    try {
      // Запрашиваем разрешения при запуске
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      console.log('Ошибка настройки уведомлений:', error);
    }
  };

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
        
        // Перезапускаем напоминания для загруженных задач
        tasksWithDates.forEach(task => {
          if (new Date(task.dueDate) > new Date() && notificationManagerRef.current) {
            notificationManagerRef.current.scheduleNotification(task);
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

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  };

  const saveHistory = async (history) => {
    try {
      await AsyncStorage.setItem('history', JSON.stringify(history));
    } catch (error) {
      console.log('Error saving history:', error);
    }
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
    
    await saveTasks(updatedTasks);
    await saveHistory(updatedHistory);

    // Устанавливаем напоминание
    if (notificationManagerRef.current) {
      notificationManagerRef.current.scheduleNotification(newTask);
    }

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
    
    await saveTasks(updatedTasks);
    await saveHistory(updatedHistory);

    // Обновляем напоминание
    if (notificationManagerRef.current) {
      notificationManagerRef.current.cancelScheduledNotification(taskId);
      notificationManagerRef.current.scheduleNotification(updatedTask);
    }

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
    
    await saveTasks(updatedTasks);
    await saveHistory(updatedHistory);

    // Отменяем напоминание
    if (notificationManagerRef.current) {
      notificationManagerRef.current.cancelScheduledNotification(taskId);
    }
  };

  const testNotification = () => {
    if (notificationManagerRef.current) {
      notificationManagerRef.current.testNotification();
    } else {
      Alert.alert('Ошибка', 'Менеджер уведомлений не инициализирован');
    }
  };

  const clearAllNotifications = () => {
    if (notificationManagerRef.current) {
      notificationManagerRef.current.clearAll();
      Alert.alert('Успех', 'Все напоминания очищены');
    }
  };

  const value = { 
    tasks: state.tasks,
    history: state.history,
    addTask,
    updateTask,
    deleteTask,
    testNotification,
    clearAllNotifications,
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