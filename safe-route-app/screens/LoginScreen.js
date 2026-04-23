import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    userPhone: '',
    emergencyPhone: ''
  });

  const handleGetStarted = () => {
    if (!formData.name || !formData.userPhone || !formData.emergencyPhone) {
       alert('Full Name, Your Phone, and Emergency Phone are mandatory for your safety.');
       return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <Text style={styles.title}>Secure Profile</Text>
           <Text style={styles.subtitle}>Fill in your details to activate Rakhsha protection protocols</Text>
        </View>

        <View style={styles.form}>
           <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Khushi Purwar" 
                placeholderTextColor="#64748b" 
                value={formData.name}
                onChangeText={(val) => setFormData({...formData, name: val})}
              />
           </View>

           <View style={styles.inputGroup}>
              <Text style={styles.label}>YOUR PHONE NUMBER</Text>
              <TextInput 
                style={styles.input} 
                placeholder="+91 12345 67890" 
                placeholderTextColor="#64748b" 
                keyboardType="phone-pad"
                value={formData.userPhone}
                onChangeText={(val) => setFormData({...formData, userPhone: val})}
              />
           </View>

           <View style={styles.inputGroup}>
              <Text style={styles.label}>PRIMARY EMERGENCY NUMBER</Text>
              <TextInput 
                style={styles.input} 
                placeholder="+91 98765 43210" 
                placeholderTextColor="#64748b" 
                keyboardType="phone-pad"
                value={formData.emergencyPhone}
                onChangeText={(val) => setFormData({...formData, emergencyPhone: val})}
              />
           </View>

           <View style={styles.inputGroup}>
              <Text style={styles.label}>AGE & EMAIL (OPTIONAL)</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput 
                  style={[styles.input, {width: '30%'}]} 
                  placeholder="21" 
                  placeholderTextColor="#64748b" 
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(val) => setFormData({...formData, age: val})}
                />
                <TextInput 
                  style={[styles.input, {width: '65%'}]} 
                  placeholder="email@link.com" 
                  placeholderTextColor="#64748b" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => setFormData({...formData, email: val})}
                />
              </View>
           </View>

           <TouchableOpacity style={styles.submitBtn} onPress={handleGetStarted}>
              <Text style={styles.submitBtnText}>ACTIVATE SHIELD</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>Identity verified via encrypted protocols. Safe browsing active.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContainer: { paddingHorizontal: 30, paddingTop: 70, paddingBottom: 40 },
  header: { marginBottom: 35 },
  title: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  subtitle: { color: '#6366f1', fontSize: 14, marginTop: 10, fontWeight: '500', lineHeight: 22 },
  form: { marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    fontSize: 15
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 3 },
  privacyNote: { color: '#475569', fontSize: 11, textAlign: 'center', marginTop: 30, lineHeight: 18 }
});
