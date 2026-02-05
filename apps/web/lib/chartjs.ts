// src/lib/chartjs.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global defaults
ChartJS.defaults.font.family =
  "'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans Thai', sans-serif";
ChartJS.defaults.color = "#334155"; // slate-700
ChartJS.defaults.responsive = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 10;
ChartJS.defaults.plugins.tooltip.mode = "index";
ChartJS.defaults.plugins.tooltip.intersect = false;

export { ChartJS };