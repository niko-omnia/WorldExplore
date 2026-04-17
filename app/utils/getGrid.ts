const ORIGIN = {
  lat: 60.1699,
  lng: 24.9384,
};
const CELL_SIZE_M = 200;
const METERS_PER_DEGREE = 111320;

export function latLngToTile(lat: number, lng: number) {
  const latSize = CELL_SIZE_M / METERS_PER_DEGREE;
  const lngSize =
    CELL_SIZE_M /
    (METERS_PER_DEGREE * Math.cos(ORIGIN.lat * Math.PI / 180));

  const x = Math.floor((lat - ORIGIN.lat) / latSize);
  const y = Math.floor((lng - ORIGIN.lng) / lngSize);

  return { x, y };
}

export function tileToBounds(x: number, y: number) {
  const latSize = CELL_SIZE_M / METERS_PER_DEGREE;
  const lngSize =
    CELL_SIZE_M /
    (METERS_PER_DEGREE * Math.cos(ORIGIN.lat * Math.PI / 180));

  const lat = ORIGIN.lat + x * latSize;
  const lng = ORIGIN.lng + y * lngSize;

  return [
    [lat, lng],
    [lat + latSize, lng + lngSize],
  ];
}
