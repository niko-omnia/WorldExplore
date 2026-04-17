import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function getDigitransitKey(): Promise<string | null> {
  const key = await AsyncStorage.getItem("DIGITRANSIT_API_KEY");
  return key;
}
