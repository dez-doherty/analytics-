import { useState, useEffect } from "react";
import getAllAttendance from "./attendance/getAllAttendance";
import mockData from "./attendance/mockData";
export { getAttendanceAcademicYears } from "./attendance/dateUtils";
export { getAttendanceChartData } from "./attendance/chartData";

export function useAttendanceData() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    if (import.meta.env.DEV) {
      setRaw(mockData);
      setLoading(false);
      return;
    }

    chrome.storage.local.get(["attendance", "attendanceTime"], (items) => {
      if (chrome.runtime.lastError || !mounted) return;

      if (items.attendance && items.attendanceTime > Date.now() - 3600 * 1000) {
        setRaw(items.attendance);
        setLoading(false);
        return;
      }

      getAllAttendance()
        .then((data) => {
          chrome.storage.local.set({ attendance: data, attendanceTime: Date.now() });
          if (mounted) setRaw(data);
        })
        .catch((err) => { if (mounted) setError(err); })
        .finally(() => { if (mounted) setLoading(false); });
    });

    return () => { mounted = false; };
  }, []);

  return { raw, loading, error };
}
