import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#f5f5f5', '#ffffff']}
      style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/iconoesparking.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Esparking Movil</Text>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>INICIAR</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50', // Dark Slate Blue/Gray
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#1abc9c', // Turquoise
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
