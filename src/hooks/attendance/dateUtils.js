export function getAcademicYear(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const short = (y) => String(y).slice(-2);
  return month >= 8
    ? `${short(year)}/${short(year + 1)}`
    : `${short(year - 1)}/${short(year)}`;
}

export function getISOWeekLabel(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getAttendanceAcademicYears(raw) {
  const years = Array.from(
    new Set(raw.map((item) => getAcademicYear(item.date)).filter(Boolean)),
  );
  return years.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}
