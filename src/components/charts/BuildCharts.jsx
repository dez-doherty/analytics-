import HeatMap from "./charts/HeatMap";
import Treemap from "./charts/Treemap";
import Column from "./charts/Column";
import Slope from "./charts/Slope";

export function getChartWidgets(props) {
  return [
    {
      id: "attendance-heatmap",
      Component: HeatMap,
      props,
      layout: { x: 0, y: 0, w: 4, h: 4 },
    },
    {
      id: "attendance-treemap",
      Component: Treemap,
      props,
      layout: { x: 4, y: 0, w: 4, h: 4 },
    },
    {
      id: "attendance-column",
      Component: Column,
      props,
      layout: { x: 0, y: 4, w: 4, h: 4 },
    },
    {
      id: "attendance-slope",
      Component: Slope,
      props,
      layout: { x: 4, y: 4, w: 4, h: 4 },
    },
  ];
}
