import { Linking, Platform, Alert } from 'react-native';
import { Parking } from '../services/parkingService';

export const openMapsApp = async (parking: Parking | undefined) => {
  if (!parking) {
    Alert.alert('Error', 'No se encontró la información del estacionamiento.');
    return;
  }

  const [longitude, latitude] = parking.location.coordinates;
  const label = parking.name;
  
  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
  const url = Platform.select({
    ios: `${scheme}${label}@${latitude},${longitude}`,
    android: `${scheme}${latitude},${longitude}(${label})`
  });

  if (url) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `No se puede abrir la aplicación de mapas.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar abrir la aplicación de mapas.');
    }
  }
};
