import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const TaskForm = ({ onSubmit, initialData, onCancel, isEditing = false }) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 3600000),
      location: '',
      attachments: [],
    }
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' или 'time'

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название задачи');
      return;
    }

    onSubmit(formData);
  };

  const onDateChange = (event, selectedDate) => {
    // Для Android закрываем пикер после выбора
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  const showDatepicker = () => {
    setPickerMode('date');
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setPickerMode('time');
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Название задачи */}
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            marginBottom: 8, 
            fontWeight: '600' 
          }}>
            Название задачи *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              color: colors.text,
              marginBottom: 20,
              fontSize: 16,
            }}
            placeholder="Введите название задачи"
            placeholderTextColor={colors.subtitle}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          {/* Описание задачи */}
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            marginBottom: 8, 
            fontWeight: '600' 
          }}>
            Описание
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              color: colors.text,
              marginBottom: 20,
              minHeight: 100,
              textAlignVertical: 'top',
              fontSize: 16,
            }}
            placeholder="Введите описание задачи"
            placeholderTextColor={colors.subtitle}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          {/* Дата и время выполнения */}
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            marginBottom: 8, 
            fontWeight: '600' 
          }}>
            Дата и время выполнения
          </Text>

          {/* Дата */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={showDatepicker}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {formatDate(formData.dueDate)}
              </Text>
            </View>
            <Text style={{ color: colors.subtitle, fontSize: 14 }}>Изменить</Text>
          </TouchableOpacity>

          {/* Время */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={showTimepicker}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {formatTime(formData.dueDate)}
              </Text>
            </View>
            <Text style={{ color: colors.subtitle, fontSize: 14 }}>Изменить</Text>
          </TouchableOpacity>

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={formData.dueDate}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Местоположение */}
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            marginBottom: 8, 
            fontWeight: '600' 
          }}>
            Местоположение
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              color: colors.text,
              marginBottom: 30,
              fontSize: 16,
            }}
            placeholder="Введите местоположение"
            placeholderTextColor={colors.subtitle}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />

          {/* Кнопки */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.border,
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onCancel}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                Отмена
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleSubmit}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                {isEditing ? 'Обновить' : 'Создать'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TaskForm;