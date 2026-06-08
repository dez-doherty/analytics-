import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function Column({ column, loading, error }) {
  const options = useMemo(
    () => ({
      chart: { id: "attendance-column", type: "bar" },
      title: { text: "Average Attendance by Module", align: "left" },
      xaxis: {
        categories: column.categories,
        labels: { rotate: -45, style: { fontSize: "10px" } },
      },
      yaxis: { min: 0, max: 100, title: { text: "%" } },
      plotOptions: { bar: { horizontal: false, columnWidth: "60%" } },
      dataLabels: { enabled: false },
    }),
    [column?.categories],
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!column?.series?.length || !column?.categories?.length)
    return <p>No attendance data yet — click Update.</p>;

  return (
    <Chart
      options={options}
      series={column.series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
}
