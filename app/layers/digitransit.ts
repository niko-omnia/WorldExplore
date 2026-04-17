import { MapLayer } from "react-native-leaflet-view";
import getDigitransitKey from "../utils/getDigitransitKey";

export default async function getDigitransitLayer() {
  const digitransitKey = await getDigitransitKey();

  return {
    id: "digitransit-base",
    baseLayer: true,
    baseLayerIsChecked: true,
    baseLayerName: "Digitransit Map",
    url: `https://cdn.digitransit.fi/map/v3/hsl-map/{z}/{x}/{y}@2x.png?digitransit-subscription-key=${digitransitKey}`,
    attribution: "© Digitransit / OpenStreetMap",
    minZoom: 0,
    maxZoom: 19,
    opacity: 1,
    zIndex: 1,
  } as MapLayer;
}
