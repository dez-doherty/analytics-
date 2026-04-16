import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import ApexCharts from "apexcharts";
import { GridStack } from "gridstack";
import { getChartWidgets } from "../charts/BuildCharts";

function ChartWrapper({ Component, props, chartKey }) {
  return <Component key={chartKey} {...props} />;
}

export default function GridStackWidget({
  heatmap,
  radar,
  loading,
  error,
  activeYear,
}) {
  const containerRef = useRef(null);
  const rootsRef = useRef([]);

  // Initialise the grid and React roots once on mount.
  useEffect(() => {
    if (!containerRef.current) return;

    const widgetConfigs = getChartWidgets({
      heatmap: [],
      radar: { series: [], categories: [] },
      loading: true,
      error: null,
    });
    const requiredColumns = Math.max(
      1,
      ...widgetConfigs.map((w) => w.layout.x + w.layout.w),
    );

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

    rootsRef.current = widgetConfigs.map((widgetConfig) => {
      const widget = document.createElement("div");
      widget.className = "grid-stack-item";
      widget.style.background = "#fff";
      const content = document.createElement("div");
      content.className = "grid-stack-item-content";
      content.style.cssText = "width:100%; height:100%;";
      widget.appendChild(content);
      grid.makeWidget(widget, widgetConfig.layout);
      return ReactDOM.createRoot(content);
    });

    return () => {
      grid.destroy(true);
      rootsRef.current = [];
    };
  }, []);

  // Re-render chart contents when data changes — no grid rebuild.
  useEffect(() => {
    if (rootsRef.current.length === 0) return;

    const widgetConfigs = getChartWidgets({ heatmap, radar, loading, error });
    widgetConfigs.forEach((widgetConfig, i) => {
      rootsRef.current[i]?.render(
        <ChartWrapper
          Component={widgetConfig.Component}
          props={widgetConfig.props}
          chartKey={activeYear ?? "default"}
        />,
      );
    });

    if (loading) return;

    const resizeTimer = window.setTimeout(() => {
      widgetConfigs.forEach((w) => ApexCharts.exec(w.id, "resize"));
    }, 150);
    return () => clearTimeout(resizeTimer);
  }, [heatmap, radar, loading, error, activeYear]);

  return (
    <div
      ref={containerRef}
      className="grid-stack"
      style={{ background: "#f5f6fa" }}
    />
  );
}
