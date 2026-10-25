import type {ReactNode} from "react";
import type {WeatherResponse} from "../types/weather";
import {hourLabel, numberLabel} from "../utils/weather";
import {WindChart, SolarChart, TempChart} from "../charts/Charts";

export function Stats({items}: {items: Array<{label: string; value: string}>}) {
  return <div className="stats">{items.map(({label,value}) =>
    <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
function Section({number,name,title,description,items,children}: {
  number:string;name:string;title:string;description:string;
  items:Array<{label:string;value:string}>;children:ReactNode;
}) {
  return <section className="card analysis">
    <div className="eyebrow">{number} / {name}</div>
    <h3>{title}</h3><p>{description}</p>
    <Stats items={items}/>{children}
  </section>;
}
export function WeatherPanels({data}: {data: WeatherResponse}) {
  const {wind,solar,temperature}=data;
  const issues = temperature.hourly.filter(h => h.mean === null || !h.sufficient).map(h => hourLabel(h.hour));
  return <>
    <Section number="01" name="VIENTO" title="Distribución de velocidad"
      description="Histograma de frecuencias absolutas: cantidad de observaciones por intervalo de velocidad."
      items={[
        {label:"Velocidad media",value:numberLabel(wind.mean," m/s")},
        {label:"Velocidad máxima",value:numberLabel(wind.max," m/s")},
        {label:"Registros válidos",value:numberLabel(wind.validCount)},
        {label:"Cobertura",value:numberLabel(wind.coveragePct," %")},
      ]}>
      <WindChart data={wind}/>
    </Section>
    <Section number="02" name="RADIACIÓN SOLAR" title="Perfil horario de irradiancia"
      description="Promedio de registros válidos por hora; irradiancia medida en W/m², no energía acumulada."
      items={[
        {label:"Máximo diario",value:numberLabel(solar.max," W/m²")},
        {label:"Cobertura",value:numberLabel(solar.coveragePct," %")},
        {label:"Horas con registros",value:`${solar.hourly.filter(h=>h.mean!==null).length} / 24`},
      ]}>
      <SolarChart data={solar}/>
      <p className="note">Puntos ámbar: cobertura horaria insuficiente. Huecos: mediciones ausentes.</p>
    </Section>
    <Section number="03" name="TEMPERATURA EXTERIOR" title="Perfil de temperatura por hora"
      description="Temperatura media horaria y señalización de horas con cobertura insuficiente."
      items={[
        {label:"Media diaria",value:numberLabel(temperature.mean," °C")},
        {label:"Mínima",value:numberLabel(temperature.min," °C")},
        {label:"Máxima",value:numberLabel(temperature.max," °C")},
        {label:"Cobertura",value:numberLabel(temperature.coveragePct," %")},
      ]}>
      <TempChart data={temperature}/>
      <p className="note">{issues.length > 0
        ? `Horas ausentes o insuficientes: ${issues.join(", ")}.`
        : "Todas las horas informadas cumplen suficiencia."}</p>
    </Section>
  </>;
}
