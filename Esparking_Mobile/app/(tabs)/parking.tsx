import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { getParkings } from '../../services/parkingService';
import { useParkingStore } from '../../store/parking';
import { Colors, FontSize, Spacing } from '../../constants/Theme';

const INITIAL_RADIUS = 5000; // 5km

export default function MapScreen() {
  const { parkings, setParkings } = useParkingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(INITIAL_RADIUS);
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  const router = useRouter();
  const mapViewRef = useRef<MapView>(null);

  const startup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('El permiso para acceder a la ubicación fue denegado.');
      setIsLoading(false);
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(region);

      const parkingData = await getParkings(
        region.latitude,
        region.longitude,
        INITIAL_RADIUS,
      );
      setParkings(parkingData);
    } catch (err) {
      console.error('Error during startup:', err);
      setError('No se pudo obtener la ubicación o cargar los estacionamientos.');
    } finally {
      setIsLoading(false);
    }
  }, [setParkings]);

  useEffect(() => {
    startup();
  }, [startup]);

  const handleManualSearch = async () => {
    if (!mapRegion) {
      Alert.alert("Ubicación no disponible", "No se puede buscar sin una región en el mapa.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const parkingData = await getParkings(
        mapRegion.latitude,
        mapRegion.longitude,
        radius,
      );
      setParkings(parkingData);
    } catch (err) {
      setError('Falló al refrescar los estacionamientos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede obtener la ubicación actual.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    mapViewRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const filteredParkings = parkings.filter(p => {
    if (showAvailableOnly) {
      return p.availability.cars.available > 0 || p.availability.motorcycles.available > 0;
    }
    return true;
  });

  if (isLoading && !mapRegion) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={{ marginTop: Spacing.sm }}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Intentar de nuevo" onPress={startup} color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- Control Panel (Top Block) --- */}
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Mapa de Estacionamientos</Text>
        <View style={styles.availableFilterContainer}>
          <Text style={styles.availableFilterText}>Mostrar solo con lugares disponibles</Text>
          <Switch
            onValueChange={setShowAvailableOnly}
            value={showAvailableOnly}
            trackColor={{ false: '#767577', true: Colors.light.primary }}
            thumbColor={showAvailableOnly ? Colors.light.background : Colors.light.background}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
        <Text style={styles.label}>Radio de búsqueda: {((radius || INITIAL_RADIUS) / 1000).toFixed(1)} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={500}
          maximumValue={10000}
          step={250}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor={Colors.light.primary}
          maximumTrackTintColor={Colors.light.lightGray}
        />
        <Button title="Buscar en esta área" onPress={handleManualSearch} disabled={isLoading} color={Colors.light.primary} />
      </View>

      {/* --- Map Area (Bottom Block) --- */}
      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            ref={mapViewRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onRegionChangeComplete={(region) => setMapRegion({ ...region })}
          >
            <UrlTile
              urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              maximumZ={19}
            />
            {filteredParkings.map((parking) => (
              <Marker
                key={parking._id}
                coordinate={{
                  latitude: parking.location.coordinates[1],
                  longitude: parking.location.coordinates[0],
                }}
                title={parking.name}
                description={
                  typeof parking.address === 'string' 
                    ? parking.address 
                    : (parking.address ? `${parking.address.street}, ${parking.address.city}` : 'Dirección no disponible')
                }
                onCalloutPress={() => router.push(`/details/${parking._id}`)}
              />
            ))}
          </MapView>
        )}
        <TouchableOpacity style={styles.locationButton} onPress={goToMyLocation}>
          <MaterialIcons name="my-location" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.light.card 
  },
  errorText: { 
    fontSize: FontSize.medium, 
    color: Colors.light.danger, 
    textAlign: 'center', 
    padding: Spacing.md 
  },
  controlPanel: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  title: { 
    fontSize: FontSize.subtitle, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: Spacing.md, 
    color: Colors.light.text
  },
  availableFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  availableFilterText: {
    fontSize: FontSize.medium,
    color: Colors.light.text,
  },
  label: { 
    fontSize: FontSize.medium, 
    textAlign: 'center', 
    marginVertical: Spacing.sm, 
    color: Colors.light.text
  },
  slider: { 
    width: '100%', 
    height: 40 
  },
  locationButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 50,
    padding: Spacing.md,
    elevation: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});