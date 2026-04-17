import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const THEME_KEY = "app_theme";

export default function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);

      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    };

    loadTheme();
  }, [systemScheme]);

  return theme;
}
