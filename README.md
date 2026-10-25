# Observatorio Meteorológico URBE

Frontend del Diplomado en Inteligencia Artificial de la Universidad Privada Dr. Rafael Belloso Chacín. Autor: Luis Romero. Estación Meteorológica URBE, Maracaibo.

## Preparación
Requiere Node.js 20 o superior:
```bash
npm install
cp .env.example .env
npm run dev
npm run build
```
En Windows, copia manualmente `.env.example` a `.env`. Cambia `VITE_API_URL` al dominio real de la API Express en Render.

## Despliegue
En Vercel importa el repositorio, usa Framework Vite, build `npm run build`, output `dist`, y define `VITE_API_URL`. La API debe permitir CORS desde el dominio del frontend.

## Datos
El navegador **nunca abre Excel**. Usa exclusivamente los endpoints `/api/health`, `/api/availability` y `/api/weather/YYYY-MM-DD`. No se cargan registros ficticios. Los datos nulos no se sustituyen por 0. Ver [contrato](docs/api-contract.md).

## Logo URBE
**Pendiente recibir el logo oficial del profesor**: ubicar en `public/assets/urbe-logo.png` y reemplazar el marcador temporal de `src/App.tsx`; no usar logotipos inventados.

## Estructura
`src/components` selección; `src/charts` Chart.js; `src/services` fetch; `src/types` contratos; `src/styles` CSS; `docs` integración.
