import {test,expect} from "@playwright/test";
const choose = async (page: import("@playwright/test").Page, year:string, month:string, day:string) => {
  await expect(page.locator("#year")).toBeEnabled();
  await page.locator("#year").selectOption(year);
  await page.locator("#month").selectOption(month);
  await page.locator("#day").selectOption(day);
};
test("día completo 2026-06-15 y tres gráficos, logo y enlace a Excel original",async({page},testInfo)=>{
  await page.goto("/");
  await expect(page.getByText("API conectada y datos listos")).toBeVisible();
  const logo=page.locator("header .logo-img");
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((x:HTMLImageElement)=>x.complete&&x.naturalWidth>0)).toBe(true);
  await expect(page.getByText("Logo pendiente")).toHaveCount(0);
  await choose(page,"2026","6","15");
  await expect(page.getByRole("heading",{name:"15 de junio de 2026"})).toBeVisible();
  await expect(page.locator(".plot canvas")).toHaveCount(3);
  await expect(page.getByText("Metadatos de sincronización disponibles")).toBeVisible();
  await expect(page.getByRole("link",{name:/Abrir Excel original en Google Drive/}))
    .toHaveAttribute("href",/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view$/);
  await expect(page.getByText("Sincronización no verificable")).toHaveCount(0);
  await page.screenshot({path:`test-results/${testInfo.project.name}-junio-2026.png`,fullPage:true});
});
test("2025-03-05: fecha contrastada con el Excel; indicadores y tres gráficos",async({page})=>{
  await page.goto("/");
  await choose(page,"2025","3","5");
  await expect(page.getByRole("heading",{name:"5 de marzo de 2025"})).toBeVisible();
  await expect(page.locator(".plot canvas")).toHaveCount(3);
  for(const name of ["Velocidad media","Velocidad máxima","Máximo diario","Media diaria","Mínima","Máxima"]){
    await expect(page.getByText(name,{exact:true}).first()).toBeVisible();
  }
});
test("2025-04-01: período parcial, advertencias visibles y detalles desplegables",async({page})=>{
  await page.goto("/");
  await choose(page,"2025","4","1");
  await expect(page.getByRole("heading",{name:"1 de abril de 2025"})).toBeVisible();
  await expect(page.getByText("Registros incompletos para la fecha seleccionada")).toBeVisible();
  await expect(page.getByText("Advertencias de calidad")).toBeVisible();
  await page.getByText("Ver indicadores técnicos adicionales").click();
  await expect(page.getByText("Mediciones inválidas de viento")).toBeVisible();
});
test("enero de 2024 no aparece entre las fechas seleccionables",async({page})=>{
  await page.goto("/");
  await expect(page.locator("#year")).toBeEnabled();
  await page.locator("#year").selectOption("2024");
  const choices=await page.locator("#month option").allTextContents();
  expect(choices.some(s=>s.trim().toLowerCase()==="enero")).toBe(false);
});
test("sin backend muestra error comprensible y permite reintento",async({page})=>{
  await page.route("**/api/health",route=>route.abort("failed"));
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"No fue posible cargar la disponibilidad"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Volver a intentar"})).toBeVisible();
  await expect(page.locator(".plot canvas")).toHaveCount(0);
});
test("no existe desbordamiento horizontal en la pantalla",async({page})=>{
  await page.goto("/");
  await expect(page.locator("#year")).toBeEnabled();
  const widths=await page.evaluate(()=>({total:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(widths.total).toBeLessThanOrEqual(widths.viewport+2);
});
