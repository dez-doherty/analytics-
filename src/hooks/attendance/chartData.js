import dayjs from "dayjs";
import { getAttendanceAcademicYears } from "./dateUtils";

function getMonthKey(date) {
  return dayjs(date).format("YYYY-MM");
}

function getMonthLabel(key) {
  return dayjs(`${key}-01`).format("MMM YY");
}

// Convert module name to abbreviation using capital letters
// e.g., "Data-Structures" -> "DS", "Web-Development" -> "WD"
function abbreviateModuleName(name) {
  if (!name || name === "Unknown") return name;
  return name
    .split(/[-\s_]+/)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

export function getHeatmapSeries(filtered) {
  const moduleMonths = {};
  filtered.forEach((item) => {
    const mod = item.module ?? "Unknown";
    const month = getMonthKey(item.date);
    if (!moduleMonths[mod]) moduleMonths[mod] = {};
    if (!moduleMonths[mod][month])
      moduleMonths[mod][month] = { attended: 0, total: 0 };
    moduleMonths[mod][month].total++;
    if (item.attended) moduleMonths[mod][month].attended++;
  });

  const allMonths = [
    ...new Set(
      Object.values(moduleMonths).flatMap((months) => Object.keys(months)),
    ),
  ].sort();

  return Object.entries(moduleMonths)
    .filter(([, months]) => Object.values(months).some((m) => m.attended > 0))
    .map(([name, months]) => ({
      name: abbreviateModuleName(name),
      data: allMonths.map((month) => {
        const m = months[month];
        if (!m) return { x: getMonthLabel(month), y: null };
        return {
          x: getMonthLabel(month),
          y: Math.round((m.attended / m.total) * 100),
        };
      }),
    }));
}

export function getRadarSeries(filtered) {
  const monthKeys = [
    ...new Set(filtered.map((item) => getMonthKey(item.date))),
  ].sort();

  const moduleMonths = {};
  filtered.forEach((item) => {
    const mod = item.module ?? "Unknown";
    const key = getMonthKey(item.date);
    if (!moduleMonths[mod]) moduleMonths[mod] = {};
    if (!moduleMonths[mod][key])
      moduleMonths[mod][key] = { attended: 0, total: 0 };
    moduleMonths[mod][key].total++;
    if (item.attended) moduleMonths[mod][key].attended++;
  });

  const activeMonthKeys = monthKeys.filter((key) =>
    Object.values(moduleMonths).some(
      (months) => (months[key]?.attended ?? 0) > 0,
    ),
  );

  const activeCategories = activeMonthKeys.map((key) =>
    dayjs(`${key}-01`).format("MMM"),
  );

  const series = Object.entries(moduleMonths)
    .filter(([, months]) => Object.values(months).some((m) => m.attended > 0))
    .map(([name, months]) => ({
      name: abbreviateModuleName(name),
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
    column: getColumnSeries(filtered),
    slope: getSlopeSeries(raw, activeYear, academicYears),
  };
}

export function getColumnSeries(filtered) {
  // Build module->month aggregates (same approach as radar) so we only show
  // core modules that have attendance records.
  const moduleMonths = {};
  filtered.forEach((item) => {
    const mod = item.module ?? "Unknown";
    const key = getMonthKey(item.date);
    if (!moduleMonths[mod]) moduleMonths[mod] = {};
    if (!moduleMonths[mod][key])
      moduleMonths[mod][key] = { attended: 0, total: 0 };
    moduleMonths[mod][key].total++;
    if (item.attended) moduleMonths[mod][key].attended++;
  });

  const modules = Object.keys(moduleMonths)
    .filter((m) =>
      Object.values(moduleMonths[m]).some((mm) => (mm.attended ?? 0) > 0),
    )
    .sort()
    .map(abbreviateModuleName);

  const data = Object.keys(moduleMonths)
    .filter((m) =>
      Object.values(moduleMonths[m]).some((mm) => (mm.attended ?? 0) > 0),
    )
    .sort()
    .map((m) => {
    const months = moduleMonths[m];
    const totals = Object.values(months || {}).reduce(
      (acc, v) => {
        acc.attended += v.attended ?? 0;
        acc.total += v.total ?? 0;
        return acc;
      },
      { attended: 0, total: 0 },
    );
    return totals.total > 0
      ? Math.round((totals.attended / totals.total) * 100)
      : 0;
  });

  return { categories: modules, series: [{ name: "Attendance %", data }] };
}

export function getSlopeSeries(raw, activeYear, academicYears) {
  // Build fixed academic-year month order: Sep -> Jun (exclude Jul/Aug)
  const monthOrder = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const categories = monthOrder.map((m) =>
    dayjs()
      .month(m - 1)
      .format("MMM"),
  );

  const years = academicYears && academicYears.length ? academicYears : [];
  if (!years.length) return { series: [], categories };

  function parseStartYear(ay) {
    const parts = String(ay).split("/");
    const p = parts[0];
    let y = Number(p);
    if (p.length === 2) y = 2000 + y;
    return y;
  }

  const series = years.map((year) => {
    const startYear = parseStartYear(year);
    const monthKeys = monthOrder.map((m) => {
      const y = m >= 9 ? startYear : startYear + 1;
      return `${y}-${String(m).padStart(2, "0")}`;
    });

    const data = monthKeys.map((key) => {
      const items = raw.filter(
        (it) => it.academicYear === year && getMonthKey(it.date) === key,
      );
      if (!items.length) return null;
      const totals = items.reduce(
        (acc, v) => {
          acc.attended += v.attended ? 1 : 0;
          acc.total += 1;
          return acc;
        },
        { attended: 0, total: 0 },
      );
      return totals.total > 0
        ? Math.round((totals.attended / totals.total) * 100)
        : 0;
    });

    return { name: year, data };
  });

  return { categories, series };
}
