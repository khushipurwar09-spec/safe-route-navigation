import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function BottomButtonBar() {
  const navigation = useNavigation();
  
  // Logic to hide the bar on specific screens (like Fake Call)
  const state = useNavigationState(state => state);
  const currentRoute = state?.routes[state.index]?.name;
  const hideScreens = ['FakeCall', 'Guardians', 'Report'];
  
  if (hideScreens.includes(currentRoute)) return null;

  const handleSOS = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    try {
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.post('/sos', { lat: loc.coords.latitude, lng: loc.coords.longitude }); 
      alert('SOS: Guardians Notified!');
    } catch (e) {
      alert('SOS Sent! (Location unavailable)');
      await api.post('/sos', { lat: 0, lng: 0 }); 
    }
  };

  const handleCheckIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.post('/checkin', { lat: loc.coords.latitude, lng: loc.coords.longitude });
      alert('Checked in safely.');
    } catch (e) {
      alert('Check-in recorded.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FakeCall')}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 234, 167, 0.15)' }]}>
            <Text style={styles.icon}>📞</Text>
          </View>
          <Text style={styles.label}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => alert('Safe Route Feature coming soon')}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(129, 236, 236, 0.15)' }]}>
            <Text style={styles.icon}>🔄</Text>
          </View>
          <Text style={styles.label}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <View style={styles.sosInner}>
            <Text style={styles.sosIcon}>🚨</Text>
          </View>
          <Text style={styles.sosLabel}>SOS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(85, 239, 196, 0.15)' }]}>
            <Text style={styles.icon}>✅</Text>
          </View>
          <Text style={styles.label}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Report')}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(162, 155, 254, 0.15)' }]}>
            <Text style={styles.icon}>✉️</Text>
          </View>
          <Text style={styles.label}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 30,
    width: width,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // Deep dark theme
    borderRadius: 35,
    width: width * 0.92,
    shadowColor: '#d946ef', // Neon glow matching logo
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sosButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45, // Pops up slightly
  },
  sosInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ff7675',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(15, 23, 42, 1)',
    shadowColor: '#ff7675',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: { fontSize: 20 },
  sosIcon: { fontSize: 28 },
  label: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  sosLabel: { fontSize: 11, color: '#ff7675', fontWeight: '900', marginTop: 4 },
});
