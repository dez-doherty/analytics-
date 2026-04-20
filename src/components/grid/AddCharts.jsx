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
  const itemRefs = useRef({});

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

    widgetConfigs.forEach((w) => {
      const el = itemRefs.current[w.id];
      if (el) grid.makeWidget(el, w.layout);
    });

    return () => grid.destroy(false);
  }, [requiredColumns]);

  return (
    <div
      ref={containerRef}
      className="grid-stack"
      style={{ background: "#f5f6fa" }}
    >
      {widgetConfigs.map(({ id, Component, props }) => (
        <div
          key={id}
          ref={(el) => {
            itemRefs.current[id] = el;
          }}
          className="grid-stack-item"
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
