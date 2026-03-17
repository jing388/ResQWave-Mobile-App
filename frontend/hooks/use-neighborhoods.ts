import { useState, useEffect, useCallback } from 'react';
import { MarkerData } from '@/types/neighborhood';
import {
  fetchOwnNeighborhood,
  fetchOtherNeighborhoods,
} from '@/services/neighborhood-service';

interface UseNeighborhoodsReturn {
  markers: MarkerData[];
  ownNeighborhood: MarkerData | null;
  otherNeighborhoods: MarkerData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useNeighborhoods = (): UseNeighborhoodsReturn => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [ownNeighborhood, setOwnNeighborhood] = useState<MarkerData | null>(
    null,
  );
  const [otherNeighborhoods, setOtherNeighborhoods] = useState<MarkerData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNeighborhoods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🗺️ Fetching neighborhoods data...');

      // Fetch own and other neighborhoods in parallel with error handling
      const [own, others] = await Promise.all([
        fetchOwnNeighborhood().catch((err) => {
          console.warn('⚠️ Could not fetch own neighborhood:', err.message);
          return null;
        }),
        fetchOtherNeighborhoods().catch((err) => {
          console.warn('⚠️ Could not fetch other neighborhoods:', err.message);
          return [];
        }),
      ]);

      console.log('✅ Own neighborhood:', own);
      console.log('✅ Own neighborhood TYPE:', own?.type);
      console.log('✅ Other neighborhoods:', others.length);

      if (own) {
        console.log('🔍 [useNeighborhoods] Own marker details:', {
          id: own.id,
          neighborhoodID: own.neighborhoodID,
          type: own.type,
          focalPerson: own.focalPersonName
        });
      }

      setOwnNeighborhood(own);
      setOtherNeighborhoods(others);

      // Combine all markers
      const allMarkers: MarkerData[] = [];
      if (own) allMarkers.push(own);
      allMarkers.push(...others);

      setMarkers(allMarkers);
    } catch (err: any) {
      console.error('❌ Error fetching neighborhoods:', err);
      setError(err.message || 'Failed to load neighborhoods');
      // Set empty arrays to prevent crashes
      setMarkers([]);
      setOwnNeighborhood(null);
      setOtherNeighborhoods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNeighborhoods();
  }, [fetchNeighborhoods]);

  return {
    markers,
    ownNeighborhood,
    otherNeighborhoods,
    isLoading,
    error,
    refetch: fetchNeighborhoods,
  };
};
