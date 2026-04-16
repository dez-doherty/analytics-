import { getAttendanceAcademicYears, getISOWeekLabel } from "./dateUtils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${String(year).slice(-2)}`;
}

export function getHeatmapSeries(filtered) {
  const moduleMonths = {};
  filtered.forEach((item) => {
    const mod = item.module ?? "Unknown";
    const month = getMonthKey(item.date);
    if (!moduleMonths[mod]) moduleMonths[mod] = {};
    if (!moduleMonths[mod][month]) moduleMonths[mod][month] = { attended: 0, total: 0 };
    moduleMonths[mod][month].total++;
    if (item.attended) moduleMonths[mod][month].attended++;
  });

  const allMonths = [
    ...new Set(Object.values(moduleMonths).flatMap((months) => Object.keys(months))),
  ].sort();

  return Object.entries(moduleMonths)
    .map(([name, months]) => ({
      name,
      data: allMonths.map((month) => {
        const m = months[month];
        if (!m || m.attended === 0) return { x: getMonthLabel(month), y: null };
        return { x: getMonthLabel(month), y: Math.round((m.attended / m.total) * 100) };
      }),
    }))
    .filter((s) => s.data.some((d) => d.y !== null));
}

export function getRadarSeries(filtered) {
  const monthKeys = [...new Set(filtered.map((item) => getMonthKey(item.date)))].sort();

  const moduleMonths = {};
  filtered.forEach((item) => {
    const mod = item.module ?? "Unknown";
    const key = getMonthKey(item.date);
    if (!moduleMonths[mod]) moduleMonths[mod] = {};
    if (!moduleMonths[mod][key]) moduleMonths[mod][key] = { attended: 0, total: 0 };
    moduleMonths[mod][key].total++;
    if (item.attended) moduleMonths[mod][key].attended++;
  });

  // Only keep months where at least one module had attendance > 0
  const activeMonthKeys = monthKeys.filter((key) =>
    Object.values(moduleMonths).some((months) => (months[key]?.attended ?? 0) > 0),
  );

  const activeCategories = activeMonthKeys.map((key) => {
    const month = parseInt(key.split("-")[1], 10);
    return MONTH_NAMES[month - 1];
  });

  // Only keep modules that had attendance > 0 in at least one month
  const series = Object.entries(moduleMonths)
    .filter(([, months]) => Object.values(months).some((m) => m.attended > 0))
    .map(([name, months]) => ({
      name,
      data: activeMonthKeys.map((key) => {
        const m = months[key];
        return m ? Math.round((m.attended / m.total) * 100) : 0;
      }),
    }));

  return { series, categories: activeCategories };
}

export function getAttendanceChartData(raw, selectedAcademicYear) {
  const academicYears = getAttendanceAcademicYears(raw);
  const activeYear = selectedAcademicYear || academicYears[0] || null;

  const filtered = activeYear
    ? raw.filter((item) => item.academicYear === activeYear)
    : raw;

  return {
    academicYears,
    activeYear,
    heatmap: getHeatmapSeries(filtered),
    radar: getRadarSeries(filtered),
  };
}
