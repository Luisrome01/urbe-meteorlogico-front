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

## Despliegue en Render (frontend estático)

**Proveedor único de despliegue: Render**. El frontend es un **Static Site**; el backend sigue siendo el servicio Node.js independiente.

- Repositorio: `https://github.com/Luisrome01/urbe-meteorlogico-front`
- Rama: `main` (o la rama de desarrollo hasta fusionarla)
- Build Command: `npm install --no-audit --no-fund && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://urbe-meteorlogico-api.onrender.com`
- Auto-Deploy: activado.

El archivo `render.yaml` documenta y automatiza la configuración del Static Site (incluido el rewrite para SPA). En Render también puede crearse directamente desde el panel o la integración de ChatGPT. No necesitamos un segundo Node.js Web Service ni Next.js.

**CORS obligatorio**: después de crear el Static Site, añadir su origen real `https://<nombre>.onrender.com` (sin barra final) a `FRONTEND_ORIGIN` del backend Render, junto a `http://localhost:5173`; no sustituir el origen local si seguimos probando en desarrollo. Las variables de Vite se incluyen en el bundle compilado: nunca guardar secretos en `VITE_*`.

## Reglas científicas

- Período agosto 2023–julio 2026, solamente días realmente existentes; enero 2024 está ausente y abril 2025 es parcial.
- Histograma de velocidades m/s, radiación horaria W/m² y temperatura °C.
- Los valores nulos no se convierten a cero ni se interpolan.
- Todos los resultados, cobertura y advertencias vienen del backend; se muestra archivo Excel, ID Drive, hash SHA-256 y sincronización.
- Documentación detallada: [docs/api-contract.md](docs/api-contract.md).
- El logotipo URBE fue proporcionado por el usuario y está incluido como recurso optimizado en `public/assets/urbe-logo.png`. Aparece en el encabezado institucional, con texto alternativo y ajuste responsivo.

## Estructura

`src/components` tarjetas y filtros · `src/charts` gráficas · `src/services` API · `src/types` contrato · `src/utils` transformaciones puramente visuales · `src/styles` CSS · `docs` metodología de integración.
