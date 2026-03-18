export function buildGoogleMapsLink(latitude: number, longitude: number): string {
  const coordinates = `${latitude},${longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
}
