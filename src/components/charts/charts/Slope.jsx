import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function Slope({ slope, loading, error }) {
  const options = useMemo(
    () => ({
      chart: { id: "attendance-slope", type: "line", toolbar: { show: false } },
      title: { text: "Year-on-Year Attendance (Slope)", align: "left" },
      stroke: { width: 3, curve: "straight" },
      markers: { size: 4 },
      xaxis: {
        categories: slope.categories,
        labels: { rotate: -45, style: { fontSize: "10px" } },
      },
      yaxis: { min: 0, max: 100, title: { text: "%" } },
    }),
    [slope?.categories],
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!slope?.series?.length || !slope?.categories?.length)
    return <p>No attendance data yet — click Update.</p>;

  return (
    <Chart
      options={options}
      series={slope.series}
      type="line"
      width="100%"
      height="100%"
    />
  );
}
