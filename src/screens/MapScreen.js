import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import { geocodingService } from '../services/geocodingService';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const { colors } = useTheme();
  const { tasks } = useTask();
  const [tasksWithCoordinates, setTasksWithCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Получаем координаты для всех задач с местоположением
  useEffect(() => {
    loadTasksCoordinates();
    getUserLocation();
  }, [tasks]);

  const getUserLocation = async () => {
    const location = await geocodingService.getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const loadTasksCoordinates = async () => {
    setIsLoading(true);
    
    const tasksWithLocation = tasks.filter(task => 
      task.location && task.location.trim() !== ''
    );

    const tasksWithCoords = [];

    for (const task of tasksWithLocation) {
      try {
        const coordinates = await geocodingService.addressToCoordinates(task.location);
        if (coordinates) {
          tasksWithCoords.push({
            ...task,
            coordinates
          });
        }
      } catch (error) {
        console.log(`Ошибка получения координат для задачи "${task.title}":`, error);
      }
    }

    setTasksWithCoordinates(tasksWithCoords);
    setIsLoading(false);
  };

  const refreshLocations = async () => {
    Alert.alert('Обновление', 'Обновляем координаты задач...');
    await loadTasksCoordinates();
  };

  const getMapRegion = () => {
    if (tasksWithCoordinates.length === 0) {
      // Центр Европы по умолчанию
      return {
        latitude: 53.9045,
        longitude: 27.5615,
        latitudeDelta: 15,
        longitudeDelta: 15,
      };
    }

    // Вычисляем регион чтобы охватить все маркеры
    const latitudes = tasksWithCoordinates.map(task => task.coordinates.latitude);
    const longitudes = tasksWithCoordinates.map(task => task.coordinates.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latitudeDelta = (maxLat - minLat) * 1.5;
    const longitudeDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latitudeDelta, 1),
      longitudeDelta: Math.max(longitudeDelta, 1),
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Заголовок и кнопки */}
      <View style={{
        padding: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View>
          <Text style={{ 
            color: colors.text, 
            fontSize: 28, 
            fontWeight: 'bold',
            marginBottom: 4 
          }}>
            Карта задач
          </Text>
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 16 
          }}>
            {isLoading ? 'Загрузка...' : `${tasksWithCoordinates.length} задач на карте`}
          </Text>
        </View>
        
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={refreshLocations}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Ionicons name="map-outline" size={64} color={colors.subtitle} />
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 16, 
            marginTop: 16 
          }}>
            Загрузка карты...
          </Text>
        </View>
      ) : tasksWithCoordinates.length > 0 ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Маркер пользователя */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Ваше местоположение"
              pinColor={colors.primary}
            />
          )}

          {/* Маркеры задач */}
          {tasksWithCoordinates.map((task) => (
            <Marker
              key={task.id}
              coordinate={task.coordinates}
              title={task.title}
              description={task.description || `Выполнить: ${new Date(task.dueDate).toLocaleString('ru-RU')}`}
            />
          ))}
        </MapView>
      ) : (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20 
        }}>
          <Ionicons name="map-outline" size={80} color={colors.subtitle} />
          <Text style={{ 
            color: colors.text, 
            fontSize: 22, 
            fontWeight: 'bold',
            marginTop: 16,
            textAlign: 'center'
          }}>
            Нет задач с местоположением
          </Text>
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 16, 
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 22
          }}>
            Добавьте местоположение к задаче,{'\n'}
            чтобы увидеть ее на карте
          </Text>
          
          <Text style={{ 
            color: colors.subtitle, 
            fontSize: 14, 
            marginTop: 20,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Поддерживаются: названия городов,{'\n'}
            адреса, достопримечательности
          </Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;