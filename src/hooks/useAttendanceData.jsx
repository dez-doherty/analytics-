import { useState, useEffect, useCallback } from "react";
import collectAttendance from "./attendance/getAllAttendance";
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

  useEffect(() => {
    chrome.storage.local.get([CACHE_KEY], (items) => {
      const cached = Array.isArray(items?.[CACHE_KEY]) ? items[CACHE_KEY] : [];
      setRaw(cached);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(() => {
    if (import.meta.env.DEV) return;
    setRaw((prev) => {
      const merged = merge(prev, collectAttendance());
      try {
        chrome.storage.local.set({ [CACHE_KEY]: merged });
      } catch (err) {
        setError(err);
      }
      return merged;
    });
  }, []);

  return { raw, loading, error, refresh };
}
