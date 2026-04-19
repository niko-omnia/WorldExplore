import * as Location from "expo-location";

export default async function(setUserPos: any) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    return await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 5,
        },
        (location) => {
            setUserPos(location.coords);
        }
    );
}
