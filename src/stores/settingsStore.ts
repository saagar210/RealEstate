import { create } from "zustand";
import { getSetting, setSetting } from "@/lib/tauri";
import { SETTING_KEYS } from "@/lib/constants";
import type { ListingStyle, ListingTone, ListingLength } from "@/lib/types";

type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

interface SettingsState {
  apiKey: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  brokerageName: string;
  defaultStyle: ListingStyle;
  defaultTone: ListingTone;
  defaultLength: ListingLength;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  saveSetting: (key: SettingKey, value: string) => Promise<void>;
}

const keyToStateField: Record<SettingKey, keyof Omit<SettingsState, "isLoaded" | "loadSettings" | "saveSetting">> = {
  [SETTING_KEYS.API_KEY]: "apiKey",
  [SETTING_KEYS.AGENT_NAME]: "agentName",
  [SETTING_KEYS.AGENT_PHONE]: "agentPhone",
  [SETTING_KEYS.AGENT_EMAIL]: "agentEmail",
  [SETTING_KEYS.BROKERAGE_NAME]: "brokerageName",
  [SETTING_KEYS.DEFAULT_STYLE]: "defaultStyle",
  [SETTING_KEYS.DEFAULT_TONE]: "defaultTone",
  [SETTING_KEYS.DEFAULT_LENGTH]: "defaultLength",
};

const ALL_KEYS = Object.values(SETTING_KEYS);

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: "",
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  brokerageName: "",
  defaultStyle: "luxury",
  defaultTone: "warm",
  defaultLength: "medium",
  isLoaded: false,

  loadSettings: async () => {
    const results = await Promise.all(
      ALL_KEYS.map(async (key) => {
        try {
          const value = await getSetting(key);
          return [key, value] as const;
        } catch {
          return [key, ""] as const;
        }
      })
    );

    const updates: Record<string, string> = {};
    for (const [key, value] of results) {
      const field = keyToStateField[key];
      updates[field] = value;
    }

    set({ ...updates, isLoaded: true });
  },

  saveSetting: async (key: SettingKey, value: string) => {
    await setSetting(key, value);
    const field = keyToStateField[key];
    set({ [field]: value });
  },
}));
