# Contrato REST v0.1 — URBE
Frontend y backend deben mantener exactamente los nombres y tipos aquí definidos. Fechas locales: America/Caracas; nunca convertir YYYY-MM-DD mediante UTC.

## GET /api/health
HTTP 200: `{"status":"ok"}`.

## GET /api/availability
```ts
{timezone:"America/Caracas",syncedAt:string|null,years:Array<{year:number,months:Array<{month:number,days:number[],incomplete?:boolean}>}>}
```
Listar exclusivamente días con información real. Meses 1–12; días 1–31.

## GET /api/weather/:date
```ts
{ date:string;timezone:string;
  source:{filename:string;driveFileId?:string|null;syncedAt:string|null;origin?:string};
  wind:{unit:"m/s";mean:number|null;max:number|null;validCount:number;histogram:Array<{label:string;min?:number;max?:number;count:number}>};
  solar:{unit:"W/m²";max:number|null;coveragePct:number|null;hourly:Array<{hour:number|string;mean:number|null;validCount:number;expectedCount:number}>};
  temperature:{unit:"°C";mean:number|null;min:number|null;max:number|null;coveragePct:number|null;hourly:Array<{hour:number|string;mean:number|null;validCount:number;expectedCount:number;sufficient:boolean}>};
  quality:{invalidCount?:number;missingCount?:number;warnings:string[]}
}
```
Las horas representan 00:00–23:00. Un dato ausente es `null`, nunca cero. `sufficient=false` indica hora insuficiente y se visualiza como hueco. Histogramas: frecuencia absoluta por intervalo en m/s, no serie temporal. Radiación: irradiancia W/m², no energía acumulada. Cobertura: porcentaje 0–100. Fecha de respuesta debe coincidir exactamente con fecha pedida. `source.filename` debe corresponder a Excel real.

Errores: 404 significa fecha no disponible; demás códigos/errores de red se muestran claramente. Backend habilita CORS para Vercel. No cambiar contrato unilateralmente.
