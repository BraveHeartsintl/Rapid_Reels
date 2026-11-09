"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { errorMessage } from "@/lib/format";

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Runs an async loader and tracks loading / error state.
 * Pass `enabled = false` to wait (e.g. until the signed-in uid is known).
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  enabled = true,
): AsyncState<T> {
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error: string | null }>({
    data: undefined,
    loading: enabled,
    error: null,
  });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  // Declared before the loading effect so it always sees the latest loader.
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, loading: true, error: null }));
    loaderRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ data: undefined, loading: false, error: errorMessage(e) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, loading: enabled ? state.loading : false, reload };
}

/** Reads the URL query string on the client. `ready` is false until hydrated. */
export function useQuery(): { ready: boolean; get: (name: string) => string | null } {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return {
    ready: params !== null,
    get: (name: string) => params?.get(name) ?? null,
  };
}
