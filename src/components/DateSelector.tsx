import type {AvailabilityResponse} from "../types/weather";
const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export default function DateSelector({data, year, month, day, onYear, onMonth, onDay}: {
  data: AvailabilityResponse | null;
  year: string; month: string; day: string;
  onYear: (value: string) => void; onMonth: (value: string) => void; onDay: (value: string) => void;
}) {
  const years = data?.years ?? [];
  const selectedYear = years.find(y => String(y.year) === year);
  const selectedMonth = selectedYear?.months.find(m => String(m.month) === month);
  return <div className="selectors">
    <label htmlFor="year">Año
      <select id="year" value={year} disabled={!years.length} onChange={e => onYear(e.target.value)}>
        <option value="">Seleccionar año</option>
        {years.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
      </select>
    </label>
    <label htmlFor="month">Mes
      <select id="month" value={month} disabled={!selectedYear} onChange={e => onMonth(e.target.value)}>
        <option value="">Seleccionar mes</option>
        {selectedYear?.months.map(m => <option key={m.month} value={m.month}>{months[m.month - 1]}</option>)}
      </select>
    </label>
    <label htmlFor="day">Día
      <select id="day" value={day} disabled={!selectedMonth} onChange={e => onDay(e.target.value)}>
        <option value="">Seleccionar día</option>
        {selectedMonth?.days.map(d => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
      </select>
    </label>
  </div>;
}
