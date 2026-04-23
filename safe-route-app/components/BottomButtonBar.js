import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';

export default function BottomButtonBar() {
  const navigation = useNavigation();

  const handleSOS = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await api.post('/emergency', { lat: 0, lng: 0 }); // Mock location
    alert('SOS Sent to Contacts & Police!');
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
      <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleSOS}>
        <Text style={styles.text}>🚨</Text>
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]} onPress={handleCheckIn}>
        <Text style={styles.text}>✅</Text>
        <Text style={styles.label}>Check In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#3498db' }]} onPress={handleReRoute}>
        <Text style={styles.text}>🔄</Text>
        <Text style={styles.label}>Re-route</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#9b59b6' }]} onPress={() => navigation.navigate('FakeCall')}>
        <Text style={styles.text}>📞</Text>
        <Text style={styles.label}>Fake Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#e67e22' }]} onPress={() => navigation.navigate('Report')}>
        <Text style={styles.text}>✉️</Text>
        <Text style={styles.label}>Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingBottom: 25, // safe area padding
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 65,
    borderRadius: 35,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: { fontSize: 24 },
  label: { fontSize: 10, color: '#fff', fontWeight: 'bold', marginTop: 2 }
});
