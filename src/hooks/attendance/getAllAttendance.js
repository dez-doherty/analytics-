import { getAcademicYear } from "./dateUtils";

const CARD_SELECTOR = "mat-card.seats-hover-ct";

function parseDate(label) {
  const m = label.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mo, yy, hh, mi] = m;
  return new Date(`${yy}-${mo}-${dd}T${hh}:${mi}:00`).toISOString();
}

function extractStatus(card) {
  const itemEl = card.querySelector('[aria-label^="Item,"]');
  const itemLabel = itemEl?.getAttribute("aria-label");
  if (itemLabel) {
    const m = itemLabel.match(/Item,\s*(\w+)/);
    if (m) return m[1].toLowerCase();
  }
  const cardLabel = card.getAttribute("aria-label");
  if (cardLabel) {
    const m = cardLabel.match(/Timeline table,\s*(\w+)/);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

export function parseAttendanceCard(card) {
  const detailsEl = card.querySelector('[aria-label^="Details,"]');
  const detailsText = (detailsEl?.textContent ?? "").trim();
  if (!/-\s*Lecture\b/.test(detailsText)) return null;

  const moduleMatch = detailsText.match(/^(.+?)\s*-\s*Lecture/);
  if (!moduleMatch) return null;
  const moduleName = moduleMatch[1].trim();
  const mandatory = /\bMandatory\b/i.test(detailsText);

  const dateEl = card.querySelector('[aria-label^="Date,"]');
  const dateLabel = dateEl?.getAttribute("aria-label") ?? "";
  const date = parseDate(dateLabel);
  if (!date) return null;

  const status = extractStatus(card) ?? "unknown";

  return {
    module: moduleName,
    status,
    attended: status !== "absent" && status !== "unknown",
    date,
    academicYear: getAcademicYear(date),
    mandatory,
  };
}

export default function collectAttendance() {
  const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));
  const parsed = cards.map(parseAttendanceCard).filter(Boolean);
  const statusCounts = parsed.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    `[Analytics+] collectAttendance: ${cards.length} cards found, ${parsed.length} parsed, statuses:`,
    statusCounts,
  );
  return parsed;
}
