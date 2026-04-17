import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function Radar({ radar, loading, error }) {
  const options = useMemo(
    () => ({
      chart: {
        id: "attendance-radar",
        type: "radar",
        dropShadow: { enabled: true, blur: 1, left: 1, top: 1 },
      },
      title: { text: "Monthly Attendance by Module", align: "left" },
      stroke: { width: 2 },
      fill: { opacity: 0.1 },
      markers: { size: 0 },
      yaxis: { stepSize: 20, min: 0, max: 100 },
      xaxis: { categories: radar.categories },
    }),
    [radar.categories],
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!radar?.series?.length || !radar?.categories?.length)
    return <p>No attendance data yet — click Update.</p>;

  return (
    <Chart
      options={options}
      series={radar.series}
      type="radar"
      width="100%"
      height="100%"
    />
  );
}
