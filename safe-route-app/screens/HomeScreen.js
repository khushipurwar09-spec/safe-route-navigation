import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, onHealthModeToggle }) {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [refuges, setRefuges] = useState([]);
  const [reports, setReports] = useState([]);
  const [destination, setDestination] = useState('');
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapType, setMapType] = useState('standard');
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
      if (lastLoc) setLocation(lastLoc.coords);

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

  const calculateSafeRoute = () => {
    if (!destination || !location) return;
    
    const destLat = location.latitude + 0.005; 
    const destLng = location.longitude + 0.005;

    const mockRoute = [
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: location.latitude + 0.002, longitude: location.longitude + 0.001 },
      { latitude: location.latitude + 0.003, longitude: location.longitude + 0.004 },
      { latitude: destLat, longitude: destLng },
    ];
    
    setRouteCoords(mockRoute);
    
    mapRef.current?.animateToRegion({
      latitude: (location.latitude + destLat) / 2,
      longitude: (location.longitude + destLng) / 2,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

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
              mapType={mapType}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={mapType === 'standard' ? midnightMapStyle : []}
            >
              {/* Safest Route Polyline */}
              {routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#00f2fe" 
                  strokeWidth={6}
                />
              )}

              {/* Overlay Safe/Moderate/Danger Zones */}
              {reports.map((report, index) => {
                const isDanger = report.type?.toLowerCase().includes('danger') || report.type?.toLowerCase().includes('sos');
                return (
                  <Circle
                    key={`overlay-${index}`}
                    center={{ latitude: report.lat, longitude: report.lng }}
                    radius={250}
                    fillColor={isDanger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}
                    strokeColor={isDanger ? '#ef4444' : '#f59e0b'}
                    strokeWidth={2}
                  />
                );
              })}

              {/* Render SAFE HAVENS (Hospitals, Police Stations) */}
              {refuges.map((refuge, index) => (
                <Marker
                  key={`haven-${index}`}
                  coordinate={{ latitude: refuge.lat, longitude: refuge.lng }}
                  title={`SAFE HAVEN: ${refuge.name}`}
                  description={`${refuge.type} - Emergency Support Available`}
                >
                   <View style={styles.havenMarker}>
                     <Text style={{fontSize: 14}}>🛡️</Text>
                   </View>
                </Marker>
              ))}
            </MapView>

            {/* Top Search Bar */}
            <View style={styles.searchContainer}>
               <TextInput
                 style={styles.searchInput}
                 placeholder="Where are you going?"
                 placeholderTextColor="#94a3b8"
                 value={destination}
                 onChangeText={setDestination}
               />
               <TouchableOpacity style={styles.searchBtn} onPress={calculateSafeRoute}>
                 <Text style={{fontSize: 20}}>🚀</Text>
               </TouchableOpacity>
            </View>

            {/* Side Controls */}
            <View style={styles.sideControls}>
               <TouchableOpacity style={styles.sideBtn} onPress={toggleMapType}>
                  <Text style={{fontSize: 20}}>{mapType === 'standard' ? '🛰️' : '🗺️'}</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.sideBtn} onPress={recenter}>
                  <Text style={{fontSize: 22}}>🎯</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.sideBtn} onPress={() => navigation.navigate('Guardians')}>
                  <Text style={{fontSize: 22}}>🛡️</Text>
               </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d946ef" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const midnightMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1c2c" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "pathType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#1e1b4b" }] }
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
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 15,
    paddingHorizontal: 20,
    height: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 15,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  searchBtn: { marginLeft: 15 },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: 140,
    alignItems: 'center',
  },
  sideBtn: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
  },
  havenMarker: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#22c55e',
    shadowColor: '#22c55e', shadowRadius: 15, shadowOpacity: 1,
  }
});
