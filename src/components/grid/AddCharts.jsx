import { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import { getChartWidgets } from "../charts/BuildCharts";

export default function GridStackWidget({
  heatmap,
  radar,
  loading,
  error,
  activeYear,
}) {
  const containerRef = useRef(null);

  const widgetConfigs = getChartWidgets({ heatmap, radar, loading, error });
  const requiredColumns = Math.max(
    1,
    ...widgetConfigs.map((w) => w.layout.x + w.layout.w),
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const grid = GridStack.init(
      {
        autoCellHeight: false,
        cellHeight: 90,
        margin: 10,
        disableOneColumnMode: true,
        float: false,
        disableResize: true,
        animate: false,
        column: requiredColumns,
      },
      containerRef.current,
    );

    return () => grid.destroy(false);
  }, [requiredColumns]);

  return (
    <div
      ref={containerRef}
      className="grid-stack"
      style={{ background: "#f5f6fa" }}
    >
      {widgetConfigs.map(({ id, Component, props, layout }) => (
        <div
          key={id}
          className="grid-stack-item"
          gs-x={layout.x}
          gs-y={layout.y}
          gs-w={layout.w}
          gs-h={layout.h}
          style={{ background: "#fff" }}
        >
          <div
            className="grid-stack-item-content"
            style={{ width: "100%", height: "100%" }}
          >
            <Component key={activeYear ?? "default"} {...props} />
          </div>
        </div>
      ))}
    </div>
  );
}
