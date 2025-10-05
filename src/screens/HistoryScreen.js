import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const HistoryScreen = () => {
  const { colors } = useTheme();
  const { history } = useTask();

  const getActionDetails = (action) => {
    switch (action) {
      case 'CREATE':
        return { 
          text: 'создана', 
          color: colors.success, 
          icon: 'add-circle-outline',
          bgColor: colors.success + '20'
        };
      case 'UPDATE':
        return { 
          text: 'обновлена', 
          color: colors.primary, 
          icon: 'create-outline',
          bgColor: colors.primary + '20'
        };
      case 'DELETE':
        return { 
          text: 'удалена', 
          color: colors.error, 
          icon: 'trash-outline',
          bgColor: colors.error + '20'
        };
      default:
        return { 
          text: action, 
          color: colors.subtitle, 
          icon: 'help-outline',
          bgColor: colors.subtitle + '20'
        };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} дня назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const renderHistoryItem = ({ item, index }) => {
    const actionDetails = getActionDetails(item.action);
    
    return (
      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          marginVertical: 6,
          marginHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'flex-start',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={{
            backgroundColor: actionDetails.bgColor,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={actionDetails.icon} size={22} color={actionDetails.color} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            lineHeight: 22,
            marginBottom: 4 
          }}>
            Задача <Text style={{ fontWeight: 'bold' }}>"{item.taskTitle}"</Text> {actionDetails.text}
          </Text>
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 14, 
            lineHeight: 18 
          }}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Заголовок */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ 
          color: colors.text, 
          fontSize: 28, 
          fontWeight: 'bold',
          marginBottom: 4 
        }}>
          История
        </Text>
        <Text style={{ 
          color: colors.subtitle, 
          fontSize: 16 
        }}>
          {history.length} {history.length === 1 ? 'действие' : history.length < 5 ? 'действия' : 'действий'}
        </Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ 
            alignItems: 'center', 
            marginTop: 80,
            padding: 20 
          }}>
            <Ionicons name="time-outline" size={64} color={colors.subtitle} />
            <Text style={{ 
              color: colors.text, 
              fontSize: 22, 
              fontWeight: 'bold',
              marginTop: 16,
              textAlign: 'center'
            }}>
              История пуста
            </Text>
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 16, 
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Здесь будут отображаться{'\n'}
              все изменения ваших задач
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default HistoryScreen;