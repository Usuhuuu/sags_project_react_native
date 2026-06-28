import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "sags_favorites";

interface FavoritesState {
  favoriteIds: Set<string>;
  isLoaded: boolean;
  load: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        set({ favoriteIds: new Set(arr), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  toggle: async (id: string) => {
    const prev = get().favoriteIds;
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ favoriteIds: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  },

  isFavorite: (id: string) => get().favoriteIds.has(id),
}));
