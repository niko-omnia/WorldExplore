import { MapShape, MapShapeType } from "react-native-leaflet-view";
import { latLngToTile, tileToBounds } from "./getGrid";

import { saveTilesToStorage } from "./tileStorage";

const defaultColor = "#00000010";
const defaultFillColor = "#fff";
const defaultOpacity = 0;

const capturedColor = "#00c853";
const capturedFillColor = "#00c853";
const capturedOpacity = 0.3;

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
                color: isCaptured ? capturedColor : defaultColor,
                fillColor: isCaptured ? capturedFillColor : defaultFillColor,
                fillOpacity: isCaptured ? capturedOpacity : defaultOpacity,
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
    setRenderShapes: any,
    byClick?: boolean
) {
    const { x, y } = latLngToTile(lat, lng);
    const id = `${x}_${y}`;

    setTiles((prev: any) => {
        if (prev.get(id) === 1 && !byClick) return prev;

        const next: any = new Map(prev);
        next.set(id, byClick ? prev.get(id) === 1 ? null : 1 : 1);

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
