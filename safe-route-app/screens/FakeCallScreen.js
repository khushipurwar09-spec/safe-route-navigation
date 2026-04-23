import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Vibration, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const FAKE_MESSAGES = [
  { sender: 'caller', text: "Hello? Are you on your way?", delay: 2000 },
  { sender: 'user', text: "Hi, yes I'm coming home now", delay: 4500 },
  { sender: 'caller', text: "Okay, be careful. Is everything alright?", delay: 8000 },
  { sender: 'user', text: "Yes, just walking. See you soon.", delay: 11000 }
];

export default function FakeCallScreen() {
  const navigation = useNavigation();
  const [callStatus, setCallStatus] = useState('incoming'); // incoming, active
  const [timer, setTimer] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const soundRef = useRef(null);

  // Pulse animation for incoming call
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
      startVoiceSim();
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
      
      FAKE_MESSAGES.forEach((msg) => {
        setTimeout(() => {
          if (msg.sender === 'caller') {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setMessages((prev) => [...prev, msg]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 1200);
          } else {
            setMessages((prev) => [...prev, msg]);
          }
        }, msg.delay);
      });
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

  async function startVoiceSim() {
    try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/human/mumbling-1.mp3' },
          { shouldPlay: true, isLooping: true, volume: 0.3 }
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
          <View style={styles.activeHeader}>
             <View style={styles.avatarSmall}><Text style={styles.avatarTextSmall}>M</Text></View>
             <View>
               <Text style={styles.activeName}>Mom</Text>
               <Text style={styles.activeTimer}>{formatTime(timer)}</Text>
             </View>
          </View>
          <View style={styles.chatArea}>
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <View style={[styles.msg, item.sender === 'user' ? styles.msgUser : styles.msgCaller]}>
                  <Text style={styles.msgText}>{item.text}</Text>
                </View>
              )}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ padding: 20 }}
            />
            {isTyping && <Text style={styles.typing}>Mom is speaking...</Text>}
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
  avatarLarge: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 50, fontWeight: 'bold' },
  callerName: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  callerSub: { color: '#6366f1', fontSize: 16, marginTop: 5, fontWeight: '600' },
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 50 },
  actionBtn: { width: 75, height: 75, borderRadius: 37.5, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  declineBtn: { backgroundColor: '#ef4444' },
  answerBtn: { backgroundColor: '#22c55e' },
  btnIcon: { color: '#fff', fontSize: 30 },

  activeContainer: { flex: 1 },
  activeHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'rgba(15, 23, 42, 0.9)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  avatarSmall: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTextSmall: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeTimer: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
  chatArea: { flex: 1 },
  msg: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 12 },
  msgCaller: { backgroundColor: '#1e293b', alignSelf: 'flex-start' },
  msgUser: { backgroundColor: '#6366f1', alignSelf: 'flex-end' },
  msgText: { color: '#fff', fontSize: 15 },
  typing: { color: '#64748b', marginLeft: 20, fontStyle: 'italic', marginBottom: 10 },
  hangupBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', elevation: 10 }
});
