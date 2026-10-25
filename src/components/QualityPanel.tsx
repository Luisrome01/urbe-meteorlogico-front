import type {WeatherResponse} from "../types/weather";
import {numberLabel, driveFileUrl, hasSyncMetadata, maracaiboTimestamp} from "../utils/weather";

export function QualityPanel({data}: {data: WeatherResponse["quality"]}) {
  const summary = [
    ["Registros observados",numberLabel(data.observedCount)],
    ["Registros esperados",numberLabel(data.expectedCount)],
    ["Intervalo nominal",numberLabel(data.intervalMinutes," min")],
    ["Intervalos irregulares",numberLabel(data.irregularGapCount)],
  ] as const;
  const details = [
    ["Registros duplicados",numberLabel(data.duplicateCount)],
    ["Mediciones inválidas de viento",numberLabel(data.invalidWind)],
    ["Mediciones inválidas de radiación",numberLabel(data.invalidSolar)],
    ["Mediciones inválidas de temperatura",numberLabel(data.invalidTemperature)],
    ["Fuera de malla temporal",numberLabel(data.offGridCount)],
    ["Slots duplicados",numberLabel(data.duplicateSlotCount)],
    ["Unidades desconocidas",data.unknownUnits ? "Sí" : "No"],
  ] as const;
  return <section className="card analysis quality-panel">
    <div className="eyebrow">CONTROL DE CALIDAD</div>
    <h3>Integridad de los registros</h3>
    <p>Resultados de calidad proporcionados por el backend, sin modificar sus cálculos.</p>
    <div className="origin quality-primary">{summary.map(([label,value]) =>
      <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
    <div className={data.warnings.length ? "notice quality-alert" : "quality-ok"} role="status">
      <strong>{data.warnings.length ? "Advertencias de calidad" : "Sin advertencias adicionales"}</strong>
      {data.warnings.length > 0 && <ul>{data.warnings.map((message,i)=><li key={i}>{message}</li>)}</ul>}
    </div>
    <details className="quality-details">
      <summary>Ver indicadores técnicos adicionales</summary>
      <div className="origin">{details.map(([label,value]) =>
        <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
    </details>
  </section>;
}
export function SourcePanel({data}: {data: WeatherResponse["source"]}) {
  const viewUrl = driveFileUrl(data.driveFileId);
  const complete = hasSyncMetadata(data);
  return <section className="card analysis source-panel">
    <div className="eyebrow">TRAZABILIDAD DE DATOS</div>
    <h3>Procedencia del archivo Excel</h3>
    <p>El backend procesa archivos Excel originales sincronizados desde el repositorio meteorológico URBE en Google Drive. La aplicación no procesa ni altera los originales.</p>
    <div className="origin">
      <div><span>Archivo consultado</span><b>{data.filename || "No informado"}</b></div>
      <div><span>Google Drive ID</span><b className="hash">{data.driveFileId || "No informado"}</b></div>
      <div><span>SHA-256 del archivo</span><b className="hash">{data.sha256 || "No informado"}</b></div>
      <div><span>Última sincronización</span><b>{maracaiboTimestamp(data.syncedAt)}</b></div>
    </div>
    <div className="source-footer">
      <div className={complete ? "source-verification valid" : "source-verification"}>
        {complete ? "Metadatos de sincronización disponibles" : "Sincronización no verificable: faltan metadatos completos"}
      </div>
      {viewUrl ? <a className="source-link" href={viewUrl} target="_blank" rel="noopener noreferrer">
        Abrir Excel original en Google Drive <span aria-hidden="true">↗</span>
      </a> : <span className="source-unavailable">Enlace al Excel no disponible: falta el ID de Drive.</span>}
    </div>
    <p className="note">La apertura del archivo depende de los permisos de acceso establecidos en Google Drive.</p>
  </section>;
}
