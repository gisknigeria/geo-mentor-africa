export type Coordinates = { latitude: number; longitude: number };

export function decodeGeometry(value: unknown): Coordinates | null {
  if (value && typeof value === "object" && "coordinates" in value) {
    const coordinates = (value as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      return validCoordinates(Number(coordinates[1]), Number(coordinates[0]));
    }
  }

  if (typeof value !== "string") return null;

  const wkt = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (wkt) return validCoordinates(Number(wkt[2]), Number(wkt[1]));

  const hex = value.replace(/^SRID=\d+;/i, "").replace(/^\\x/i, "");
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length < 42 || hex.length % 2 !== 0) return null;

  try {
    const bytes = Uint8Array.from(hex.match(/../g)!, (part) => Number.parseInt(part, 16));
    const littleEndian = bytes[0] === 1;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const type = view.getUint32(1, littleEndian);
    const hasSrid = (type & 0x20000000) !== 0;
    const coordinateOffset = 5 + (hasSrid ? 4 : 0);
    return validCoordinates(view.getFloat64(coordinateOffset + 8, littleEndian), view.getFloat64(coordinateOffset, littleEndian));
  } catch {
    return null;
  }
}

function validCoordinates(latitude: number, longitude: number): Coordinates | null {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0 && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? { latitude, longitude }
    : null;
}
