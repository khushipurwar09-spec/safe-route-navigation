import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function GuardianScreen() {
  const [guardians, setGuardians] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const res = await api.get('/guardians/list');
      setGuardians(res.data.guardians || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddGuardian = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }
    if (guardians.length >= 5) {
      Alert.alert('Limit Reached', 'You can only have up to 5 guardians.');
      return;
    }
    
    try {
      await api.post('/guardians/add', { name, phone, relationship });
      setName('');
      setPhone('');
      setRelationship('');
      fetchGuardians();
    } catch (error) {
      Alert.alert('Error', 'Failed to add guardian');
    }
  };

  const handleRemoveGuardian = async (id) => {
    try {
      await api.delete(`/guardians/remove/${id}`);
      fetchGuardians();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove guardian');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.guardianCard}>
      <View>
        <Text style={styles.guardianName}>{item.name}</Text>
        <Text style={styles.guardianPhone}>{item.phone} • {item.relationship}</Text>
      </View>
      {!item.isDefault && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveGuardian(item.id)}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const defaultContacts = [
    { id: 'def1', name: 'Police', phone: '100', relationship: 'Emergency', isDefault: true },
    { id: 'def2', name: 'Women Helpline', phone: '1091', relationship: 'Emergency', isDefault: true }
  ];

  const allContacts = [...defaultContacts, ...guardians];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>These contacts will be notified instantly when you trigger SOS.</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Name (e.g. Mom)" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone (e.g. 9876543210)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Relationship (optional)" value={relationship} onChangeText={setRelationship} />
        <TouchableOpacity style={styles.addButton} onPress={handleAddGuardian}>
          <Text style={styles.addText}>+ Add Guardian</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>Saved Guardians ({guardians.length}/5)</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff7675" />
      ) : (
        <FlatList
          data={allContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2d3436' },
  subtitle: { fontSize: 14, color: '#636e72', marginBottom: 20 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2, marginBottom: 20 },
  input: { borderBottomWidth: 1, borderBottomColor: '#dfe6e9', paddingVertical: 10, marginBottom: 15, fontSize: 16 },
  addButton: { backgroundColor: '#a29bfe', padding: 15, borderRadius: 10, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436', marginBottom: 10 },
  guardianCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  guardianName: { fontSize: 16, fontWeight: 'bold', color: '#2d3436' },
  guardianPhone: { fontSize: 14, color: '#636e72', marginTop: 4 },
  deleteButton: { backgroundColor: '#ff7675', padding: 8, borderRadius: 5 },
  deleteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#b2bec3', marginTop: 20 }
});
