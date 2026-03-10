import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/Theme';
import { getParkings, Parking } from '../../services/parkingService';
import { useParkingStore } from '../../store/parking';
import { openMapsApp } from '../../utils/navigation';

const INITIAL_RADIUS = 5000; // 5km

export default function SearchScreen() {
  const { parkings, setParkings } = useParkingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [radius, setRadius] = useState(INITIAL_RADIUS);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const router = useRouter();

  const startup = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access location was denied.');
      setIsLoading(false);
      return;
    }

    let currentLocation;
    try {
      currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (err) {
      setError('Could not fetch location.');
      setIsLoading(false);
      console.error(err);
      return;
    }

    try {
      const parkingData = await getParkings(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        INITIAL_RADIUS,
      );
      setParkings(parkingData);
    } catch (err) {
      setError('Failed to load parkings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setParkings]);

  useEffect(() => {
    startup();
  }, [startup]);

  const handleManualSearch = async () => {
    if (!location) {
      setError("Location not available. Cannot perform search.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const parkingData = await getParkings(
        location.coords.latitude,
        location.coords.longitude,
        radius,
      );
      setParkings(parkingData);
    } catch (err) {
      setError('Failed to refresh parkings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!location) {
      setIsRefreshing(false);
      return;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      const parkingData = await getParkings(
        location.coords.latitude,
        location.coords.longitude,
        radius,
      );
      setParkings(parkingData);
    } catch (err) {
      setError('Failed to refresh parkings.');
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [location, radius, setParkings]);

  const handleItemActions = (item: Parking) => {
    Alert.alert(
      item.name,
      "¿Qué acción deseas realizar?",
      [
        {
          text: "Detalles",
          onPress: () => router.push(`/details/${item._id}`),
        },
        {
          text: "Navegar",
          onPress: () => openMapsApp(item),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const filteredAndSearchedParkings = useMemo(() => {
    let result = parkings;
    
    if (showAvailableOnly) {
      result = result.filter(p => p.availability.cars.available > 0 || p.availability.motorcycles.available > 0);
    }

    if (searchTerm) {
      result = result.filter((parking) => {
        const term = searchTerm.toLowerCase();
        const nameMatch = parking.name.toLowerCase().includes(term);
        if (nameMatch) return true;

        if (typeof parking.address === 'string') {
          return parking.address.toLowerCase().includes(term);
        } else if (typeof parking.address === 'object' && parking.address) {
          return (
            (parking.address.street && parking.address.street.toLowerCase().includes(term)) ||
            (parking.address.city && parking.address.city.toLowerCase().includes(term))
          );
        }
        return false;
      });
    }
    return result;
  }, [parkings, searchTerm, showAvailableOnly]);

  const renderItem = ({ item }: { item: Parking }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{
          typeof item.address === 'string' 
            ? item.address 
            : (item.address ? `${item.address.street}, ${item.address.city}` : 'Dirección no disponible')
        }</Text>
        <View style={styles.availabilityContainer}>
          {item.availability.cars.total > 0 && (
            <View style={styles.availabilityCard}>
              <Ionicons name="car-sport-outline" size={20} color={Colors.light.primary} style={styles.availabilityIcon} />
              <Text style={styles.availabilityCardText}>
                {item.availability.cars.available} / {item.availability.cars.total}
              </Text>
            </View>
          )}
          {item.availability.motorcycles.total > 0 && (
            <View style={styles.availabilityCard}>
              <Ionicons name="bicycle-outline" size={20} color={Colors.light.secondary} style={styles.availabilityIcon} />
              <Text style={styles.availabilityCardText}>
                {item.availability.motorcycles.available} / {item.availability.motorcycles.total}
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleItemActions(item)} style={styles.actionButton}>
        <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.gray} />
      </TouchableOpacity>
    </View>
  );

  if (!location && isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: Spacing.sm }}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  if (error && !isRefreshing) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Intentar de nuevo" onPress={startup} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controlPanel}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o dirección..."
          placeholderTextColor={Colors.light.gray}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
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
        <Text style={styles.label}>Radio de búsqueda: {(radius / 1000).toFixed(1)} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={500}
          maximumValue={20000}
          step={500}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor={Colors.light.primary}
          maximumTrackTintColor={Colors.light.lightGray}
        />
        <Button title="Buscar en esta área" onPress={handleManualSearch} disabled={isLoading} color={Colors.light.primary} />
      </View>
      
      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredAndSearchedParkings}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron estacionamientos.</Text>}
        />
      )}
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
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.medium,
    color: Colors.light.danger,
    textAlign: 'center',
    padding: Spacing.md,
  },
  controlPanel: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchInput: {
    height: 44,
    backgroundColor: Colors.light.background,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.medium,
    marginBottom: Spacing.md,
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
    marginVertical: Spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  itemContainer: {
    backgroundColor: Colors.light.card,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontSize: FontSize.large,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemSubtitle: {
    fontSize: FontSize.small,
    color: Colors.light.gray,
    marginTop: Spacing.xs,
  },
  availabilityContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  availabilityIcon: {
    marginRight: Spacing.xs,
  },
  availabilityCardText: {
    fontSize: FontSize.small,
    fontWeight: '600',
    color: Colors.light.text,
  },
  actionButton: {
    paddingLeft: Spacing.sm,
  },
  loader: {
    marginTop: Spacing.lg,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.medium,
    color: Colors.light.gray,
  },
});


