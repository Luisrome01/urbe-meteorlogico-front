# Revisión final de la aplicación meteorológica URBE
**Práctica:** Aplicación HTML interactiva de datos meteorológicos URBE. Docente: Prof. Alejandro López-González. **Estudiante:** Luis Romero. **Fecha:** 25 de octubre de 2026.

## Arquitectura y autenticidad
- Frontend: React + Vite + TypeScript + Chart.js (Render Static Site).
- Backend: Express/Node.js en Render. Fuente: 35 Excel originales del repositorio Drive URBE, sincronizados por el backend en cada despliegue.
- Flujo: navegador → /api/health → /api/availability → /api/weather/YYYY-MM-DD → gráficos y trazabilidad. No hay procesamiento Excel, datos estáticos ni valores meteorológicos inventados en el navegador.
- El frontend muestra las advertencias e intervalos producidos por el backend. Los promedios aritméticos y las reglas de suficiencia se documentan en el backend; no se recalculan al mostrar gráficas.

## Correcciones de dos fallas REALES detectadas en la versión anterior
1. **Afirmación prematura sobre procedencia:** el encabezado decía «Fuente oficial sincronizada» aunque no comprobaba la presencia de `filename`, ID Drive, SHA-256 y fecha de sincronización. **Corrección:** mensaje condicionado a metadatos completos; si faltan, procedencia sin verificar. Pruebas unitarias cubren campos omitidos/fecha inválida.
2. **Trazabilidad incompleta:** se mostraban identificadores de archivo y fechas en bruto, pero no se podía abrir el archivo Excel original desde el dashboard ni conocer directamente la hora local. **Corrección:** enlace construido desde el ID real y sincronización formateada en `America/Caracas`; se indica si falta ID o metadato. Pruebas unitarias cubren URL y zona horaria.

**Mejoras adicionales:** indicador destacado de fecha parcial, advertencias siempre visibles, detalle técnico colapsable sin pérdida de datos, ajustes sutiles de ancho/espaciado responsive y tests automáticos para desktop y móvil.

## Comprobaciones reproducibles
- `npm test`: test de nulos/cero, fecha local, bins, fechas permitidas, metadatos, zona horaria y parcialidad.
- `npm run build`: typecheck y generación de archivos `dist/`.
- `npm run smoke:api`: consulta la API de Render y comprueba **2026-06-15** completo, **2025-03-05** disponible con seis métricas, **2025-04-01** parcial, **2024-01-01** sin fuente, fecha imposible, fecha fuera de rango, 24 horas, metadata.
- `npm run test:e2e`: Chromium escritorio y emulación móvil conectados a API real; verifica logo, selector, tres canvas, trazabilidad, advertencias, colapso, enero ausente, fallo temporal de API y ancho móvil. Las capturas quedan en artefactos de GitHub Actions.

## Valores independientes para la exposición
Estos valores publicados en `backend/docs/validated-cases.md` provienen de comparaciones independientes contra Excel:
| Día | Indicador | Valor | Unidad |
|---|---|---:|---|
| 2026-06-15 | Viento medio | 3.2674277778 | m/s |
| 2026-06-15 | Viento máximo | 7.59968 | m/s |
| 2026-06-15 | Radiación máxima | 845 | W/m² |
| 2026-06-15 | Temperatura media | 29.6668595679 | °C |
| 2026-06-15 | Temperatura mínima | 27.3333333333 | °C |
| 2026-06-15 | Temperatura máxima | 33.9444444444 | °C |
| 2025-04-01 | Cobertura viento | ≈55.9 | % |

Para **2025-03-05**, la API real devolvió viento medio **4.9143 m/s**, viento máximo **7.5997 m/s**, radiación máxima **711 W/m²**, temperatura media **27.6497 °C**, mínima **25.7222 °C** y máxima **30.3333 °C**. El estudiante indicó haber contrastado este día con el Excel original; estos números se extrajeron de las respuestas API registradas en GitHub Actions. La prueba adicional comprueba que la suma de frecuencias del histograma equivale a todos los registros válidos.

## Requisitos de entrega aún independientes del frontend
La guía requiere **informe PDF máximo 4 páginas** con IA utilizada, arquitectura, fuente, dos correcciones, pruebas y validación; también **capturas de tres gráficas y evidencia de la fuente**, más tabla de tres valores contrastados. Se preparó un informe PDF de **cuatro páginas**, capturas detalladas de las tres gráficas, capturas completas de escritorio/móvil y un ZIP con evidencias como archivos de entrega independientes del repositorio. Conviene entregar el PDF y el ZIP junto al código reproducible.
