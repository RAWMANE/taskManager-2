# taskManager-2 📱

![Java Script](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

Менеджер задач на React Native с уведомлениями, геолокацией и историей действий.

 

## 🚀 Возможности

### ✅ Основной функционал
- **Создание задач** с названием, описанием, датой выполнения и местоположением
- **Уведомления** за 30 минут до выполнения задачи
- **Геолокация** - отображение задач на карте по местоположению
- **История действий** - полный журнал всех изменений задач
- **Темная/светлая тема** - автоматическое переключение

### 🎯 Особенности
- 📍 **Умное геокодирование** - автоматическое определение координат по адресу
- ⏰ **Локальные напоминания** - работают на всех платформах
- 💾 **Офлайн-хранение** - данные сохраняются локально
- 🎨 **Адаптивный UI** - красивый интерфейс для всех устройств

## 🛠 Технологии

- **Frontend**: React Native, Expo
- **Навигация**: React Navigation
- **Карты**: React Native Maps
- **Уведомления**: Expo Notifications
- **Геолокация**: Expo Location
- **Хранение**: AsyncStorage
- **Иконки**: Ionicons

## 📦 Установка и запуск

### Предварительные требования
- Node.js 16+
- npm или yarn
- Expo CLI

### Установка
```bash
# Клонирование репозитория
git clone https://github.com/yourusername/task-manager.git
cd task-manager

# Установка зависимостей
npm install

# Запуск в режиме разработки
npx expo start
