import { useLocalSearchParams, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { useParkingStore } from '../../store/parking';
import { Ionicons } from '@expo/vector-icons';
import { openMapsApp } from '../../utils/navigation'; // Import openMapsApp

export default function ParkingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getParkingById } = useParkingStore();
  const parking = id ? getParkingById(id) : undefined;

  if (!parking) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyStateText}>No se encontró el estacionamiento.</Text>
      </View>
    );
  }

  console.log('Parking object:', JSON.stringify(parking, null, 2));

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: parking.name, headerBackTitle: 'Buscar' }} />
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={24} color="#007AFF" style={styles.infoIcon} />
          <Text style={styles.infoText}>{
            typeof parking.address === 'string'
              ? parking.address
              : (parking.address ? `${parking.address.street}, ${parking.address.city}` : 'Dirección no disponible')
          }</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={24} color="#007AFF" style={styles.infoIcon} />
          <Text style={styles.infoText}>No disponible</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color="#007AFF" style={styles.infoIcon} />
          <Text style={styles.infoText}>No disponible</Text>
        </View>
      </View>

      <View style={styles.availabilityContainer}>
        {parking.availability.cars.total > 0 && (
          <View style={styles.availabilityCard}>
            <Ionicons name="car-sport-outline" size={20} color="#007AFF" style={styles.availabilityIcon} />
            <Text style={styles.availabilityCardText}>
              Autos: {parking.availability.cars.available} / {parking.availability.cars.total}
            </Text>
          </View>
        )}
        {parking.availability.motorcycles.total > 0 && (
          <View style={styles.availabilityCard}>
            <Ionicons name="bicycle-outline" size={20} color="#FC6A03" style={styles.availabilityIcon} />
            <Text style={styles.availabilityCardText}>
              Motos: {parking.availability.motorcycles.available} / {parking.availability.motorcycles.total}
            </Text>
          </View>
        )}
        {(parking.availability.cars.total === 0 && parking.availability.motorcycles.total === 0) && (
          <Text style={styles.noAvailabilityText}>No hay información de disponibilidad.</Text>
        )}
      </View>

      <View style={styles.navigateButtonContainer}>
        <Button title="Navegar a Estacionamiento" onPress={() => openMapsApp(parking)} color="#007AFF" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f7', // Consistent background color
    padding: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#8e8e93',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20, // Add margin bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#1c1c1e', // Darker text for consistency
  },
  // Availability styles (similar to index.tsx)
  availabilityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  availabilityIcon: {
    marginRight: 10,
  },
  availabilityCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  noAvailabilityText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    paddingVertical: 10,
  },
  navigateButtonContainer: {
    marginHorizontal: 0, // Button will fill width due to container padding
    marginBottom: 20,
  }
});
