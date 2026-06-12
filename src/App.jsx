import "gridstack/dist/gridstack.min.css";
import "./App.css";
import { useMemo, useState } from "react";
import GridStackWidget from "./components/grid/AddCharts";
import {
  useAttendanceData,
  getAttendanceChartData,
} from "./hooks/useAttendanceData";

function App() {
  const { raw, loading, error, refresh, lastUpdated } = useAttendanceData();
  const [selectedYear, setSelectedYear] = useState(null);

  const chartData = useMemo(
    () => getAttendanceChartData(raw, selectedYear),
    [raw, selectedYear],
  );

  const activeYear = selectedYear ?? chartData.academicYears[0] ?? null;

  return (
    <div className="mat-mdc-card mdc-card analytics-plus-panel">
      <div className="mat-mdc-card-header">
        <div className="mat-mdc-card-header-text">
          <div className="mat-mdc-card-title">Analytics+</div>
          <div className="mat-mdc-card-subtitle">
            Interactive attendance analytics dashboard
          </div>
        </div>
        <div className="analytics-plus-year-toggle">
          {chartData.academicYears.map((year) => (
            <button
              key={year}
              className={`mat-mdc-button mdc-button${year === activeYear ? " active" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
          {/* Update button removed: data is fetched on mount and via background refresh */}
        </div>
        {lastUpdated ? (
          <div className="analytics-plus-updated">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        ) : null}
      </div>

      <div className="mat-mdc-card-content analytics-plus-grid">
        <GridStackWidget
          heatmap={chartData.heatmap}
          treemap={chartData.treemap}
          column={chartData.column}
          slope={chartData.slope}
          loading={loading}
          error={error}
          activeYear={activeYear}
        />
      </div>
    </div>
  );
}

export default App;
