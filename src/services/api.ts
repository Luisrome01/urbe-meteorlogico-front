import type { ApiErrorCode, ApiErrorResponse, AvailabilityResponse, HealthResponse, WeatherResponse } from "../types/weather";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, "") ?? "";
const messages: Record<ApiErrorCode, string> = {
  INVALID_DATE: "La fecha no tiene el formato válido.",
  OUT_OF_ACADEMIC_RANGE: "La fecha está fuera del período académico.",
  NO_VALID_DATA_FOR_DATE: "No hay mediciones válidas para esa fecha.",
  SOURCE_MONTH_UNAVAILABLE: "No existe archivo oficial para ese mes.",
  SOURCE_NOT_SYNCED: "La fuente todavía no está disponible; intenta nuevamente.",
  PROCESSING_FAILED: "El servidor no pudo procesar las mediciones.",
  AVAILABILITY_FAILED: "No fue posible consultar las fechas disponibles.",
  ENDPOINT_NOT_FOUND: "El servicio solicitado no existe.",
};
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string | null = null
  ) { super(message); this.name = "ApiRequestError"; }
  get retryable(): boolean { return this.status === 0 || this.status === 429 || this.status >= 500; }
}
export function apiErrorMessage(status: number, code?: string | null): string {
  if (code && code in messages) return messages[code as ApiErrorCode];
  if (status === 404) return "No existen datos para la fecha solicitada.";
  if (status === 400) return "La solicitud no es válida.";
  if (status === 422) return "La fecha solicitada no puede consultarse.";
  if (status === 503) return "El servidor todavía no está disponible. Es posible que Render esté iniciándose.";
  if (status >= 500) return "El servidor presentó un error. Intenta nuevamente.";
  return "No fue posible conectar con la API meteorológica.";
}
async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!API_BASE_URL) throw new ApiRequestError("Falta configurar VITE_API_BASE_URL.", 0);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET", headers: {Accept: "application/json"}, signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiRequestError("No se pudo conectar con el backend. Comprueba la conexión y el dominio autorizado en CORS.", 0);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? (body as ApiErrorResponse).error : null;
    throw new ApiRequestError(apiErrorMessage(response.status, code), response.status, code);
  }
  if (!body || typeof body !== "object") throw new ApiRequestError("La API devolvió una respuesta vacía o inválida.", 502);
  return body as T;
}
export const weatherApi = {
  health: (signal?: AbortSignal) => apiGet<HealthResponse>("/api/health", signal),
  availability: (signal?: AbortSignal) => apiGet<AvailabilityResponse>("/api/availability", signal),
  weather: (date: string, signal?: AbortSignal) =>
    apiGet<WeatherResponse>(`/api/weather/${encodeURIComponent(date)}`, signal),
};
