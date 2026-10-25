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

/** Link a fichero real, construido únicamente desde el ID devuelto por la API. */
export function driveFileUrl(id: string | undefined): string | null {
  if (!id || !/^[A-Za-z0-9_-]{10,}$/.test(id)) return null;
  return `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
}
/** Si faltan metadatos no se puede afirmar que el archivo se sincronizó. */
export function hasSyncMetadata(source: WeatherResponse["source"]): boolean {
  return Boolean(
    source.filename?.trim() &&
    driveFileUrl(source.driveFileId) &&
    source.sha256 && /^[a-fA-F0-9]{64}$/.test(source.sha256) &&
    source.syncedAt && !Number.isNaN(new Date(source.syncedAt).getTime())
  );
}
export function maracaiboTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return "No informada";
  const time = new Date(timestamp);
  if (Number.isNaN(time.getTime())) return "Fecha no válida";
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit",
    minute: "2-digit", hourCycle: "h23", timeZone: "America/Caracas",
  }).format(time) + " (Maracaibo, UTC−4)";
}
export function isPartialDay(report: WeatherResponse): boolean {
  const quality = report.quality;
  const lessThanExpected = quality.expectedCount !== null && quality.observedCount < quality.expectedCount;
  const coverages = [report.wind.coveragePct, report.solar.coveragePct, report.temperature.coveragePct];
  return lessThanExpected || coverages.some(value => value !== null && value < 75);
}
export function missingCoverageLabels(report: WeatherResponse): string[] {
  return [
    ["viento", report.wind.coveragePct],
    ["radiación", report.solar.coveragePct],
    ["temperatura", report.temperature.coveragePct],
  ].filter(([, value]) => value === null || (typeof value === "number" && value < 75))
    .map(([name, value]) => `${name}: ${numberLabel(value as number | null, " %")}`);
}
