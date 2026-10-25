import type {AvailabilityResponse, HourlyPoint, WeatherResponse} from "../types/weather";
export const hourLabels = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, "0")}:00`);
const monthNames = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export function localDateLabel(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${Number(match[3])} de ${monthNames[Number(match[2]) - 1] ?? "mes desconocido"} de ${match[1]}` : date;
}
export function numberLabel(value: number | null | undefined, suffix = ""): string {
  return value == null || !Number.isFinite(value)
    ? "Sin datos" : new Intl.NumberFormat("es-VE", {maximumFractionDigits: 2}).format(value) + suffix;
}
export function hourLabel(hour: number): string { return hourLabels[hour] ?? String(hour); }
export function windBinLabel(bin: {from: number;to: number | null}): string {
  return bin.to === null ? `≥ ${bin.from} m/s` : `${bin.from}–${bin.to} m/s`;
}
export function hourlySeries(points: HourlyPoint[], mode: "sufficient" | "insufficient" | "all"): Array<number | null> {
  const byHour = new Map(points.map(p => [p.hour, p]));
  return hourLabels.map((_, index) => {
    const point = byHour.get(index);
    if (!point || point.mean === null) return null;
    if (mode === "sufficient" && !point.sufficient) return null;
    if (mode === "insufficient" && point.sufficient) return null;
    return point.mean;
  });
}
export function availableDate(data: AvailabilityResponse, date: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return false;
  return Boolean(data.years.find(y => y.year === Number(m[1]))
    ?.months.find(x => x.month === Number(m[2]))?.days.includes(Number(m[3])));
}
export function isCompleteResponse(report: WeatherResponse, date: string): boolean {
  return report.date === date && report.timezone === "America/Caracas"
    && Array.isArray(report.wind?.histogram) && Array.isArray(report.solar?.hourly)
    && Array.isArray(report.temperature?.hourly) && Array.isArray(report.quality?.warnings);
}
