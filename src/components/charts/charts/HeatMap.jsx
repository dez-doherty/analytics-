import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function HeatMap({ heatmap, loading, error }) {
  const options = useMemo(
    () => ({
      chart: { id: "attendance-heatmap", type: "heatmap" },
      dataLabels: { enabled: false },
      colors: ["#008FFB"],
      title: { text: "Attendance by Module & Month", align: "left" },
      xaxis: {
        labels: {
          rotate: -45,
          style: { fontSize: "10px" },
        },
      },
      plotOptions: {
        heatmap: {
          radius: 2,
          colorScale: { min: 0, max: 100 },
        },
      },
    }),
    [],
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!heatmap || heatmap.length === 0) return <p>No attendance data yet — click Update.</p>;

  return (
    <Chart
      options={options}
      series={heatmap}
      type="heatmap"
      width="100%"
      height="100%"
    />
  );
}
