import { getAcademicYear } from "./dateUtils";

// Fetch timeline items from the student API and normalise into attendance entries.
export default async function getAllAttendance() {
  let page = 0;
  const all = [];

  while (true) {
    const url = `/api/StudentApi/GetMyTimeline?currentPageIndex=${page}&pagesize=20&itemTypes=6&itemTypes=1&itemTypes=5&itemTypes=4&itemTypes=8&itemTypes=7&itemTypes=3`;
    const res = await fetch(url, {
      credentials: "include",
      headers: { accept: "application/json", "x-time-zone": "Europe/London" },
    });
    if (!res.ok) break;
    const data = await res.json();
    const items = data.items ?? data.result ?? data.data ?? data;
    if (!items || !items.length) break;
    all.push(...items);
    if (items.length < 20) break;
    page++;
  }

  return all
    .filter((item) => item.linkedEntity && item.name?.endsWith(" - Lecture"))
    .flatMap((item) => {
      try {
        const entity = JSON.parse(item.linkedEntity);
        return [
          {
            module: item.name.replace(" - Lecture", ""),
            attended: !!item.actAsAttended,
            date: item.startDate,
            academicYear: getAcademicYear(item.startDate),
            mandatory: entity.isMandatory,
            swipeIn: entity.swipeInDateTime,
            start: entity.allocationStartDateTime,
            status: item.status ?? null,
          },
        ];
      } catch (e) {
        return [];
      }
    });
}
