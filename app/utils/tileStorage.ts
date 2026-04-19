import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "captured_tiles_v1";

export async function saveTilesToStorage(tilesMap: Map<string, number>) {
    try {
        const obj = Object.fromEntries(tilesMap);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn("Failed to save tiles", e);
    }
}

export async function loadTilesFromStorage(): Promise<Map<string, number>> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) return new Map();

        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed));
    } catch (e) {
        console.warn("Failed to load tiles", e);
        return new Map();
    }
}
