import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

export default function HomeScreen({ navigation, onHealthModeToggle }) {
  const [location, setLocation] = useState(null);
  const [refuges, setRefuges] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingText, setLoadingText] = useState('Finding your safe location...');
  const [lastTap, setLastTap] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingText('Location permission denied.');
        return;
      }

      // 1. FAST LOAD: Use last known location immediately so map renders quickly
      let lastLoc = await Location.getLastKnownPositionAsync({});
      if (lastLoc) {
        setLocation(lastLoc.coords);
        setLoadingText('Fetching live incidents...');
      }

      // 2. ACCURATE LOAD: Then fetch the highly accurate location
      let currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLoc.coords);

      // 3. FETCH DATA: Load safe refuges and user reports (incidents) simultaneously
      try {
        const [refugesRes, reportsRes] = await Promise.all([
          api.get(`/refuges/nearby?lat=${currentLoc.coords.latitude}&lng=${currentLoc.coords.longitude}`),
          api.get('/reports')
        ]);
        setRefuges(refugesRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error("Failed to load map data", error);
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
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.015, // Zoomed in closer for better navigation UX
              longitudeDelta: 0.015,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            {/* Render Safe Refuges (Green) */}
            {refuges.map((refuge, index) => (
              <Marker
                key={`refuge-${index}`}
                coordinate={{ latitude: refuge.lat, longitude: refuge.lng }}
                title={refuge.name}
                description={refuge.type}
                pinColor="#2ecc71"
              />
            ))}
            
            {/* Render Incidents / Reports (Red) */}
            {reports.map((report, index) => (
              <Marker
                key={`report-${index}`}
                coordinate={{ latitude: report.lat, longitude: report.lng }}
                title={`Incident: ${report.type}`}
                description={report.description}
                pinColor="#e74c3c"
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff7675" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#2d3436', fontWeight: '600' }
});
