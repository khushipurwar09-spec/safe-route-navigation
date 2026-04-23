import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, onHealthModeToggle }) {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [refuges, setRefuges] = useState([]);
  const [reports, setReports] = useState([]);
  const [destination, setDestination] = useState('');
  const [loadingText, setLoadingText] = useState('Initializing Safe Zone...');
  const [lastTap, setLastTap] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingText('Location permission denied.');
        return;
      }

      let lastLoc = await Location.getLastKnownPositionAsync({});
      if (lastLoc) {
        setLocation(lastLoc.coords);
      }

      let currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLoc.coords);

      try {
        const [refugesRes, reportsRes] = await Promise.all([
          api.get(`/refuges/nearby?lat=${currentLoc.coords.latitude}&lng=${currentLoc.coords.longitude}`),
          api.get('/reports')
        ]);
        setRefuges(refugesRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error("Data fetch error", error);
      }
    })();
  }, []);

  const recenter = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) onHealthModeToggle();
    else setLastTap(now);
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.container}>
        {location ? (
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={darkMapStyle}
            >
              {/* Overlay Safe/Moderate/Danger Zones based on reports */}
              {reports.map((report, index) => {
                const isDanger = report.type.toLowerCase().includes('danger') || report.type.toLowerCase().includes('sos');
                return (
                  <Circle
                    key={`overlay-${index}`}
                    center={{ latitude: report.lat, longitude: report.lng }}
                    radius={200}
                    fillColor={isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
                    strokeColor={isDanger ? '#ef4444' : '#f59e0b'}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Render Safe Refuges (Green Glow) */}
              {refuges.map((refuge, index) => (
                <Marker
                  key={`refuge-${index}`}
                  coordinate={{ latitude: refuge.lat, longitude: refuge.lng }}
                  title={refuge.name}
                  description={refuge.type}
                >
                   <View style={styles.refugeMarker}>
                     <View style={styles.refugeDot} />
                   </View>
                </Marker>
              ))}
            </MapView>

            {/* Search Bar / Destination */}
            <View style={styles.searchContainer}>
               <TextInput
                 style={styles.searchInput}
                 placeholder="Where are you going?"
                 placeholderTextColor="#94a3b8"
                 value={destination}
                 onChangeText={setDestination}
               />
               <TouchableOpacity style={styles.searchBtn} onPress={() => alert('Calculating Safest Path...')}>
                 <Text style={{fontSize: 18}}>🚀</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.recenterBtn} onPress={recenter}>
              <Text style={{fontSize: 20}}>🎯</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d946ef" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.guardiansButton} onPress={() => navigation.navigate('Guardians')}>
          <Text style={styles.guardiansIcon}>🛡️</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "pathType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  searchContainer: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 80,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  searchBtn: { marginLeft: 10 },
  recenterBtn: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guardiansButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guardiansIcon: { fontSize: 24 },
  refugeMarker: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  refugeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e', shadowRadius: 5, shadowOpacity: 0.8,
  }
});
