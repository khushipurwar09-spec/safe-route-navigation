import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Vibration, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const FAKE_MESSAGES = [
  { sender: 'caller', text: "Hello? Are you on your way?", delay: 2000 },
  { sender: 'user', text: "Hi, yes I'm coming home now", delay: 4000 },
  { sender: 'caller', text: "Okay, be careful. Text me when you reach", delay: 7000 },
  { sender: 'user', text: "Sure, I will. Bye", delay: 9000 }
];

export default function FakeCallScreen() {
  const navigation = useNavigation();
  const [callStatus, setCallStatus] = useState('incoming'); // incoming, active
  const [timer, setTimer] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Pulse animation for incoming call
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (callStatus === 'incoming') {
      Vibration.vibrate([500, 1000, 500, 1000], true); // Repeat vibration
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      Vibration.cancel();
      pulseAnim.stopAnimation();
    }
    
    return () => Vibration.cancel();
  }, [callStatus]);

  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      // Simulation sequence
      FAKE_MESSAGES.forEach((msg) => {
        setTimeout(() => {
          if (msg.sender === 'caller') {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setMessages((prev) => [...prev, msg]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 1500); // simulate typing time
          } else {
            setMessages((prev) => [...prev, msg]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }, msg.delay);
      });
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallStatus('active');
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.cancel();
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderIncoming = () => (
    <View style={styles.incomingContainer}>
      <Text style={styles.incomingText}>Incoming call...</Text>
      
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>M</Text>
        </View>
      </Animated.View>
      
      <Text style={styles.callerName}>Mom</Text>
      <Text style={styles.callerType}>Mobile</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  const renderActive = () => (
    <View style={styles.activeContainer}>
      <View style={styles.activeHeader}>
        <View style={styles.smallAvatar}>
          <Text style={styles.smallAvatarText}>M</Text>
        </View>
        <View>
          <Text style={styles.activeCallerName}>Mom</Text>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      <View style={styles.simulationArea}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.callerBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Mom is speaking...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={handleDecline}>
        <Text style={styles.actionIcon}>☎️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {callStatus === 'incoming' ? renderIncoming() : renderActive()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  incomingContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: 80, paddingBottom: 60 },
  incomingText: { color: '#94a3b8', fontSize: 18, marginBottom: 40 },
  avatarContainer: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)'
  },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 20
  },
  avatarInitials: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  callerName: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 20 },
  callerType: { color: '#64748b', fontSize: 18, marginTop: 5 },
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 40, marginTop: 100 },
  declineButton: {
    width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#ef4444',
    justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 15
  },
  answerButton: {
    width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#22c55e',
    justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#22c55e', shadowOpacity: 0.8, shadowRadius: 20
  },
  actionIcon: { color: '#fff', fontSize: 32 },

  // Active Call Styles
  activeContainer: { flex: 1 },
  activeHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  smallAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  smallAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeCallerName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  timerText: { color: '#22c55e', fontSize: 16, marginTop: 4, fontWeight: '600' },
  
  simulationArea: { flex: 1, backgroundColor: '#020617' },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  callerBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  bubbleText: { color: '#f8fafc', fontSize: 16 },
  typingIndicator: { paddingLeft: 20, marginBottom: 10 },
  typingText: { color: '#64748b', fontStyle: 'italic' },
  
  endCallButton: {
    alignSelf: 'center', width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center',
    position: 'absolute', bottom: 40,
    elevation: 10, shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 15
  }
});
