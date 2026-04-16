// Deterministic pseudo-random based on a string key
function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h) / 2147483647;
}

// Per-module attendance tendencies that differ between years
const MODULE_RATES = {
  "24/25": {
    "Software Engineering": 0.85,
    "Databases": 0.60,
    "Computer Networks": 0.45,
    "Algorithms": 0.90,
    "Web Development": 0.70,   // only in 24/25
  },
  "25/26": {
    "Software Engineering": 0.75,
    "Databases": 0.80,
    "Computer Networks": 0.55,
    "Algorithms": 0.65,
    "Cloud Computing": 0.50,   // only in 25/26
  },
};

const TERMS = [
  {
    academicYear: "24/25",
    sessions: [
      { month: 9,  calYear: 2024 },
      { month: 10, calYear: 2024 },
      { month: 11, calYear: 2024 },
      { month: 12, calYear: 2024 },
      { month: 1,  calYear: 2025 },
      { month: 2,  calYear: 2025 },
      { month: 3,  calYear: 2025 },
      { month: 4,  calYear: 2025 },
      { month: 5,  calYear: 2025 },
    ],
  },
  {
    academicYear: "25/26",
    sessions: [
      { month: 9,  calYear: 2025 },
      { month: 10, calYear: 2025 },
      { month: 11, calYear: 2025 },
      { month: 12, calYear: 2025 },
      { month: 1,  calYear: 2026 },
      { month: 2,  calYear: 2026 },
      { month: 3,  calYear: 2026 },
      { month: 4,  calYear: 2026 },
      { month: 5,  calYear: 2026 },
    ],
  },
];

const records = [];

for (const term of TERMS) {
  const modules = Object.keys(MODULE_RATES[term.academicYear]);
  for (const { month, calYear } of term.sessions) {
    for (const mod of modules) {
      const baseRate = MODULE_RATES[term.academicYear][mod];
      for (let week = 1; week <= 3; week++) {
        const day = Math.min(week * 7 - 4, 28);
        const date = new Date(calYear, month - 1, day).toISOString();
        // Add noise around the base rate so weeks vary but the trend holds
        const noise = (seed(`${mod}-${calYear}-${month}-${week}`) - 0.5) * 0.3;
        const attended = seed(`attend-${mod}-${calYear}-${month}-${week}`) < baseRate + noise;
        records.push({
          module: mod,
          attended,
          date,
          academicYear: term.academicYear,
          mandatory: seed(`${mod}-mandatory`) > 0.3,
          swipeIn: attended ? date : null,
          start: date,
        });
      }
    }
  }
}

export default records;
