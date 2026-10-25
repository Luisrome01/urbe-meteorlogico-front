import type {WeatherResponse} from "../types/weather";
import {numberLabel} from "../utils/weather";
export function QualityPanel({data}: {data: WeatherResponse["quality"]}) {
  const items = [
    ["Registros observados",numberLabel(data.observedCount)],
    ["Intervalo nominal",numberLabel(data.intervalMinutes," min")],
    ["Registros esperados",numberLabel(data.expectedCount)],
    ["Duplicados",numberLabel(data.duplicateCount)],
    ["Viento inválido",numberLabel(data.invalidWind)],
    ["Radiación inválida",numberLabel(data.invalidSolar)],
    ["Temperatura inválida",numberLabel(data.invalidTemperature)],
    ["Intervalos irregulares",numberLabel(data.irregularGapCount)],
    ["Fuera de malla temporal",numberLabel(data.offGridCount)],
    ["Slots duplicados",numberLabel(data.duplicateSlotCount)],
    ["Unidades desconocidas",data.unknownUnits ? "Sí" : "No"],
  ] as const;
  return <section className="card analysis">
    <div className="eyebrow">CONTROL DE CALIDAD</div>
    <h3>Integridad de los registros</h3>
    <p>Indicadores producidos por el backend a partir de los archivos originales, sin recálculos del navegador.</p>
    <div className="origin">{items.map(([label,value]) =>
      <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
    <div className={data.warnings.length ? "notice quality-alert" : "quality-ok"} role="status">
      <strong>{data.warnings.length ? "Advertencias de calidad" : "Sin advertencias adicionales"}</strong>
      {data.warnings.length > 0 && <ul>{data.warnings.map((message,i)=><li key={i}>{message}</li>)}</ul>}
    </div>
  </section>;
}
export function SourcePanel({data}: {data: WeatherResponse["source"]}) {
  return <section className="card analysis">
    <div className="eyebrow">TRAZABILIDAD DE DATOS</div>
    <h3>Procedencia del archivo Excel</h3>
    <p>Identificación del archivo oficial utilizado para calcular estos resultados.</p>
    <div className="origin">
      <div><span>Archivo</span><b>{data.filename || "No informado"}</b></div>
      <div><span>Google Drive ID</span><b>{data.driveFileId || "No informado"}</b></div>
      <div><span>SHA-256</span><b className="hash">{data.sha256 || "No informado"}</b></div>
      <div><span>Última sincronización</span><b>{data.syncedAt || "No informada"}</b></div>
      <div><span>Origen</span><b>Estación Meteorológica URBE · Excel oficial</b></div>
    </div>
  </section>;
}
