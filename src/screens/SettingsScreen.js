import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { theme, toggleTheme, colors } = useTheme();
  const { tasks, history } = useTask();

  const ThemeButton = ({ title, value, description, icon }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme === value ? colors.primary : 'transparent',
      }}
      onPress={() => toggleTheme(value)}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={theme === value ? colors.primary : colors.subtitle} 
        style={{ marginRight: 12 }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: colors.text, 
          fontSize: 16, 
          fontWeight: '600',
          marginBottom: 2 
        }}>
          {title}
        </Text>
        {description && (
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 14 
          }}>
            {description}
          </Text>
        )}
      </View>
      
      {theme === value && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const clearAllData = () => {
    Alert.alert(
      'Очистить все данные',
      'Вы уверены, что хотите удалить все задачи и историю? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['tasks', 'history']);
              Alert.alert('Успех', 'Все данные очищены');
              // Для перезагрузки приложения
              setTimeout(() => {
                Alert.alert('Перезагрузка', 'Пожалуйста, перезагрузите приложение');
              }, 1000);
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось очистить данные');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const data = {
        tasks: tasks,
        history: history,
        exportDate: new Date().toISOString(),
        totalTasks: tasks.length,
        totalHistory: history.length,
      };
      
      Alert.alert(
        'Экспорт данных',
        `Готово! Данные экспортированы.\n\nЗадачи: ${tasks.length}\nДействия: ${history.length}`,
        [{ text: 'OK' }]
      );
      
      console.log('Exported data:', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <View style={{ padding: 16 }}>
        <Text style={{
          color: colors.text,
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 4
        }}>
          Настройки
        </Text>
        <Text style={{
          color: colors.subtitle,
          fontSize: 16
        }}>
          Управление приложением
        </Text>
      </View>

      {/* Раздел темы */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginLeft: 16,
          marginBottom: 8
        }}>
          Внешний вид
        </Text>
        
        <ThemeButton
          title="Светлая тема"
          value="light"
          description="Использовать светлую тему"
          icon="sunny-outline"
        />
        
        <ThemeButton
          title="Темная тема"
          value="dark"
          description="Использовать темную тему"
          icon="moon-outline"
        />
        
        <ThemeButton
          title="Системная тема"
          value="system"
          description="Следовать настройкам системы"
          icon="phone-portrait-outline"
        />
      </View>

      {/* Раздел данных */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginLeft: 16,
          marginBottom: 8
        }}>
          Управление данными
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            marginVertical: 6,
            marginHorizontal: 16,
            borderRadius: 12,
          }}
          onPress={exportData}
        >
          <Ionicons 
            name="download-outline" 
            size={24} 
            color={colors.primary} 
            style={{ marginRight: 12 }}
          />
          
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 2 
            }}>
              Экспорт данных
            </Text>
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 14 
            }}>
              Задачи: {tasks.length}, Действия: {history.length}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            marginVertical: 6,
            marginHorizontal: 16,
            borderRadius: 12,
          }}
          onPress={clearAllData}
        >
          <Ionicons 
            name="trash-outline" 
            size={24} 
            color={colors.error} 
            style={{ marginRight: 12 }}
          />
          
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 2 
            }}>
              Очистить все данные
            </Text>
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 14 
            }}>
              Удалить все задачи и историю
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
        </TouchableOpacity>
      </View>

      {/* Раздел информации */}
      <View style={{
        margin: 16,
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
      }}>
        <Text style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 12
        }}>
          О приложении
        </Text>
        
        <Text style={{
          color: colors.subtitle,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 8
        }}>
          📱 Менеджер задач с уведомлениями и геолокацией
        </Text>
        
        <Text style={{
          color: colors.subtitle,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 8
        }}>
          ⏰ Уведомления за 30 минут до выполнения задачи
        </Text>
        
        <Text style={{
          color: colors.subtitle,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 8
        }}>
          📍 Отображение задач на карте по местоположению
        </Text>
        
        <Text style={{
          color: colors.subtitle,
          fontSize: 14,
          lineHeight: 20,
        }}>
          💾 Локальное хранение данных
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <Text style={{
            color: colors.subtitle,
            fontSize: 12,
          }}>
            Версия 1.0.0
          </Text>
          
          <Text style={{
            color: colors.subtitle,
            fontSize: 12,
          }}>
            React Native Expo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;