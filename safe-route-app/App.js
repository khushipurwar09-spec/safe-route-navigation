import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import FakeCallScreen from './screens/FakeCallScreen';
import HealthModeScreen from './screens/HealthModeScreen';
import ReportScreen from './screens/ReportScreen';
import GuardianScreen from './screens/GuardianScreen';
import LoginScreen from './screens/LoginScreen';
import BottomButtonBar from './components/BottomButtonBar';
import { initializeSocket } from './services/websocket';
import { startLocationTracking } from './services/locationTracker';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isHealthMode, setIsHealthMode] = useState(false);

  useEffect(() => {
    initializeSocket();
    startLocationTracking();
  }, []);

  if (isHealthMode) {
    return <HealthModeScreen onExit={() => setIsHealthMode(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} onHealthModeToggle={() => setIsHealthMode(true)} />}
          </Stack.Screen>
          <Stack.Screen name="FakeCall" component={FakeCallScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Guardians" component={GuardianScreen} />
        </Stack.Navigator>
        <BottomButtonBar />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
