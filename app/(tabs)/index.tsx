import { Asset } from "expo-asset";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { LeafletView, MapShape, MapShapeType } from "react-native-leaflet-view";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import getDigitransitLayer from "../layers/digitransit";
import { latLngToTile, tileToBounds } from "../utils/getGrid";

const STORAGE_KEY = "captured_tiles_v1";

const App: React.FC = () => {
  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  const [digitransitLayer, setDigitransitLayer] = useState<any>();
  const [tiles, setTiles] = useState<Map<string, number>>(new Map());
  const [renderShapes, setRenderShapes] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<any>();
  
  const timeoutRef = React.useRef<any>(null);
  const saveTimeout = React.useRef<any>(null);
  
  async function saveTilesToStorage(tilesMap: Map<string, number>) {
    try {
      const obj = Object.fromEntries(tilesMap);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn("Failed to save tiles", e);
    }
  }

  async function loadTilesFromStorage(): Promise<Map<string, number>> {
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

  function getVisibleTiles(bounds: any) {
    const shapes: any[] = [];

    const min = latLngToTile(bounds._southWest.lat, bounds._southWest.lng);
    const max = latLngToTile(bounds._northEast.lat, bounds._northEast.lng);

    for (let x = min.x; x <= max.x; x++) {
      for (let y = min.y; y <= max.y; y++) {
        const id = `${x}_${y}`;

        const isCaptured = tiles.get(id) === 1;
        
        shapes.push({
          id,
          shapeType: MapShapeType.RECTANGLE,
          color: isCaptured ? "#00c853" : "#999",
          fillColor: isCaptured ? "#00c853" : "#999",
          fillOpacity: isCaptured ? 0.3 : 0.1,
          bounds: tileToBounds(x, y),
        } as MapShape);
      }
    }

    return shapes;
  }

  function captureTile(lat: number, lng: number) {
    const { x, y } = latLngToTile(lat, lng);
    const id = `${x}_${y}`;

    setTiles(prev => {
      if (prev.get(id) === 1) return prev;

      const next = new Map(prev);
      next.set(id, 1);

      // save async
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveTilesToStorage(next);
      }, 300);

      // immediately update
      setRenderShapes(current =>
        current.map(shape =>
          shape.id === id
            ? {
                ...shape,
                color: "#00c853",
                fillColor: "#00c853",
                fillOpacity: 0.3,
              }
            : shape
        )
      );

      return next;
    });
  }

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const loaded = await loadTilesFromStorage();
      if (isMounted) setTiles(loaded);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDigitransit = async () => {
      const layer = await getDigitransitLayer();
      if (layer) setDigitransitLayer(layer);
    }
    loadDigitransit();

    const loadHtml = async () => {
      try {
        const asset = Asset.fromModule(
          require("@/assets/leaflet.html")
        );

        await asset.downloadAsync();

        if (!asset.localUri) {
          throw new Error("Asset localUri is null");
        }

        const response = await fetch(asset.localUri);
        const htmlContent = await response.text();

        if (isMounted) {
          setWebViewContent(htmlContent);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error loading HTML", String(error));
      }
    };
    loadHtml();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 5, // meters
        },
        (location) => {
          setUserPos(location.coords);
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!userPos) return;

    captureTile(userPos.latitude, userPos.longitude);
  }, [userPos]);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />;
  }

  if (!digitransitLayer) {
    return <ActivityIndicator size="large" />;
  }
  
  const userMarker =
    userPos?.latitude && userPos?.longitude
      ? [{
          id: "user-marker",
          shapeType: MapShapeType.CIRCLE,
          color: "#2196f3",
          fillColor: "#2196f3",
          fillOpacity: 0.6,
          radius: 20,
          center: {
            lat: userPos.latitude,
            lng: userPos.longitude,
          },
        }]
      : [];
    
  return (
    <LeafletView
      source={{ html: webViewContent }}
      mapLayers={[
        digitransitLayer
      ]}
      zoom={12}
      zoomControl={false}
      doDebug={false}
      mapShapes={[
        ...renderShapes,
        ...userMarker
      ]}
      onMessageReceived={(message) => {
        const { event, payload } = message;

        // CLICK -> capture tile
        if (event === "onMapClicked" && payload?.touchLatLng) {
          captureTile(payload.touchLatLng.lat, payload.touchLatLng.lng);

          if (payload.bounds) {
            setRenderShapes(getVisibleTiles(payload.bounds));
          }

          return;
        }

        // MOVE -> update grid
        if (event !== "onMoveEnd") return;
        if (!payload?.bounds) return;

        const bounds = payload.bounds;
        const currentZoom = payload.zoom ?? 12;

        clearTimeout(timeoutRef.current);

        if (currentZoom < 13) {
          setRenderShapes([]);
          return;
        }

        timeoutRef.current = setTimeout(() => {
          setRenderShapes(getVisibleTiles(bounds));
        }, 80);
      }}
    />
  );
};

export default App;
