import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [mapError, setMapError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const webViewRef = useRef(null);

  // Получаем задачи с координатами
  useEffect(() => {
    loadTasksCoordinates();
  }, [tasks]);

  const loadTasksCoordinates = async () => {
    setIsLoading(true);
    setMapError(null);
    
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

  // Генерируем HTML с картой OpenStreetMap
  const generateMapHTML = () => {
    const markers = tasksWithCoordinates.map((task, index) => `
      var marker${index} = L.marker([${task.coordinates.latitude}, ${task.coordinates.longitude}])
        .addTo(map)
        .bindPopup('<b>${task.title.replace(/'/g, "\\'")}</b><br/>${(task.description || '').replace(/'/g, "\\'")}<br/><small>Выполнить: ${new Date(task.dueDate).toLocaleString('ru-RU')}</small>');
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Карта задач</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-popup-content { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([53.9045, 27.5615], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(map);
          
          ${markers}
          
          // Автоматически подгоняем карту под все маркеры
          if (${tasksWithCoordinates.length} > 0) {
            var group = new L.featureGroup([${tasksWithCoordinates.map((_, i) => `marker${i}`).join(',')}]);
            map.fitBounds(group.getBounds().pad(0.1));
          }
          
          // Отправляем данные обратно в React Native при клике на маркер
          function onMarkerClick(index) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                index: index
              }));
            }
          }
          
          // Добавляем обработчики кликов
          ${tasksWithCoordinates.map((_, index) => `
            marker${index}.on('click', function() { onMarkerClick(${index}); });
          `).join('\n')}
        </script>
      </body>
      </html>
    `;
  };

  // Обработка сообщений из WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick' && tasksWithCoordinates[data.index]) {
        setSelectedTask(tasksWithCoordinates[data.index]);
      }
    } catch (error) {
      console.log('Ошибка обработки сообщения:', error);
    }
  };

  const refreshLocations = async () => {
    Alert.alert('Обновление', 'Обновляем координаты задач...');
    await loadTasksCoordinates();
  };

  const openInExternalMaps = (task) => {
    const url = Platform.OS === 'ios' 
      ? `http://maps.apple.com/?ll=${task.coordinates.latitude},${task.coordinates.longitude}&q=${encodeURIComponent(task.location)}`
      : `https://www.google.com/maps/search/?api=1&query=${task.coordinates.latitude},${task.coordinates.longitude}`;
    
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
          Загрузка карты...
        </Text>
      </View>
    );
  }

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
        <View style={{ flex: 1 }}>
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
            fontSize: 14 
          }}>
            {tasksWithCoordinates.length} задач на карте • OpenStreetMap
          </Text>
        </View>
        
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 8,
          }}
          onPress={refreshLocations}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {tasksWithCoordinates.length === 0 ? (
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
        </View>
      ) : (
        <>
          {/* WebView с картой */}
          <WebView
            ref={webViewRef}
            style={{ flex: 1 }}
            source={{ html: generateMapHTML() }}
            onMessage={handleWebViewMessage}
            onError={(error) => {
              console.log('WebView ошибка:', error);
              setMapError('Ошибка загрузки карты');
            }}
            onLoadEnd={() => console.log('Карта загружена')}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 16 }}>Загрузка карты...</Text>
              </View>
            )}
          />

          {/* Панель выбранной задачи */}
          {selectedTask && (
            <View style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 8 
              }}>
                {selectedTask.title}
              </Text>
              
              {selectedTask.description && (
                <Text style={{ 
                  color: colors.subtitle, 
                  fontSize: 14, 
                  marginBottom: 8,
                  lineHeight: 20 
                }}>
                  {selectedTask.description}
                </Text>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ 
                  color: colors.subtitle, 
                  fontSize: 12 
                }}>
                  {selectedTask.location}
                </Text>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                  onPress={() => openInExternalMaps(selectedTask)}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                    Открыть в картах
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
                onPress={() => setSelectedTask(null)}
              >
                <Ionicons name="close" size={20} color={colors.subtitle} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Сообщение об ошибке */}
      {mapError && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: colors.error + '20',
          padding: 12,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.error,
        }}>
          <Text style={{ color: colors.error, fontSize: 14 }}>
            ⚠️ {mapError}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;