import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function setTheme(id: string) {
    if (id !== "dark" && id !== "light") id = "";
    await AsyncStorage.setItem("app_theme", id);
}
