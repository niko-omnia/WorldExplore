import { MapShape, MapShapeType } from "react-native-leaflet-view";
import { latLngToTile, tileToBounds } from "./getGrid";

import { saveTilesToStorage } from "./tileStorage";

export function getVisibleTiles(bounds: any, tiles: any) {
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

export function captureTile(
    lat: number,
    lng: number,
    setTiles: any,
    saveTimeout: any,
    setRenderShapes: any
) {
    const { x, y } = latLngToTile(lat, lng);
    const id = `${x}_${y}`;

    setTiles((prev: any) => {
        if (prev.get(id) === 1) return prev;

        const next = new Map(prev);
        next.set(id, 1);

        // save async
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            saveTilesToStorage(next);
        }, 300);

        // immediately update
        setRenderShapes((current: any) =>
            current.map((shape: any) =>
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
