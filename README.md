# Observatorio Meteorológico URBE

Frontend científico de **Luis Romero** para el Diplomado en Inteligencia Artificial — Universidad Privada Dr. Rafael Belloso Chacín, Decanato de Extensión. Estación Meteorológica URBE, Maracaibo.

API real: https://urbe-meteorlogico-api.onrender.com. Backend: https://github.com/Luisrome01/urbe-meteorlogico-back.

## Requisitos

Node.js 20+, npm. React, Vite, TypeScript, Chart.js, CSS nativo; sin base de datos, autenticación ni procesamiento Excel en navegador.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows, copia `.env.example` a `.env` manualmente. Su contenido es:

```env
VITE_API_BASE_URL=https://urbe-meteorlogico-api.onrender.com
```

La URL del backend **no es secreta**, pero nunca se deben introducir credenciales en `VITE_*`. Para desarrollo del backend local usar `VITE_API_BASE_URL=http://localhost:3001`.

## Comprobaciones

```bash
npm test
npm run build
npm run smoke:api
```

`npm test`: pruebas unitarias sin internet. `npm run smoke:api`: comprobación **en vivo** de la API Render con registros y errores reales; puede fallar si la API está temporalmente inaccesible. CI automática en GitHub para compilación y unitarias; workflow manual para humo externo.

## Vercel

- Importar el repositorio y seleccionar Framework **Vite**.
- Comando build: `npm run build`. Carpeta de salida: `dist`.
- Producción utiliza `.env.production` con la URL pública real y acepta override con `VITE_API_BASE_URL` en las variables de entorno de Vercel.
- Tras desplegar, copiar el **origen exacto** asignado por Vercel (p. ej. `https://observatorio-urbe.vercel.app`) a `FRONTEND_ORIGIN` en Render. Debe ser sin barra final.
- El backend actualmente autoriza `http://localhost:5173`. Hasta actualizar CORS, el dominio nuevo de Vercel no podrá consumirlo desde el navegador.

## Reglas científicas

- Período agosto 2023–julio 2026, solamente días realmente existentes; enero 2024 está ausente y abril 2025 es parcial.
- Histograma de velocidades m/s, radiación horaria W/m² y temperatura °C.
- Los valores nulos no se convierten a cero ni se interpolan.
- Todos los resultados, cobertura y advertencias vienen del backend; se muestra archivo Excel, ID Drive, hash SHA-256 y sincronización.
- Documentación detallada: [docs/api-contract.md](docs/api-contract.md).
- El logo institucional es **pendiente de colocar el archivo oficial proporcionado por el profesor** en `public/assets/`; la cabecera solo muestra un marcador identificado, sin logo inventado.

## Estructura

`src/components` tarjetas y filtros · `src/charts` gráficas · `src/services` API · `src/types` contrato · `src/utils` transformaciones puramente visuales · `src/styles` CSS · `docs` metodología de integración.
