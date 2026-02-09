import { create } from "zustand";
import type { Property, CreatePropertyInput } from "@/lib/types";
import * as tauri from "@/lib/tauri";

interface PropertyState {
  properties: Property[];
  selectedPropertyId: string | null;
  isLoading: boolean;
  fetchProperties: () => Promise<void>;
  createProperty: (input: CreatePropertyInput) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  setSelectedPropertyId: (id: string | null) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  selectedPropertyId: null,
  isLoading: false,

  fetchProperties: async () => {
    set({ isLoading: true });
    try {
      const properties = await tauri.listProperties();
      set({ properties });
    } finally {
      set({ isLoading: false });
    }
  },

  createProperty: async (input: CreatePropertyInput) => {
    const property = await tauri.createProperty(input);
    set((state) => ({ properties: [property, ...state.properties] }));
    return property;
  },

  deleteProperty: async (id: string) => {
    await tauri.deleteProperty(id);
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
      selectedPropertyId:
        state.selectedPropertyId === id ? null : state.selectedPropertyId,
    }));
  },

  setSelectedPropertyId: (id: string | null) => {
    set({ selectedPropertyId: id });
  },
}));
