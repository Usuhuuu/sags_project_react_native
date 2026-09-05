import axiosInstance from "@/hooks/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "hall_fav";

interface FavoriteResponse {
  favData: {
    hallId: string;
    isFavorite: boolean;
  }[];
}

interface FavoritesState {
  favoriteIds: Set<string>;
  isLoaded: boolean;
  isSyncing: boolean;

  load: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),
  isLoaded: false,
  isSyncing: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      // No cache → fetch backend
      if (raw === null) {
        set({ isSyncing: true });
        const response =
          await axiosInstance.get<FavoriteResponse>("/hall/favorite");
        const ids =
          response.data.favData
            .filter((fav) => fav.isFavorite)
            .map((fav) => fav.hallId) ?? [];
        const next = new Set(ids);
        set({ favoriteIds: next, isLoaded: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        console.log("Favorites cache updated", [...next]);
        return;
      }

      // Cache exists → use it
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        const ids = parsed.filter((id): id is string => typeof id === "string");

        set({
          favoriteIds: new Set(ids),
          isLoaded: true,
        });
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      set({
        isLoaded: true,
      });
    } finally {
      set({
        isSyncing: false,
      });
    }
  },

  toggle: async (id: string) => {
    const previous = get().favoriteIds;
    const next = new Set(previous);

    const wasFavorite = next.has(id);

    // Optimistic UI
    if (wasFavorite) {
      next.delete(id);
    } else {
      next.add(id);
    }

    set({
      favoriteIds: next,
    });

    try {
      if (wasFavorite) {
        // Unfavorite API
        await axiosInstance.delete(`/hall/favorite`, { data: { id } });
      } else {
        // Favorite API
        await axiosInstance.post("/hall/favorite", { id });
      }

      // Save only after server succeeds
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch (error) {
      console.error("Failed to update favorite:", error);

      // Rollback if API failed
      set({
        favoriteIds: previous,
      });
    }
  },

  isFavorite: (id: string) => {
    return get().favoriteIds.has(id);
  },
}));
