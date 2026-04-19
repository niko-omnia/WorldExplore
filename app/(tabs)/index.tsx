import { Asset } from "expo-asset";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

import { LeafletView, MapShapeType } from "react-native-leaflet-view";
import getDigitransitLayer from "../layers/digitransit";

import { loadTilesFromStorage } from "../utils/tileStorage";
import { captureTile, getVisibleTiles } from "../utils/tiles";

import { LocationSubscription } from "expo-location";
import locationHandler from "../utils/location";

const App: React.FC = () => {
  // States
  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  const [digitransitLayer, setDigitransitLayer] = useState<any>();
  const [tiles, setTiles] = useState<Map<string, number>>(new Map());
  const [renderShapes, setRenderShapes] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<any>();

  const [startLat, setStartLat] = useState<number|null>();
  const [startLng, setStartLng] = useState<number|null>();
  const [startPosDone, setStartPosDone] = useState<boolean>(false);
  
  // Timeouts
  const timeoutRef = React.useRef<any>(null);
  const saveTimeout = React.useRef<any>(null);

  // Tile load from storage
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

  // Map render & display
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

  // Location tracking
  useEffect(() => {
    let subscription: LocationSubscription|null;

    (async () => {
      subscription = await locationHandler(setUserPos);
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Auto capture by location
  useEffect(() => {
    if (!userPos) return;

    captureTile(
      userPos.latitude,
      userPos.longitude, setTiles,
      saveTimeout,
      setRenderShapes
    );
  }, [userPos]);

  if (!webViewContent || !digitransitLayer) {
    return <ActivityIndicator size="large" />;
  }
  
  if (userPos && userPos.latitude && userPos.longitude) {
    if (!startPosDone) {
      setStartPosDone(true);
      
      setStartLat(userPos.latitude);
      setStartLng(userPos.longitude);

      setTimeout(() => {
        setStartLat(null);
        setStartLng(null);
      }, 1000);
    }
  }

  const userMarker =
    userPos?.latitude && userPos?.longitude
      ? [{
          id: "user-marker",
          shapeType: MapShapeType.CIRCLE,
          color: "#2196f3",
          fillColor: "#ffffff",
          fillOpacity: 1,
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
      mapCenterPosition={{
        lat: startLat,
        lng: startLng
      }}
      mapShapes={[
        ...renderShapes,
        ...userMarker
      ]}
      onMessageReceived={(message) => {
        const { event, payload } = message;

        // Capture tile by click
        if (event === "onMapClicked" && payload?.touchLatLng) {
          captureTile(
            payload.touchLatLng.lat,
            payload.touchLatLng.lng,
            setTiles,
            saveTimeout,
            setRenderShapes
          );

          if (payload.bounds) {
            setRenderShapes(getVisibleTiles(
              payload.bounds,
              tiles
            ));
          }

          return;
        }

        // Update grid on move
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
          setRenderShapes(getVisibleTiles(
            bounds,
            tiles
          ));
        }, 80);
      }}
    />
  );
};

export default App;
