const API_URL = 'https://api-esparking-express.vercel.app/api';

export interface Parking {
  _id: string;
  name: string;
  address: string | {
    street: string;
    city: string;
    // Agrega otras propiedades si existen en la respuesta de la API y se utilizan
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  availability: {
    cars: {
      total: number;
      available: number;
    };
    motorcycles: {
      total: number;
      available: number;
    };
  };
}

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const getParkings = async (latitude: number, longitude: number, radius: number): Promise<Parking[]> => {
  // Defensive guard to prevent calls with invalid data
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    const errorMessage = `Invalid location data provided for search.`;
    console.error(errorMessage);
    // Throw a specific error that the UI can catch and display
    throw new Error(errorMessage);
  }

  try {
    const response = await fetch(`${API_URL}/parkings/mobile?lat=${latitude}&lng=${longitude}&maxDistance=${radius}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener los estacionamientos: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return data.parkings || data || [];
  } catch (error) {
    console.error('Error in getParkings:', error);
    throw error;
  }
};
