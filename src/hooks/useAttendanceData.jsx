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

    if (
      typeof chrome === "undefined" ||
      !chrome.storage ||
      !chrome.storage.local
    ) {
      setError(
        new Error(
          "chrome.storage.local is not available. Run the app as an extension.",
        ),
      );
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const storage = chrome.storage.local;

    storage.get([CACHE_KEY, "attendanceTime"], (items) => {
      const cached = Array.isArray(items?.[CACHE_KEY]) ? items[CACHE_KEY] : [];
      setRaw(cached);
      setLoading(false);
      if (items?.attendanceTime) setLastUpdated(items.attendanceTime);
    });

    getAllAttendance()
      .then((data) => {
        if (!mounted) return;
        try {
          storage.set({ [CACHE_KEY]: data, attendanceTime: Date.now() });
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
    try {
      const data = await getAllAttendance();
      const merged = merge(raw, data);
      try {
        chrome.storage.local.set({
          [CACHE_KEY]: merged,
          attendanceTime: Date.now(),
        });
      } catch (e) {
        // ignore
      }
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
