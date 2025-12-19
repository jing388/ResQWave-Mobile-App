import React from 'react';
import { Marker, Polyline, Circle, Polygon } from 'react-native-maps';
import { Bus, Car, Bike, Flame, Wind } from 'lucide-react-native';
import { View, Text } from 'react-native';

// Public Transport Overlay Component
export const PublicTransportOverlay = ({ visible }: { visible: boolean }) => {
  const transportStops = [
    { id: 1, latitude: 14.765, longitude: 121.0392, name: 'Central Station' },
    { id: 2, latitude: 14.770, longitude: 121.044, name: 'North Terminal' },
    { id: 3, latitude: 14.760, longitude: 121.034, name: 'South Plaza' },
    { id: 4, latitude: 14.755, longitude: 121.029, name: 'East Hub' },
    { id: 5, latitude: 14.775, longitude: 121.049, name: 'West Terminal' },
    { id: 6, latitude: 14.750, longitude: 121.024, name: 'Airport Station' },
    { id: 7, latitude: 14.780, longitude: 121.054, name: 'University Station' },
    { id: 8, latitude: 14.745, longitude: 121.019, name: 'Mall Transit' },
  ];

  if (!visible) return null;

  return (
    <>
      {transportStops.map(stop => (
        <Marker
          key={stop.id}
          coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          title={stop.name}
          description="Public Transport Stop"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: '#8B5CF6',
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Bus size={20} color="#FFFFFF" />
          </View>
        </Marker>
      ))}
    </>
  );
};

// Traffic Overlay Component
export const TrafficOverlay = ({ visible }: { visible: boolean }) => {
  const trafficRoutes = [
    {
      id: 1,
      coordinates: [
        { latitude: 14.765, longitude: 121.0392 },
        { latitude: 14.770, longitude: 121.044 },
        { latitude: 14.775, longitude: 121.049 },
        { latitude: 14.780, longitude: 121.054 },
      ],
      congestion: 'heavy'
    },
    {
      id: 2,
      coordinates: [
        { latitude: 14.760, longitude: 121.034 },
        { latitude: 14.765, longitude: 121.039 },
        { latitude: 14.770, longitude: 121.044 },
      ],
      congestion: 'moderate'
    },
    {
      id: 3,
      coordinates: [
        { latitude: 14.755, longitude: 121.029 },
        { latitude: 14.760, longitude: 121.034 },
        { latitude: 14.765, longitude: 121.039 },
      ],
      congestion: 'light'
    },
    {
      id: 4,
      coordinates: [
        { latitude: 14.745, longitude: 121.019 },
        { latitude: 14.750, longitude: 121.024 },
        { latitude: 14.755, longitude: 121.029 },
      ],
      congestion: 'heavy'
    },
  ];

  const getTrafficColor = (congestion: string) => {
    switch (congestion) {
      case 'heavy': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'light': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!visible) return null;

  return (
    <>
      {trafficRoutes.map(route => (
        <Polyline
          key={route.id}
          coordinates={route.coordinates}
          strokeColor={getTrafficColor(route.congestion)}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      {trafficRoutes.map((route, index) => (
        <Marker
          key={`traffic-${route.id}`}
          coordinate={route.coordinates[Math.floor(route.coordinates.length / 2)]}
          title={`Traffic: ${route.congestion}`}
          description={`${route.congestion.charAt(0).toUpperCase() + route.congestion.slice(1)} traffic`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: getTrafficColor(route.congestion),
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Car size={18} color="#FFFFFF" />
          </View>
        </Marker>
      ))}
    </>
  );
};

// Cycling Routes Overlay Component
export const CyclingOverlay = ({ visible }: { visible: boolean }) => {
  const cyclingRoutes = [
    {
      id: 1,
      coordinates: [
        { latitude: 14.765, longitude: 121.0392 },
        { latitude: 14.768, longitude: 121.042 },
        { latitude: 14.772, longitude: 121.046 },
        { latitude: 14.776, longitude: 121.050 },
      ],
      name: 'Bike Route 1 - Coastal Path'
    },
    {
      id: 2,
      coordinates: [
        { latitude: 14.760, longitude: 121.034 },
        { latitude: 14.763, longitude: 121.037 },
        { latitude: 14.767, longitude: 121.041 },
        { latitude: 14.771, longitude: 121.045 },
      ],
      name: 'Bike Route 2 - City Loop'
    },
    {
      id: 3,
      coordinates: [
        { latitude: 14.755, longitude: 121.029 },
        { latitude: 14.758, longitude: 121.032 },
        { latitude: 14.762, longitude: 121.036 },
      ],
      name: 'Bike Route 3 - Park Trail'
    },
    {
      id: 4,
      coordinates: [
        { latitude: 14.745, longitude: 121.019 },
        { latitude: 14.748, longitude: 121.022 },
        { latitude: 14.752, longitude: 121.026 },
        { latitude: 14.756, longitude: 121.030 },
      ],
      name: 'Bike Route 4 - Airport Connector'
    },
  ];

  if (!visible) return null;

  return (
    <>
      {cyclingRoutes.map(route => (
        <Polyline
          key={route.id}
          coordinates={route.coordinates}
          strokeColor="#10B981"
          strokeWidth={8}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      {cyclingRoutes.map(route => (
        <Marker
          key={`bike-${route.id}`}
          coordinate={route.coordinates[0]}
          title={route.name}
          description="Cycling Route"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: '#10B981',
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Bike size={18} color="#FFFFFF" />
          </View>
        </Marker>
      ))}
    </>
  );
};

// 3D Buildings Overlay Component (Simplified - shows building footprints)
export const Buildings3DOverlay = ({ visible }: { visible: boolean }) => {
  const buildings = [
    {
      id: 1,
      coordinates: [
        { latitude: 14.765, longitude: 121.0392 },
        { latitude: 14.766, longitude: 121.0392 },
        { latitude: 14.766, longitude: 121.0402 },
        { latitude: 14.765, longitude: 121.0402 },
      ],
      height: 50,
      name: 'Central Tower'
    },
    {
      id: 2,
      coordinates: [
        { latitude: 14.767, longitude: 121.0412 },
        { latitude: 14.768, longitude: 121.0412 },
        { latitude: 14.768, longitude: 121.0422 },
        { latitude: 14.767, longitude: 121.0422 },
      ],
      height: 30,
      name: 'Office Complex'
    },
    {
      id: 3,
      coordinates: [
        { latitude: 14.762, longitude: 121.0362 },
        { latitude: 14.763, longitude: 121.0362 },
        { latitude: 14.763, longitude: 121.0372 },
        { latitude: 14.762, longitude: 121.0372 },
      ],
      height: 45,
      name: 'Residential Block A'
    },
    {
      id: 4,
      coordinates: [
        { latitude: 14.769, longitude: 121.0432 },
        { latitude: 14.770, longitude: 121.0432 },
        { latitude: 14.770, longitude: 121.0442 },
        { latitude: 14.769, longitude: 121.0442 },
      ],
      height: 25,
      name: 'Shopping Mall'
    },
    {
      id: 5,
      coordinates: [
        { latitude: 14.754, longitude: 121.0282 },
        { latitude: 14.755, longitude: 121.0282 },
        { latitude: 14.755, longitude: 121.0292 },
        { latitude: 14.754, longitude: 121.0292 },
      ],
      height: 60,
      name: 'Skyscraper Plaza'
    },
    {
      id: 6,
      coordinates: [
        { latitude: 14.772, longitude: 121.0462 },
        { latitude: 14.773, longitude: 121.0462 },
        { latitude: 14.773, longitude: 121.0472 },
        { latitude: 14.772, longitude: 121.0472 },
      ],
      height: 35,
      name: 'Tech Hub'
    },
  ];

  if (!visible) return null;

  return (
    <>
      {buildings.map(building => (
        <Polygon
          key={building.id}
          coordinates={building.coordinates}
          strokeColor="#F59E0B"
          fillColor="#F59E0B50"
          strokeWidth={3}
        />
      ))}
      {buildings.map(building => (
        <Marker
          key={`building-${building.id}`}
          coordinate={building.coordinates[0]}
          title={building.name}
          description={`3D Building - ${building.height}m height`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: '#F59E0B',
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              3D
            </Text>
          </View>
        </Marker>
      ))}
    </>
  );
};

// Wildfires Overlay Component
export const WildfiresOverlay = ({ visible }: { visible: boolean }) => {
  const wildfires = [
    {
      id: 1,
      latitude: 14.770,
      longitude: 121.045,
      severity: 'high',
      radius: 2500,
      name: 'Forest Fire North'
    },
    {
      id: 2,
      latitude: 14.755,
      longitude: 121.035,
      severity: 'medium',
      radius: 1500,
      name: 'Brush Fire East'
    },
    {
      id: 3,
      latitude: 14.780,
      longitude: 121.055,
      severity: 'low',
      radius: 800,
      name: 'Small Fire West'
    },
    {
      id: 4,
      latitude: 14.740,
      longitude: 121.020,
      severity: 'high',
      radius: 3000,
      name: 'Wildfire South'
    },
    {
      id: 5,
      latitude: 14.785,
      longitude: 121.060,
      severity: 'medium',
      radius: 1200,
      name: 'Controlled Burn Area'
    },
  ];

  const getFireColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#DC2626';
      case 'medium': return '#F97316';
      case 'low': return '#FCD34D';
      default: return '#6B7280';
    }
  };

  const getFireOpacity = (severity: string) => {
    switch (severity) {
      case 'high': return 0.5;
      case 'medium': return 0.35;
      case 'low': return 0.25;
      default: return 0.2;
    }
  };

  if (!visible) return null;

  return (
    <>
      {wildfires.map(fire => (
        <Circle
          key={fire.id}
          center={{ latitude: fire.latitude, longitude: fire.longitude }}
          radius={fire.radius}
          strokeColor={getFireColor(fire.severity)}
          fillColor={getFireColor(fire.severity) + Math.floor(getFireOpacity(fire.severity) * 255).toString(16).padStart(2, '0')}
          strokeWidth={3}
        />
      ))}
      {wildfires.map(fire => (
        <Marker
          key={`marker-${fire.id}`}
          coordinate={{ latitude: fire.latitude, longitude: fire.longitude }}
          title={fire.name}
          description={`${fire.severity.charAt(0).toUpperCase() + fire.severity.slice(1)} severity - ${fire.radius}m radius`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: getFireColor(fire.severity),
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Flame size={20} color="#FFFFFF" />
          </View>
        </Marker>
      ))}
    </>
  );
};

// Air Quality Overlay Component
export const AirQualityOverlay = ({ visible }: { visible: boolean }) => {
  const airQualityStations = [
    {
      id: 1,
      latitude: 14.765,
      longitude: 121.0392,
      aqi: 85,
      name: 'Central Station'
    },
    {
      id: 2,
      latitude: 14.770,
      longitude: 121.044,
      aqi: 120,
      name: 'North Station'
    },
    {
      id: 3,
      latitude: 14.760,
      longitude: 121.034,
      aqi: 45,
      name: 'South Station'
    },
    {
      id: 4,
      latitude: 14.755,
      longitude: 121.029,
      aqi: 165,
      name: 'East Station'
    },
    {
      id: 5,
      latitude: 14.775,
      longitude: 121.049,
      aqi: 35,
      name: 'West Station'
    },
    {
      id: 6,
      latitude: 14.750,
      longitude: 121.024,
      aqi: 210,
      name: 'Airport Station'
    },
    {
      id: 7,
      latitude: 14.780,
      longitude: 121.054,
      aqi: 55,
      name: 'University Station'
    },
    {
      id: 8,
      latitude: 14.745,
      longitude: 121.019,
      aqi: 95,
      name: 'Mall Station'
    },
  ];

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10B981'; // Good
    if (aqi <= 100) return '#F59E0B'; // Moderate
    if (aqi <= 150) return '#F97316'; // Unhealthy for sensitive
    if (aqi <= 200) return '#EF4444'; // Unhealthy
    return '#7C3AED'; // Very unhealthy
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  if (!visible) return null;

  return (
    <>
      {airQualityStations.map(station => (
        <Circle
          key={station.id}
          center={{ latitude: station.latitude, longitude: station.longitude }}
          radius={1800}
          strokeColor={getAQIColor(station.aqi)}
          fillColor={getAQIColor(station.aqi) + '40'}
          strokeWidth={3}
        />
      ))}
      {airQualityStations.map(station => (
        <Marker
          key={`marker-${station.id}`}
          coordinate={{ latitude: station.latitude, longitude: station.longitude }}
          title={station.name}
          description={`AQI: ${station.aqi} - ${getAQILabel(station.aqi)}`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{
            backgroundColor: getAQIColor(station.aqi),
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Wind size={20} color="#FFFFFF" />
          </View>
        </Marker>
      ))}
    </>
  );
};
