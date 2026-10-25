// Pruebas de humo contra el backend REAL: sin fixtures ni cálculos meteorológicos en frontend.
const base = (process.env.URBE_API_URL || "https://urbe-meteorlogico-api.onrender.com").replace(/\/+$/, "");
const tests = [];
function test(name, assertion) { tests.push({name, assertion}); }
async function request(path) {
  const response = await fetch(base + path, {headers:{Accept:"application/json"},signal:AbortSignal.timeout(90000)});
  const body = await response.json();
  return {status:response.status,body};
}
const approx=(actual,expected,tolerance=0.01)=>typeof actual==="number" && Math.abs(actual-expected)<tolerance;
let health,available,june,april,missing,invalid,range;
try {
  [health,available,june,april,missing,invalid,range] = await Promise.all([
    request("/api/health"),request("/api/availability"),
    request("/api/weather/2026-06-15"),request("/api/weather/2025-04-01"),
    request("/api/weather/2024-01-01"),request("/api/weather/2026-02-30"),
    request("/api/weather/2026-08-15")
  ]);
} catch(error) { console.error("La API pública no respondió:",error);process.exit(1); }
test("API lista con 35 meses",()=>health.status===200&&health.body.status==="ok"&&health.body.dataReady===true&&health.body.monthsIndexed===35);
test("Disponibilidad real America/Caracas",()=>available.status===200&&available.body.timezone==="America/Caracas"&&Array.isArray(available.body.years));
test("2026-06-15: viento real, radiación y temperatura",()=>june.status===200&&june.body.date==="2026-06-15"&&approx(june.body.wind.mean,3.2674277778)&&june.body.solar.max===845&&approx(june.body.temperature.mean,29.6668595679));
test("2025-04-01: cobertura parcial",()=>april.status===200&&april.body.date==="2025-04-01"&&approx(april.body.wind.coveragePct,55.9,0.2)&&april.body.quality.warnings.length>0);
test("2024-01-01: mes ausente",()=>missing.status===404&&missing.body.error==="SOURCE_MONTH_UNAVAILABLE");
test("2026-02-30: fecha inválida",()=>invalid.status===400&&invalid.body.error==="INVALID_DATE");
test("2026-08-15: fuera de rango",()=>range.status===422&&range.body.error==="OUT_OF_ACADEMIC_RANGE");
test("Trazabilidad de Excel oficial",()=>typeof june.body.source.filename==="string"&&typeof june.body.source.driveFileId==="string"&&typeof june.body.source.sha256==="string"&&typeof june.body.source.syncedAt==="string");
test("24 horas para solar y temperatura",()=>june.body.solar.hourly.length===24&&june.body.temperature.hourly.length===24);
let failures=0;for(const {name,assertion} of tests){let pass=false;try{pass=Boolean(assertion())}catch{}console.log((pass?"✓":"✗")+" "+name);if(!pass)failures++}
if(failures){console.error(`${failures} de ${tests.length} verificaciones fallaron.`);process.exit(1)}
console.log(`Todas las ${tests.length} verificaciones del backend real pasaron.`);
