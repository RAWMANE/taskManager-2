import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';
import Ionicons from '@expo/vector-icons/Ionicons';

const TaskListScreen = () => {
  const { colors } = useTheme();
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setShowModal(false);
      setEditingTask(null);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить задачу');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = (task) => {
    Alert.alert(
      'Удалить задачу',
      `Вы уверены, что хотите удалить задачу "${task.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTaskItem = ({ item }) => (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 6 
          }}>
            {item.title}
          </Text>
          
          {item.description ? (
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 14, 
              marginBottom: 8,
              lineHeight: 20 
            }}>
              {item.description}
            </Text>
          ) : null}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="time-outline" size={16} color={colors.subtitle} />
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 14, 
              marginLeft: 6 
            }}>
              {formatDate(item.dueDate)}
            </Text>
          </View>
          
          {item.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={16} color={colors.subtitle} />
              <Text style={{ 
                color: colors.subtitle, 
                fontSize: 14, 
                marginLeft: 6 
              }}>
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 12,
        }}
      >
        <TouchableOpacity
          style={{ 
            marginRight: 16,
            flexDirection: 'row',
            alignItems: 'center'
          }}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: 6, fontSize: 14 }}>Изменить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={{ color: colors.error, marginLeft: 6, fontSize: 14 }}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Заголовок */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ 
          color: colors.text, 
          fontSize: 28, 
          fontWeight: 'bold',
          marginBottom: 4 
        }}>
          Задачи
        </Text>
        <Text style={{ 
          color: colors.subtitle, 
          fontSize: 16 
        }}>
          {tasks.length} {tasks.length === 1 ? 'задача' : tasks.length < 5 ? 'задачи' : 'задач'}
        </Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ 
            alignItems: 'center', 
            marginTop: 80,
            padding: 20 
          }}>
            <Ionicons name="list-outline" size={64} color={colors.subtitle} />
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 18, 
              marginTop: 16,
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Нет задач
            </Text>
            <Text style={{ 
              color: colors.subtitle, 
              fontSize: 14, 
              marginTop: 8,
              textAlign: 'center'
            }}>
              Создайте первую задачу!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Кнопка добавления */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 40,
          backgroundColor: colors.primary,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={handleAddTask}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Модальное окно формы */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Заголовок модального окна */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 20, 
              fontWeight: 'bold' 
            }}>
              {editingTask ? 'Редактировать задачу' : 'Новая задача'}
            </Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Форма */}
          <TaskForm
            initialData={editingTask}
            isEditing={!!editingTask}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </View>
      </Modal>
    </View>
  );
};

export default TaskListScreen;