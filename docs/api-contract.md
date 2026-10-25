# Contrato REST URBE — v0.6 (sincronizado con backend)

Autoridad: [backend/docs/api-contract.md](https://github.com/Luisrome01/urbe-meteorlogico-back/blob/main/docs/api-contract.md). URL: `https://urbe-meteorlogico-api.onrender.com`. Local: `http://localhost:3001`.

Las fechas son cadenas civiles `YYYY-MM-DD` de **America/Caracas**. El navegador no procesa Excel, no inventa mediciones y nunca convierte esas fechas con `toISOString()`.

## GET /api/health

```ts
{status: "ok"; dataReady: boolean; source: string; monthsIndexed: number; lastSync: string | null}
```

Consultar primero y continuar solo con `status === "ok"` y `dataReady === true`. El backend íntegro informa 35 meses indexados.

## GET /api/availability

```ts
{timezone: "America/Caracas"; years: Array<{year: number; months: Array<{month: number; days: number[]}>}>; lastSync: string | null}
```

Utilizar exclusivamente los días presentes. Enero 2024 es ausente y abril 2025 contiene solamente el día 1 parcial. Agosto 2026 no pertenece al período académico.

## GET /api/weather/:date

```ts
{ date: string; timezone: "America/Caracas";
  source: {filename:string;driveFileId?:string;sha256?:string;syncedAt?:string};
  wind: {unit:"m/s";mean:number|null;max:number|null;validCount:number;coveragePct:number|null;
    histogram:Array<{from:number;to:number|null;count:number}>};
  solar: {unit:"W/m²";max:number|null;coveragePct:number|null;hourly:HourlyPoint[]};
  temperature: {unit:"°C";mean:number|null;min:number|null;max:number|null;
    coveragePct:number|null;hourly:HourlyPoint[]};
  quality: {observedCount:number;duplicateCount:number;intervalMinutes:number|null;
    expectedCount:number|null;unknownUnits:boolean;invalidWind:number;invalidSolar:number;
    invalidTemperature:number;irregularGapCount:number;offGridCount:number|null;
    duplicateSlotCount:number|null;warnings:string[]}
}
type HourlyPoint = {hour:number;mean:number|null;validCount:number;expectedCount:number|null;sufficient:boolean};
```

El histograma es la frecuencia absoluta de velocidades; el intervalo `{from:20,to:null}` se rotula **≥ 20 m/s**. Una hora con `mean:null` deja hueco, cero real se preserva; `sufficient:false` se dibuja como punto ámbar sin unir segmentos. Cobertura es porcentaje de slots temporales con mediciones válidas; no recalcularla a partir de `validCount`. No confundir irradiancia (W/m²) con energía (Wh/m²). Mostrar todas las advertencias, filename, ID de Google Drive, SHA-256 y syncedAt.

## Errores

| Status | Código | Mensaje |
|---|---|---|
| 400 | INVALID_DATE | Fecha de formato inválido |
| 422 | OUT_OF_ACADEMIC_RANGE | Fuera de período académico |
| 404 | NO_VALID_DATA_FOR_DATE | Fecha sin observaciones válidas |
| 404 | SOURCE_MONTH_UNAVAILABLE | Excel oficial ausente ese mes |
| 503 | SOURCE_NOT_SYNCED | Fuente aún no sincronizada |
| 500 | PROCESSING_FAILED | Procesamiento fallido |
| 500 | AVAILABILITY_FAILED | Consulta de disponibilidad fallida |
| 404 | ENDPOINT_NOT_FOUND | Ruta API inexistente |

No reintentar automáticamente respuestas permanentes; reintentos manuales de red, 429, 500 y 503. Backend CORS debe incluir el origen exacto de Vercel y `http://localhost:5173`.

## Validación

- Unitarias: `npm test` sin datos reales ni llamadas a internet, cubren nulabilidad, horas, intervalos, disponibilidad, mensajes y fecha.
- Humo real: `npm run smoke:api` contra Render; compara 2026-06-15, 2025-04-01, enero ausente, fecha imposible y fuera de rango. También existe workflow GitHub manual.
