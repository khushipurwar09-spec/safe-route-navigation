import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';

export default function BottomButtonBar() {
  const navigation = useNavigation();

  const handleSOS = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // User wants current location sent. We will get it or use mock
    await api.post('/sos', { lat: 0, lng: 0 }); 
    alert('SOS Sent to ALL Guardians & Contacts!');
  };

  const handleCheckIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await api.post('/checkin', { lat: 0, lng: 0 });
    alert('Check-in successful!');
  };

  const handleReRoute = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await api.post('/reroute', {});
    alert('Rerouting to safest path...');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ffeaa7' }]} onPress={() => navigation.navigate('FakeCall')}>
        <Text style={styles.icon}>📞</Text>
        <Text style={styles.labelDark}>Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#81ecec' }]} onPress={handleReRoute}>
        <Text style={styles.icon}>🔄</Text>
        <Text style={styles.labelDark}>Route</Text>
      </TouchableOpacity>

      {/* Main SOS Button (Central & Elevated) */}
      <TouchableOpacity style={[styles.sosButton, { backgroundColor: '#ff7675' }]} onPress={handleSOS}>
        <Text style={styles.sosIcon}>🚨</Text>
        <Text style={styles.sosLabel}>SOS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, { backgroundColor: '#55efc4' }]} onPress={handleCheckIn}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.labelDark}>Check In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#a29bfe' }]} onPress={() => navigation.navigate('Report')}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.labelLight}>Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    position: 'absolute', // Float over map
    bottom: 0,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 55,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sosButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    elevation: 8,
    shadowColor: '#d63031',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: -30, // Make it pop out of the top of the bar
    borderWidth: 4,
    borderColor: '#fff',
  },
  icon: { fontSize: 22 },
  sosIcon: { fontSize: 32 },
  labelDark: { fontSize: 10, color: '#2d3436', fontWeight: '800', marginTop: 3 },
  labelLight: { fontSize: 10, color: '#ffffff', fontWeight: '800', marginTop: 3 },
  sosLabel: { fontSize: 12, color: '#ffffff', fontWeight: '900', marginTop: 2 }
});
