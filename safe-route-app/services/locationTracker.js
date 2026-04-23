import * as Location from 'expo-location';
import { getSocket } from './websocket';

export const startLocationTracking = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission to access location was denied');
    return;
  }

  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('location-update', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: location.timestamp
        });
      }
    }
  );
};
