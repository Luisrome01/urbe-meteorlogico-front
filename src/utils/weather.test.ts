import {describe,it,expect} from "vitest";
import {availableDate,hourlySeries,windBinLabel,numberLabel,localDateLabel,isCompleteResponse} from "./weather";
import type {AvailabilityResponse,HourlyPoint,WeatherResponse} from "../types/weather";
describe("histograma y manejo de valores meteorológicos",()=>{
  it("muestra el último intervalo abierto como ≥ 20 m/s",()=>{
    expect(windBinLabel({from:20,to:null})).toBe("≥ 20 m/s");
    expect(windBinLabel({from:2,to:4})).toBe("2–4 m/s");
  });
  it("no sustituye null por cero",()=>{
    expect(numberLabel(null)).toBe("Sin datos");
    expect(numberLabel(0)).not.toBe("Sin datos");
  });
  it("genera 24 posiciones y conserva ausencias sin rellenar",()=>{
    const values: HourlyPoint[]=[
      {hour:0,mean:0,validCount:12,expectedCount:12,sufficient:true},
      {hour:1,mean:null,validCount:0,expectedCount:12,sufficient:false},
      {hour:2,mean:30,validCount:4,expectedCount:12,sufficient:false},
    ];
    const complete=hourlySeries(values,"sufficient"),incomplete=hourlySeries(values,"insufficient");
    expect(complete).toHaveLength(24);
    expect(complete[0]).toBe(0); expect(complete[1]).toBeNull(); expect(complete[2]).toBeNull();
    expect(incomplete[2]).toBe(30);expect(incomplete[1]).toBeNull();
    expect(complete[23]).toBeNull();
  });
  it("selecciona solo fechas autorizadas y nunca enero 2024 si no está",()=>{
    const avail: AvailabilityResponse={timezone:"America/Caracas",lastSync:null,years:[
      {year:2024,months:[{month:2,days:[1,3]}]},
      {year:2025,months:[{month:4,days:[1]}]},
    ]};
    expect(availableDate(avail,"2025-04-01")).toBe(true);
    expect(availableDate(avail,"2025-04-02")).toBe(false);
    expect(availableDate(avail,"2024-01-01")).toBe(false);
    expect(availableDate(avail,"2026-02-30")).toBe(false);
  });
  it("muestra fecha local sin convertirla a UTC",()=>{
    expect(localDateLabel("2026-06-15")).toBe("15 de junio de 2026");
  });
  it("rechaza informes cuya fecha no coincide",()=>{
    const report={date:"2026-06-16",timezone:"America/Caracas",
      wind:{histogram:[]},solar:{hourly:[]},temperature:{hourly:[]},quality:{warnings:[]}} as unknown as WeatherResponse;
    expect(isCompleteResponse(report,"2026-06-15")).toBe(false);
    expect(isCompleteResponse({...report,date:"2026-06-15"},"2026-06-15")).toBe(true);
  });
});
