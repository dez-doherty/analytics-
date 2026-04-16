import "gridstack/dist/gridstack.min.css";
import "./App.css";
import { useMemo, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import GridStackWidget from "./components/grid/AddCharts";
import {
  useAttendanceData,
  getAttendanceChartData,
} from "./hooks/useAttendanceData";

function App() {
  const { raw, loading, error } = useAttendanceData();
  const [selectedYear, setSelectedYear] = useState(null);

  const chartData = useMemo(
    () => getAttendanceChartData(raw, selectedYear),
    [raw, selectedYear],
  );

  const handleYearChange = (_, year) => {
    if (year) setSelectedYear(year);
  };

  return (
    <div className="extension-panel">
      <div className="extension-panel__header">
        <div>
          <p className="extension-panel__eyebrow">SEATs Analytics+</p>
          <h2>Interactive attendance analytics dashboard</h2>
        </div>
        
        <ToggleButtonGroup
          value={selectedYear ?? chartData.academicYears[0] ?? null}
          exclusive
          onChange={handleYearChange}
          size="small"
          aria-label="Academic year toggle"
        >
          {chartData.academicYears.map((year) => (
            <ToggleButton key={year} value={year} aria-label={year}>
              {year}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="extension-panel__body mat-mdc-card-content">
        <GridStackWidget
          heatmap={chartData.heatmap}
          radar={chartData.radar}
          loading={loading}
          error={error}
          activeYear={chartData.activeYear}
        />
      </div>
    </div>
  );
}

export default App;
