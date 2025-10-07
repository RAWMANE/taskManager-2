import * as Location from 'expo-location';

export const geocodingService = {
  // Запрос разрешений на геолокацию
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return { status };
    } catch (error) {
      console.log('Ошибка запроса разрешений:', error);
      return { status: 'denied' };
    }
  },
  // Геокодирование - преобразование адреса в координаты
  async addressToCoordinates(address) {
    try {
      if (!address || address.trim() === '') {
        return null;
      }

      console.log('🔍 Геокодирование адреса:', address);
      
      const geocoded = await Location.geocodeAsync(address);
      
      if (geocoded && geocoded.length > 0) {
        const location = geocoded[0];
        console.log('✅ Найдены координаты:', location);
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } else {
        console.log('❌ Адрес не найден');
        return this.getFallbackCoordinates(address);
      }
    } catch (error) {
      console.log('❌ Ошибка геокодирования:', error);
      return this.getFallbackCoordinates(address);
    }
  },

  // Резервный метод для генерации координат на основе текста
  getFallbackCoordinates(address) {
    // Базовые координаты для разных городов
    const cityCoordinates = {
      'минск': { latitude: 53.9045, longitude: 27.5615 },
      'москва': { latitude: 55.7558, longitude: 37.6173 },
      'киев': { latitude: 50.4501, longitude: 30.5234 },
      'варшава': { latitude: 52.2297, longitude: 21.0122 },
      'берлин': { latitude: 52.5200, longitude: 13.4050 },
      'париж': { latitude: 48.8566, longitude: 2.3522 },
      'лондон': { latitude: 51.5074, longitude: -0.1278 },
      'нью-йорк': { latitude: 40.7128, longitude: -74.0060 },
      'токио': { latitude: 35.6762, longitude: 139.6503 },
      'пекин': { latitude: 39.9042, longitude: 116.4074 },
    };

    const lowerAddress = address.toLowerCase();
    
    // Ищем совпадение с известными городами
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (lowerAddress.includes(city)) {
        console.log('📍 Используем координаты города:', city);
        return coords;
      }
    }

    // Если город не найден, генерируем координаты на основе хеша текста
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Центр Европы как база
    const baseLat = 50.4501;
    const baseLng = 30.5234;
    
    const latOffset = (hash % 100 - 50) / 50; // ±1 градус
    const lngOffset = ((hash * 123) % 100 - 50) / 30; // ±1.6 градуса
    
    return {
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
    };
  },

  // Обратное геокодирование - координаты в адрес
  async coordinatesToAddress(latitude, longitude) {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (address && address.length > 0) {
        const firstAddress = address[0];
        const parts = [];
        
        if (firstAddress.street) parts.push(firstAddress.street);
        if (firstAddress.city) parts.push(firstAddress.city);
        if (firstAddress.region) parts.push(firstAddress.region);
        if (firstAddress.country) parts.push(firstAddress.country);
        
        return parts.join(', ');
      }
    } catch (error) {
      console.log('Ошибка обратного геокодирования:', error);
    }
    
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  },

  // Получение текущего местоположения пользователя
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Разрешение на геолокацию не предоставлено');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.log('Ошибка получения местоположения:', error);
      return null;
    }
  }
};