import type{Availability,Weather}from"../types/weather";const BASE=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/+$/,"");export const configured=!!BASE;
async function get<T>(p:string,signal:AbortSignal):Promise<T>{if(!BASE)throw Error("Configure VITE_API_URL.");const r=await fetch(BASE+p,{signal});if(!r.ok)throw Error(r.status===404?"No existen registros para la fecha seleccionada.":"Error HTTP "+r.status);return r.json() as Promise<T>}
export const health=(s:AbortSignal)=>get<{status:string}>("/api/health",s);
export const availability=(s:AbortSignal)=>get<Availability>("/api/availability",s);
export const weather=(date:string,s:AbortSignal)=>get<Weather>("/api/weather/"+encodeURIComponent(date),s);