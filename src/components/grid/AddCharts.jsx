import { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import { getChartWidgets } from "../charts/BuildCharts";

export default function GridStackWidget({
  heatmap,
  treemap,
  column,
  slope,
  loading,
  error,
  activeYear,
}) {
  const containerRef = useRef(null);

  const widgetConfigs = getChartWidgets({
    heatmap,
    treemap,
    column,
    slope,
    loading,
    error,
  });
  const requiredColumns = Math.max(
    1,
    ...widgetConfigs.map((w) => w.layout.x + w.layout.w),
  );

  const requiredRows = Math.max(
    1,
    ...widgetConfigs.map((w) => w.layout.y + w.layout.h),
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let grid;

    function initGrid() {
      // available vertical space below the grid container
      const top = containerRef.current.getBoundingClientRect().top;
      const availableHeight = Math.max(240, window.innerHeight - top - 120);
      // compute cell height so the grid fits into availableHeight
      // leave a small buffer so chart legends and margins don't trigger scrollbars
      const computedCellHeight = Math.max(
        60,
        Math.floor(availableHeight / requiredRows) - 8,
      );

      return GridStack.init(
        {
          autoCellHeight: false,
          cellHeight: computedCellHeight,
          margin: 10,
          disableOneColumnMode: true,
          float: false,
          disableResize: true,
          animate: false,
          draggable: { handle: ".grid-stack-item-content", scroll: false },
          column: requiredColumns,
        },
        containerRef.current,
      );
    }

    grid = initGrid();

    function handleResize() {
      if (grid) grid.destroy(false);
      grid = initGrid();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (grid) grid.destroy(false);
    };
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
