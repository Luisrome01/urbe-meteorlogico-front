/** Contrato REST v0.6 idéntico al backend URBE; sin procesamiento Excel. */
export type HealthResponse = {
  status: "ok"; dataReady: boolean; source: string; monthsIndexed: number; lastSync: string | null;
};
export type AvailabilityResponse = {
  timezone: "America/Caracas";
  years: Array<{ year: number; months: Array<{ month: number; days: number[] }> }>;
  lastSync: string | null;
};
export type HourlyPoint = {
  hour: number; mean: number | null; validCount: number;
  expectedCount: number | null; sufficient: boolean;
};
export type WeatherResponse = {
  date: string; timezone: "America/Caracas";
  source: {filename: string; driveFileId?: string; sha256?: string; syncedAt?: string};
  wind: {unit: "m/s"; mean: number | null; max: number | null; validCount: number;
    coveragePct: number | null; histogram: Array<{from: number; to: number | null; count: number}>};
  solar: {unit: "W/m²"; max: number | null; coveragePct: number | null; hourly: HourlyPoint[]};
  temperature: {unit: "°C"; mean: number | null; min: number | null;
    max: number | null; coveragePct: number | null; hourly: HourlyPoint[]};
  quality: {observedCount: number; duplicateCount: number; intervalMinutes: number | null;
    expectedCount: number | null; unknownUnits: boolean; invalidWind: number;
    invalidSolar: number; invalidTemperature: number; irregularGapCount: number;
    offGridCount: number | null; duplicateSlotCount: number | null; warnings: string[]};
};
export type ApiErrorCode =
  | "INVALID_DATE" | "OUT_OF_ACADEMIC_RANGE" | "NO_VALID_DATA_FOR_DATE"
  | "SOURCE_MONTH_UNAVAILABLE" | "SOURCE_NOT_SYNCED" | "PROCESSING_FAILED"
  | "AVAILABILITY_FAILED" | "ENDPOINT_NOT_FOUND";
export type ApiErrorResponse = {error: ApiErrorCode; date?: string; month?: string};
