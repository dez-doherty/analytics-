import { useState, useEffect, useCallback } from "react";
import getAllAttendance from "./attendance/getAllAttendance";
export { getAttendanceAcademicYears } from "./attendance/dateUtils";
export { getAttendanceChartData } from "./attendance/chartData";

const CACHE_KEY = "attendance";

function keyOf(entry) {
  return `${entry.module}|${entry.date}`;
}

function merge(existing, incoming) {
  const byKey = new Map();
  for (const e of existing) byKey.set(keyOf(e), e);
  for (const e of incoming) byKey.set(keyOf(e), e);
  return [...byKey.values()];
}

export function useAttendanceData() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    chrome.storage.local.get([CACHE_KEY, "attendanceTime"], (items) => {
      const cached = Array.isArray(items?.[CACHE_KEY]) ? items[CACHE_KEY] : [];
      setRaw(cached);
      setLoading(false);
      if (items?.attendanceTime) setLastUpdated(items.attendanceTime);
    });

    if (import.meta.env.DEV)
      return () => {
        mounted = false;
      };

    getAllAttendance()
      .then((data) => {
        if (!mounted) return;
        try {
          chrome.storage.local.set({
            [CACHE_KEY]: data,
            attendanceTime: Date.now(),
          });
        } catch (err) {
          /* ignore */
        }
        setRaw(data);
        setLastUpdated(Date.now());
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      });

    return () => {
      mounted = false;
    };
  }, []);
  const refresh = useCallback(async () => {
    if (import.meta.env.DEV) return;
    try {
      const data = await getAllAttendance();
      const merged = merge(raw, data);
      chrome.storage.local.set({
        [CACHE_KEY]: merged,
        attendanceTime: Date.now(),
      });
      setRaw(merged);
      setLastUpdated(Date.now());
      return merged;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [raw]);

  // Auto-refresh hourly
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const id = setInterval(
      () => {
        refresh().catch(() => {});
      },
      60 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [refresh]);

  return { raw, loading, error, refresh, lastUpdated };
}
