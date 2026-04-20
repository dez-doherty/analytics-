import dayjs from "dayjs";
import { getAttendanceAcademicYears } from "./dateUtils";

function getMonthKey(date) {
  return dayjs(date).format("YYYY-MM");
}

function getMonthLabel(key) {
  return dayjs(`${key}-01`).format("MMM YY");
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
    .filter(([, months]) => Object.values(months).some((m) => m.attended > 0))
    .map(([name, months]) => ({
      name,
      data: allMonths.map((month) => {
        const m = months[month];
        if (!m) return { x: getMonthLabel(month), y: null };
        return { x: getMonthLabel(month), y: Math.round((m.attended / m.total) * 100) };
      }),
    }));
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

  const activeMonthKeys = monthKeys.filter((key) =>
    Object.values(moduleMonths).some((months) => (months[key]?.attended ?? 0) > 0),
  );

  const activeCategories = activeMonthKeys.map((key) =>
    dayjs(`${key}-01`).format("MMM"),
  );

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
