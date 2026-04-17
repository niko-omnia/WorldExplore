import { Asset } from "expo-asset";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { LeafletView } from "react-native-leaflet-view";

import getDigitransitLayer from "../layers/digitransit";

const DEFAULT_LOCATION = {
  latitude: 60.1699,
  longitude: 24.9384,
};

const App: React.FC = () => {
  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  const [digitransitLayer, setDigitransitLayer] = useState<any>();
  
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

  if (!webViewContent) {
    return <ActivityIndicator size="large" />;
  }

  if (!digitransitLayer) {
    return <ActivityIndicator size="large" />;
  }
  
  return (
    <LeafletView
      source={{ html: webViewContent }}
      mapCenterPosition={{
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }}
      mapLayers={[
        digitransitLayer
      ]}
      zoom={12}
      zoomControl={false}
      doDebug={false}
    />
  );
};

export default App;
