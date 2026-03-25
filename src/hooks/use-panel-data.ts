"use client";

import { useState, useEffect } from "react";
import { usePanelContext } from "@/contexts/panel-context";

interface UsePanelDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePanelData<T>(
  endpoint: string,
  demoFallback: T
): UsePanelDataResult<T> {
  const { isDemo } = usePanelContext();
  const [data, setData] = useState<T>(demoFallback);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (isDemo) {
      setData(demoFallback);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`[usePanelData] ${endpoint}:`, err);
          setData(demoFallback);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, isDemo, fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => setFetchKey((k) => k + 1);

  return { data, loading, error, refetch };
}
