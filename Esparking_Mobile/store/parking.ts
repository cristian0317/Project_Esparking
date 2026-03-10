import { create } from 'zustand';
import { Parking } from '../services/parkingService';

interface ParkingState {
  parkings: Parking[];
  setParkings: (parkings: Parking[]) => void;
  getParkingById: (id: string) => Parking | undefined;
}

export const useParkingStore = create<ParkingState>((set, get) => ({
  parkings: [],
  setParkings: (parkings) => set({ parkings }),
  getParkingById: (id) => get().parkings.find((p) => p._id === id),
}));
