import HeatMap from "./charts/HeatMap";
import Radar from "./charts/Radar";

export function getChartWidgets(props) {
  return [
    {
      id: "attendance-heatmap",
      Component: HeatMap,
      props,
      layout: { x: 0, y: 0, w: 4, h: 4 },
    },
    {
      id: "attendance-radar",
      Component: Radar,
      props,
      layout: { x: 4, y: 0, w: 4, h: 4 },
    },
  ];
}
