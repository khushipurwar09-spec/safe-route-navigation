import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function HealthModeScreen({ onExit }) {
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    if (tapCount + 1 >= 3) {
      onExit();
    } else {
      setTapCount(tapCount + 1);
      setTimeout(() => setTapCount(0), 1000); // Reset tap count after 1 sec
    }
  };

  return (
    <View style={styles.container}>
      {/* Hidden exit trigger zone at the top left */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.hiddenTrigger} />
      </TouchableWithoutFeedback>

      {/* Disguise UI - Looks like a simple step counter or weather app */}
      <View style={styles.content}>
        <Text style={styles.title}>Today's Activity</Text>
        <Text style={styles.steps}>6,432</Text>
        <Text style={styles.subtitle}>Steps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  hiddenTrigger: { position: 'absolute', top: 0, left: 0, width: 100, height: 100, zIndex: 10 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, color: '#333' },
  steps: { fontSize: 80, fontWeight: 'bold', color: '#2ecc71', marginVertical: 20 },
  subtitle: { fontSize: 20, color: '#7f8c8d' },
});
