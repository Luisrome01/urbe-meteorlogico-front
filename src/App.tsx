import {useEffect, useState} from "react";
import DateSelector from "./components/DateSelector";
import {WeatherPanels} from "./components/DataPanel";
import {QualityPanel,SourcePanel} from "./components/QualityPanel";
import {Feedback} from "./components/Feedback";
import {ApiRequestError, API_BASE_URL, weatherApi} from "./services/api";
import {availableDate, isCompleteResponse, localDateLabel, hasSyncMetadata, isPartialDay, missingCoverageLabels} from "./utils/weather";
import type {AvailabilityResponse, HealthResponse, WeatherResponse} from "./types/weather";

type State = "loading"|"ready"|"error";
export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [bootState, setBootState] = useState<State>("loading");
  const [bootError, setBootError] = useState<ApiRequestError | null>(null);
  const [bootRetry, setBootRetry] = useState(0);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [report, setReport] = useState<WeatherResponse | null>(null);
  const [dateState, setDateState] = useState<"idle"|State>("idle");
  const [dateError, setDateError] = useState<ApiRequestError | null>(null);
  const [dateRetry, setDateRetry] = useState(0);
  const selected = year && month && day ?
    `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}` : "";

  useEffect(() => {
    const controller = new AbortController();
    setBootState("loading"); setBootError(null); setAvailability(null); setHealth(null);
    const run = async () => {
      if (!API_BASE_URL) throw new ApiRequestError("Falta configurar VITE_API_BASE_URL.", 0);
      const status = await weatherApi.health(controller.signal);
      if (status.status !== "ok" || !status.dataReady) {
        throw new ApiRequestError("La API responde, pero sus datos meteorológicos todavía no están listos.", 503, "DATA_NOT_READY");
      }
      if (controller.signal.aborted) return;
      setHealth(status);
      const dates = await weatherApi.availability(controller.signal);
      if (dates.timezone !== "America/Caracas" || !Array.isArray(dates.years)) {
        throw new ApiRequestError("El servidor entregó una disponibilidad inválida.", 502);
      }
      if (!controller.signal.aborted) {setAvailability(dates);setBootState("ready");}
    };
    run().catch(error => {
      if (!controller.signal.aborted) {
        setBootError(error instanceof ApiRequestError ? error : new ApiRequestError("Error al consultar el servicio meteorológico.", 0));
        setBootState("error");
      }
    });
    return () => controller.abort();
  }, [bootRetry]);

  useEffect(() => {
    const controller = new AbortController();
    setReport(null); setDateError(null);
    if (bootState !== "ready" || !selected || !availability) {
      setDateState("idle"); return () => controller.abort();
    }
    if (!availableDate(availability, selected)) {
      setDateError(new ApiRequestError("La fecha no está disponible en el inventario oficial.", 404));
      setDateState("error"); return () => controller.abort();
    }
    setDateState("loading");
    weatherApi.weather(selected, controller.signal).then(data => {
      if (!isCompleteResponse(data, selected)) {
        throw new ApiRequestError("La API devolvió una fecha diferente o un informe incompleto.", 502);
      }
      if (!controller.signal.aborted) {setReport(data);setDateState("ready");}
    }).catch(error => {
      if (!controller.signal.aborted) {
        setDateError(error instanceof ApiRequestError ? error : new ApiRequestError("Error inesperado al consultar los datos.", 0));
        setDateState("error");
      }
    });
    return () => controller.abort();
  }, [selected, availability, bootState, dateRetry]);

  const selectedMonth = availability?.years.find(y=>String(y.year)===year)
    ?.months.find(m=>String(m.month)===month);
  return <div className="app">
    <header><div className="container top">
      <div className="identity">
        <img className="logo-img" src="/assets/urbe-logo.png" alt="Logo oficial de la Universidad Privada Dr. Rafael Belloso Chacín (URBE)" width={92} height={82} />
        <div><strong>Universidad Privada Dr. Rafael Belloso Chacín. Decanato de Extensión. Diplomado en Inteligencia Artificial</strong>
          <p>Estación Meteorológica URBE, Maracaibo</p></div>
      </div>
      <div className="author">PROYECTO ACADÉMICO<strong>Luis Romero</strong></div>
    </div></header>
    <main className="container">
      <section className="intro">
        <div className="eyebrow">ANÁLISIS CIENTÍFICO · MARACAIBO, VENEZUELA</div>
        <h1>Observatorio Meteorológico <em>URBE</em></h1>
        <p>Consulta de viento, radiación solar y temperatura exterior a partir de los registros instrumentales de la estación, sin sustituir fechas ni generar valores ficticios.</p>
      </section>
      <section className="card selection" aria-label="Selección del período">
        <div className="sectionhead"><div><h2>Período de observación</h2>
          <p>Selecciona únicamente fechas verificadas por el repositorio.</p></div>
          <small>America/Caracas · UTC−4</small></div>
        <DateSelector data={availability} year={year} month={month} day={day}
          onYear={v=>{setYear(v);setMonth("");setDay("");}}
          onMonth={v=>{setMonth(v);setDay("");}} onDay={setDay}/>
        {selectedMonth && <p className="month-note">Días consultables en este mes: <strong>{selectedMonth.days.length}</strong>.
          La disponibilidad procede del inventario real; pueden existir períodos incompletos.</p>}
        <div className="status" aria-live="polite">
          <span className={bootState==="ready"?"dot online":"dot"}/>
          <span>{bootState==="loading"?"Comprobando servicio":bootState==="ready"?"API conectada y datos listos":"Sin conexión confirmada"}</span>
          {health && <span>· {health.monthsIndexed} meses indexados</span>}
          <span>·</span> Fecha consultada: <b>{selected || "Sin seleccionar"}</b>
        </div>
      </section>
      {bootState==="loading" && <Feedback title="Conectando con la estación"
        description="Verificando la API y el inventario de fechas. El servicio de Render puede tardar en activarse después de un período de inactividad."/>}
      {bootState==="error" && <Feedback title="No fue posible cargar la disponibilidad"
        error={bootError} onRetry={()=>setBootRetry(n=>n+1)}/>}
      {bootState==="ready" && dateState==="idle" && <Feedback title="Selecciona una fecha para comenzar"
        description="Los gráficos se generan exclusivamente con observaciones reales devueltas por el backend. Enero de 2024 no tiene archivo fuente."/>}
      {bootState==="ready" && dateState==="loading" && <Feedback title="Consultando registros"
        description={`Recuperando las mediciones de ${localDateLabel(selected)}…`}/>}
      {bootState==="ready" && dateState==="error" && <Feedback title="No fue posible mostrar las mediciones"
        error={dateError} onRetry={()=>setDateRetry(n=>n+1)}/>}
      {bootState==="ready" && dateState==="ready" && report && <div className="results">
        <div className="resulttitle"><div><div className="eyebrow">RESULTADOS DE OBSERVACIÓN</div>
          <h2>{localDateLabel(report.date)}</h2></div><span>{hasSyncMetadata(report.source) ? "Metadatos de fuente disponibles" : "Procedencia sin verificar"}</span></div>
        {isPartialDay(report) && <div className="partial-banner" role="status"><strong>Registros incompletos para la fecha seleccionada</strong><p>Los indicadores reflejan únicamente las mediciones disponibles. {missingCoverageLabels(report).join(" · ")}. Consulta las advertencias y el control de calidad.</p></div>}
        <WeatherPanels data={report}/>
        <QualityPanel data={report.quality}/>
        <SourcePanel data={report.source}/>
      </div>}
    </main>
    <footer><div className="container foot">
      <span>Universidad Privada Dr. Rafael Belloso Chacín · Diplomado en Inteligencia Artificial</span>
      <span>Observatorio Meteorológico URBE · Luis Romero</span>
    </div></footer>
  </div>;
}
