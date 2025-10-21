import { useState, useEffect } from 'react';
import { karkunanService, Karkunan, KarkunanQueryParams } from '../services/Karkuns/karkunan-service';

export const useKarkunan = (params?: KarkunanQueryParams) => {
  const [data, setData] = useState<Karkunan[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKarkunans = async (queryParams?: KarkunanQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await karkunanService.fetchKarkunans(queryParams || params);
      setData(response.data || []);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch karkunan');
      console.error('Error fetching karkunan:', err);
    } finally {
      setLoading(false);
    }
  };

  const createKarkunan = async (karkunanData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await karkunanService.createKarkunan(karkunanData);
      // Refresh the list after creating
      await fetchKarkunans(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create karkunan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateKarkunan = async (id: number, karkunanData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await karkunanService.updateKarkunan(id, karkunanData);
      // Refresh the list after updating
      await fetchKarkunans(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update karkunan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteKarkunan = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await karkunanService.deleteKarkunan(id);
      // Refresh the list after deleting
      await fetchKarkunans(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete karkunan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getKarkunanById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await karkunanService.fetchKarkunanById(id);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch karkunan by ID');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (params) {
      fetchKarkunans(params);
    }
  }, [params?.page, params?.size, params?.search]);

  return {
    data,
    meta,
    loading,
    error,
    fetchKarkunans,
    createKarkunan,
    updateKarkunan,
    deleteKarkunan,
    getKarkunanById,
  };
}; 