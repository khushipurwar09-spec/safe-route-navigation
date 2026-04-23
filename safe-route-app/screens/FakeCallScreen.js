import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export default function FakeCallScreen({ navigation }) {
  const [sound, setSound] = useState();

  useEffect(() => {
    async function playRingtone() {
      // Setup audio and play ringtone (mocked here, use real file in prod)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    playRingtone();

    return sound ? () => sound.unloadAsync() : undefined;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.callerName}>Mom</Text>
      <Text style={styles.callerType}>Mobile</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.decline]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.accept]} onPress={() => alert('Call connected. Simulated conversation script will play.')}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', alignItems: 'center', justifyContent: 'center' },
  callerName: { fontSize: 40, color: 'white', marginBottom: 10 },
  callerType: { fontSize: 18, color: '#aaa', marginBottom: 100 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 40, marginTop: 100 },
  button: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  decline: { backgroundColor: '#ff3b30' },
  accept: { backgroundColor: '#34c759' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});
