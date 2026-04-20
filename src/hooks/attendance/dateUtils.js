import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export function getAcademicYear(date) {
  if (!date) return null;
  const d = dayjs(date);
  if (!d.isValid()) return null;
  const year = d.year();
  const short = (y) => String(y).slice(-2);
  return d.month() >= 8
    ? `${short(year)}/${short(year + 1)}`
    : `${short(year - 1)}/${short(year)}`;
}

export function getISOWeekLabel(date) {
  if (!date) return null;
  const d = dayjs(date);
  if (!d.isValid()) return null;
  return `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
}

export function getAttendanceAcademicYears(raw) {
  const years = Array.from(
    new Set(raw.map((item) => getAcademicYear(item.date)).filter(Boolean)),
  );
  return years.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}
