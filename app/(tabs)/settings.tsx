import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ThemeButton } from "../../components/theme-button";

const DIGITRANSIT_KEY = "DIGITRANSIT_API_KEY";
const THEME_KEY = "app_theme";

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [apiKey, setApiKey] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(DIGITRANSIT_KEY);
      if (saved) setApiKey(saved);

      const saved_theme = await AsyncStorage.getItem(THEME_KEY);
      if (saved_theme) setSelectedTheme(saved_theme);
    })();
  }, []);

  const saveKey = async () => {
    await AsyncStorage.setItem(DIGITRANSIT_KEY, apiKey);
  };

  if (selectedTheme === null) return;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.sectionsWrapper}>
          {/* APP SECTION */}
          <ThemedView>
            <ThemedText style={{ marginBottom: Spacing.two }}>
              App Theme
            </ThemedText>
            
            <ThemeButton
              id={""}
              text={"System Default"}
              theme={theme}
              styles={styles}
              selectedTheme={selectedTheme ?? ""}
              setSelectedTheme={setSelectedTheme}
            />
            <ThemedView style={styles.sectionsWrapper}></ThemedView>
            <ThemeButton
              id={"dark"}
              text={"Dark"}
              theme={theme}
              styles={styles}
              selectedTheme={selectedTheme ?? ""}
              setSelectedTheme={setSelectedTheme}
            />
            <ThemedView style={styles.sectionsWrapper}></ThemedView>
            <ThemeButton
              id={"light"}
              text={"Light"}
              theme={theme}
              styles={styles}
              selectedTheme={selectedTheme ?? ""}
              setSelectedTheme={setSelectedTheme}
            />
          </ThemedView>

          {/* DIGITRANSIT SECTION */}
          <ThemedView>
            <ThemedText style={{ marginBottom: Spacing.two }}>
              Digitransit API Key
            </ThemedText>

            <ThemedView
              style={[
                styles.inputCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter API key"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                style={[
                  styles.input,
                  { color: theme.text },
                ]}
              />
            </ThemedView>

            <View style={{ height: Spacing.two }} />

            <Pressable
              onPress={saveKey}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: pressed
                    ? theme.tint + "33"
                    : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText style={{
                width: "100%",
                textAlign: "center",
              }}>
                Save API Key
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },

  inputCard: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  input: {
    fontSize: 16,
    paddingVertical: 6,
  },

  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: "center",
  },
});
