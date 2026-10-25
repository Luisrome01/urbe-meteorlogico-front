import {describe,expect,it} from "vitest";
import {ApiRequestError,apiErrorMessage} from "./api";
describe("errores HTTP del backend URBE",()=>{
  it("identifica fechas imposibles",()=>expect(apiErrorMessage(400,"INVALID_DATE")).toContain("formato válido"));
  it("identifica fechas fuera de rango",()=>expect(apiErrorMessage(422,"OUT_OF_ACADEMIC_RANGE")).toContain("fuera del período"));
  it("distingue mes inexistente y día sin datos",()=>{
    expect(apiErrorMessage(404,"SOURCE_MONTH_UNAVAILABLE")).toContain("No existe archivo");
    expect(apiErrorMessage(404,"NO_VALID_DATA_FOR_DATE")).toContain("No hay mediciones válidas");
  });
  it("permite reintentar errores transitorios, no errores de fecha",()=>{
    expect(new ApiRequestError("No disponible",503,"SOURCE_NOT_SYNCED").retryable).toBe(true);
    expect(new ApiRequestError("Fecha inválida",400,"INVALID_DATE").retryable).toBe(false);
    expect(new ApiRequestError("Mes faltante",404,"SOURCE_MONTH_UNAVAILABLE").retryable).toBe(false);
    expect(new ApiRequestError("Fuera de rango",422,"OUT_OF_ACADEMIC_RANGE").retryable).toBe(false);
  });
});
