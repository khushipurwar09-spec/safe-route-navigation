import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

export default function HomeScreen({ navigation, onHealthModeToggle }) {
  const [location, setLocation] = useState(null);
  const [refuges, setRefuges] = useState([]);
  const [lastTap, setLastTap] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      try {
        const res = await api.get(`/refuges/nearby?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`);
        setRefuges(res.data);
      } catch (error) {
        console.error("Failed to load refuges", error);
      }
    })();
  }, []);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      onHealthModeToggle();
    } else {
      setLastTap(now);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.container}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
          >
            {refuges.map((refuge, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: refuge.lat, longitude: refuge.lng }}
                title={refuge.name}
                description={refuge.type}
                pinColor="green"
              />
            ))}
            {/* Example safe route polyline */}
            <Polyline coordinates={[]} strokeColor="#00f" strokeWidth={4} />
          </MapView>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading Map...</Text></View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});
