import {Bar, Line} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, type ChartOptions} from "chart.js";
import type {WeatherResponse, HourlyPoint} from "../types/weather";
import {hourLabels, hourlySeries, windBinLabel} from "../utils/weather";
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const baseAxes = {
  x: {grid: {display: false}, ticks: {color: "#647789"}},
  y: {grid: {color: "#e9eef3"}, ticks: {color: "#647789"}},
};
export function WindChart({data}: {data: WeatherResponse["wind"]}) {
  if (data.histogram.length === 0) return <p className="empty">Sin frecuencias válidas para representar.</p>;
  const options: ChartOptions<"bar"> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {legend: {display: false},
      tooltip: {callbacks: {label: ctx => `${ctx.parsed.y} registros`}}},
    scales: {
      x: {...baseAxes.x, title: {display: true, text: "Intervalos de velocidad (m/s)"}},
      y: {...baseAxes.y, beginAtZero: true, title: {display: true, text: "Frecuencia absoluta (registros)"}, ticks: {precision: 0}},
    },
  };
  return <div className="plot" role="img" aria-label="Histograma de frecuencias de velocidad del viento">
    <Bar data={{labels: data.histogram.map(windBinLabel), datasets: [{
      label: "Registros", data: data.histogram.map(b => b.count),
      backgroundColor: "#087f9e", hoverBackgroundColor: "#176484", borderRadius: 4, maxBarThickness: 72,
    }]}} options={options}/>
  </div>;
}
function HourlyChart({points, unit, color, title, minZero}: {
  points: HourlyPoint[]; unit: string; color: string; title: string; minZero: boolean;
}) {
  const options: ChartOptions<"line"> = {
    responsive: true, maintainAspectRatio: false, interaction: {mode: "index", intersect: false},
    plugins: {legend: {display: true, position: "bottom", labels: {usePointStyle: true}},
      tooltip: {callbacks: {label: ctx => ctx.parsed.y === null ? `${ctx.dataset.label}: Sin datos` :
        `${ctx.dataset.label}: ${ctx.parsed.y} ${unit}`}}},
    scales: {
      x: {...baseAxes.x, title: {display: true, text: "Hora local (America/Caracas)"}, ticks: {maxTicksLimit: 12}},
      y: {...baseAxes.y, beginAtZero: minZero, title: {display: true, text: unit}},
    },
  };
  return <div className="plot" role="img" aria-label={title}>
    <Line data={{labels: hourLabels, datasets: [
      {label: "Media horaria suficiente", data: hourlySeries(points, "sufficient"),
        borderColor: color, backgroundColor: color, borderWidth: 2, tension: 0.2,
        pointRadius: 3, pointHoverRadius: 5, spanGaps: false},
      {label: "Cobertura insuficiente", data: hourlySeries(points, "insufficient"),
        borderColor: "#c78332", backgroundColor: "#fff8e9", pointBorderColor: "#c78332",
        pointRadius: 5, pointHoverRadius: 7, showLine: false, spanGaps: false},
    ]}} options={options}/>
  </div>;
}
export function SolarChart({data}: {data: WeatherResponse["solar"]}) {
  return <HourlyChart points={data.hourly} unit="W/m²" color="#a67d38"
    title="Perfil horario de irradiancia solar" minZero={true}/>;
}
export function TempChart({data}: {data: WeatherResponse["temperature"]}) {
  return <HourlyChart points={data.hourly} unit="°C" color="#236cac"
    title="Perfil de temperatura exterior por hora" minZero={false}/>;
}
