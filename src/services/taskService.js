import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Имитация сервера
const API_BASE_URL = 'http://localhost:3000';

export const taskService = {
  async syncTasks(tasks) {
    const netInfo = await NetInfo.fetch();
    
    if (netInfo.isConnected) {
      try {
        console.log('🔄 Синхронизация задач с сервером...');
        
        // Имитация запроса к серверу
        const success = Math.random() > 0.2; // 80% успешных запросов
        
        if (success) {
          console.log('✅ Задачи успешно синхронизированы');
          await AsyncStorage.setItem('lastSync', new Date().toISOString());
          await AsyncStorage.removeItem('pendingSync');
          return true;
        } else {
          throw new Error('Сервер недоступен');
        }
      } catch (error) {
        console.log('❌ Ошибка синхронизации:', error.message);
        // Сохраняем задачи для последующей синхронизации
        await AsyncStorage.setItem('pendingSync', JSON.stringify({
          tasks: tasks,
          timestamp: new Date().toISOString(),
        }));
        return false;
      }
    } else {
      console.log('📶 Нет интернет-соединения, синхронизация отложена');
      await AsyncStorage.setItem('pendingSync', JSON.stringify({
        tasks: tasks,
        timestamp: new Date().toISOString(),
      }));
      return false;
    }
  },

  async getPendingSync() {
    try {
      const pending = await AsyncStorage.getItem('pendingSync');
      return pending ? JSON.parse(pending) : null;
    } catch (error) {
      console.log('Error getting pending sync:', error);
      return null;
    }
  },

  async clearPendingSync() {
    try {
      await AsyncStorage.removeItem('pendingSync');
    } catch (error) {
      console.log('Error clearing pending sync:', error);
    }
  }
};