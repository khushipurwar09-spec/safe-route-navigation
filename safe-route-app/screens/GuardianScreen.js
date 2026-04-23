import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

const STORAGE_KEY = '@guardians_cache';

export default function GuardianScreen({ navigation }) {
  const [guardians, setGuardians] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCachedGuardians();
    fetchGuardians();
  }, []);

  const loadCachedGuardians = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) setGuardians(JSON.parse(cached));
    } catch (e) { console.log("Cache load error", e); }
  };

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const res = await api.get('/guardians/list');
      const list = res.data.guardians || [];
      setGuardians(list);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      console.log("Fetch error, using cache if available");
    }
    setLoading(false);
  };

  const handleAddGuardian = async () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please provide a name and phone number');
      return;
    }
    try {
      setLoading(true);
      await api.post('/guardians/add', { name, phone, relationship });
      setName(''); setPhone(''); setRelationship('');
      await fetchGuardians();
    } catch (error) {
      Alert.alert('Error', 'Could not save guardian. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuardian = async (id) => {
    try {
      await api.delete(`/guardians/remove/${id}`);
      await fetchGuardians();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove guardian');
    }
  };

  const defaultContacts = [
    { id: 'def1', name: 'Police', phone: '100', relationship: 'Emergency', isDefault: true },
    { id: 'def2', name: 'Women Helpline', phone: '1091', relationship: 'Emergency', isDefault: true }
  ];

  const allContacts = [...defaultContacts, ...guardians];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Guardians</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Add New Guardian</Text>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#64748b" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Relationship (e.g. Sister)" placeholderTextColor="#64748b" value={relationship} onChangeText={setRelationship} />
        <TouchableOpacity style={styles.addButton} onPress={handleAddGuardian} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addText}>Secure Contact</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={allContacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.guardianName}>{item.name}</Text>
              <Text style={styles.guardianInfo}>{item.phone} • {item.relationship}</Text>
            </View>
            {!item.isDefault && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveGuardian(item.id)}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, marginBottom: 30 },
  backBtn: { color: '#fff', fontSize: 30, marginRight: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  form: { backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: 20, borderRadius: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 15, fontWeight: '600' },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  addButton: { backgroundColor: '#6366f1', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  guardianName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  guardianInfo: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 8 },
  deleteText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' }
});
