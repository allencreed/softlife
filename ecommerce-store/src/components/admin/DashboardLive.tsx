"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";

/**
 * Lightweight client wrapper that adds auto-refresh + a manual Refresh button
 * around server-rendered dashboard HTML.
 *
 * It polls /api/admin/dashboard?range=... via SWR every 30s and toggles a
 * subtle "refreshing…" indicator. If the route is missing or errors (expected
 * until the API is built), it silently keeps the server-rendered `children`
 * and never blanks the page.
 */

type FetcherResult = unknown | null;

const fetcher = async (url: string): Promise<FetcherResult> => {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as FetcherResult;
  } catch {
    return null;
  }
};

function formatTime(value: Date): string {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface DashboardLiveProps {
  children: ReactNode;
  range?: string;
}

export function DashboardLive({ children, range }: DashboardLiveProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isValidating, mutate } = useSWR<FetcherResult>(
    `/api/admin/dashboard?range=${range ?? "all"}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (data != null) setLastUpdated(new Date());
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {isValidating ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
              refreshing…
            </span>
          ) : (
            <span>{lastUpdated ? `Last updated ${formatTime(lastUpdated)}` : "Live"}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink transition-colors hover:bg-muted/50"
        >
          Refresh
        </button>
      </div>
      {children}
    </div>
  );
}
