import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function Treemap({ treemap, loading, error }) {
  const options = useMemo(
    () => ({
      chart: { id: "attendance-treemap", type: "treemap" },
      legend: { show: false },
      plotOptions: { treemap: { distributed: false } },
    }),
    [],
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!treemap?.series || !treemap.series[0]?.data?.length)
    return <p>No attendance data yet.</p>;

  return (
    <Chart
      options={options}
      series={treemap.series}
      type="treemap"
      width="100%"
      height="100%"
    />
  );
}
