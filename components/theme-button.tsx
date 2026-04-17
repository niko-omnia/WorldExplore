import { ThemedText } from "@/components/themed-text";
import { Pressable } from "react-native";

import setTheme from "../app/utils/setTheme";

interface ThemeButtonType {
  text: string,
  theme: any,
  styles: any,
  id: string,
  selectedTheme: string,
  setSelectedTheme: (id: string) => void,
};

export function ThemeButton({ text, theme, styles, id, selectedTheme, setSelectedTheme }: ThemeButtonType) {
  return (
    <Pressable
      onPress={() => {
        setTheme(id);
        setSelectedTheme(id);
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? theme.tint + "33"
            : theme.backgroundElement,
          borderColor: id === selectedTheme ? theme.text : theme.border,
        },
      ]}
    >
      <ThemedText style={{
        width: "100%",
        textAlign: "center",
      }}>
        {text}
      </ThemedText>
    </Pressable>
  );
}
