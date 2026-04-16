import { getAcademicYear } from "./dateUtils";

export default async function getAllAttendance() {
  let page = 0;
  let all = [];

  while (true) {
    const url = `/api/StudentApi/GetMyTimeline?currentPageIndex=${page}&pagesize=20&itemTypes=6&itemTypes=1&itemTypes=5&itemTypes=4&itemTypes=8&itemTypes=7&itemTypes=3`;
    const res = await fetch(url, {
      credentials: "include",
      headers: { accept: "application/json", "x-time-zone": "Europe/London" },
    });

    if (!res.ok) break;

    const data = await res.json();
    const items = data.items ?? data.result ?? data.data ?? data;
    if (!items?.length) break;

    all.push(...items);
    page++;
  }

  return all
    .filter((item) => item.linkedEntity && item.name?.endsWith(" - Lecture"))
    .flatMap((item) => {
      try {
        const entity = JSON.parse(item.linkedEntity);
        return [{
          module: item.name.replace(" - Lecture", ""),
          attended: item.actAsAttended,
          date: item.startDate,
          academicYear: getAcademicYear(item.startDate),
          mandatory: entity.isMandatory,
          swipeIn: entity.swipeInDateTime,
          start: entity.allocationStartDateTime,
        }];
      } catch {
        return [];
      }
    });
}
