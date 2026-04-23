import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import api from '../services/api';

export default function ReportScreen({ navigation }) {
  const [description, setDescription] = useState('');

  const submitReport = async () => {
    try {
      await api.post('/report', { type: 'Suspicious Activity', description, lat: 0, lng: 0 });
      alert('Report submitted anonymously.');
      navigation.goBack();
    } catch(err) {
      alert('Error submitting report.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Incident</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Describe what happened or what you saw..."
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Submit Report" onPress={submitReport} color="#e74c3c" />
      <View style={{marginTop: 20}}>
        <Button title="Cancel" onPress={() => navigation.goBack()} color="#7f8c8d" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 20, minHeight: 120, textAlignVertical: 'top' }
});
