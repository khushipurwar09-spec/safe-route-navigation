import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function FakeCallScreen() {
  const navigation = useNavigation();
  const [callStatus, setCallStatus] = useState('incoming'); // incoming, active
  const [timer, setTimer] = useState(0);
  const soundRef = useRef(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (callStatus === 'incoming') {
      Vibration.vibrate([500, 1000, 500, 1000], true);
      startRingtone();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      Vibration.cancel();
      stopSound();
      startVoiceOver();
    }
    
    return () => {
        Vibration.cancel();
        stopSound();
    };
  }, [callStatus]);

  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  async function startRingtone() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/phone/phone-calling-1.mp3' },
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
    } catch (e) { console.log("Audio load error", e); }
  }

  async function startVoiceOver() {
    try {
        // High quality voice-over simulation
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/human/mumbling-1.mp3' }, // Placeholder for voice
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        soundRef.current = sound;
      } catch (e) { console.log("Voice load error", e); }
  }

  async function stopSound() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }

  const handleAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallStatus('active');
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.cancel();
    stopSound();
    navigation.goBack();
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {callStatus === 'incoming' ? (
        <View style={styles.incomingContainer}>
          <Text style={styles.statusLabel}>Incoming Protection Call</Text>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
             <View style={styles.avatarLarge}><Text style={styles.avatarText}>M</Text></View>
          </Animated.View>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.callerName}>Mom</Text>
            <Text style={styles.callerSub}>Emergency Contact</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={handleDecline}>
              <Text style={styles.btnIcon}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.answerBtn]} onPress={handleAnswer}>
              <Text style={styles.btnIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.activeContainer}>
          <View style={styles.activeContent}>
             <View style={styles.avatarLarge}><Text style={styles.avatarText}>M</Text></View>
             <Text style={styles.callerNameActive}>Mom</Text>
             <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
          
          <View style={styles.controlsGrid}>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>🔇</Text><Text style={styles.controlLabel}>mute</Text></View>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>⌨️</Text><Text style={styles.controlLabel}>keypad</Text></View>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>🔊</Text><Text style={styles.controlLabel}>speaker</Text></View>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>➕</Text><Text style={styles.controlLabel}>add call</Text></View>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>📹</Text><Text style={styles.controlLabel}>FaceTime</Text></View>
             <View style={styles.controlItem}><Text style={styles.controlIcon}>👤</Text><Text style={styles.controlLabel}>contacts</Text></View>
          </View>

          <TouchableOpacity style={styles.hangupBtn} onPress={handleDecline}>
            <Text style={styles.btnIcon}>☎️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  incomingContainer: { flex: 1, justifyContent: 'space-between', paddingVertical: 100, alignItems: 'center' },
  statusLabel: { color: '#94a3b8', letterSpacing: 2, fontSize: 12, fontWeight: 'bold' },
  pulseCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 50, fontWeight: 'bold' },
  callerName: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  callerSub: { color: '#6366f1', fontSize: 16, marginTop: 5, fontWeight: '600' },
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 50 },
  actionBtn: { width: 75, height: 75, borderRadius: 37.5, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  declineBtn: { backgroundColor: '#ef4444' },
  answerBtn: { backgroundColor: '#22c55e' },
  btnIcon: { color: '#fff', fontSize: 30 },

  activeContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  activeContent: { alignItems: 'center', marginBottom: 50 },
  callerNameActive: { color: '#fff', fontSize: 36, fontWeight: '300', marginTop: 20 },
  timerText: { color: '#6366f1', fontSize: 18, marginTop: 10 },
  controlsGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '80%', justifyContent: 'center' },
  controlItem: { width: '33.33%', alignItems: 'center', marginBottom: 40 },
  controlIcon: { fontSize: 30, color: '#fff', marginBottom: 8 },
  controlLabel: { color: '#94a3b8', fontSize: 12 },
  hangupBtn: { position: 'absolute', bottom: 50, width: 80, height: 80, borderRadius: 40, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', elevation: 10 }
});
