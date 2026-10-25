const site="https://urbe-meteorlogico-front.onrender.com";
const api="https://urbe-meteorlogico-api.onrender.com";
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function verify(){
  const page=await fetch(site+"/",{signal:AbortSignal.timeout(30000)});
  if(!page.ok)throw Error("Frontend HTTP "+page.status);
  const html=await page.text();
  const script=html.match(/src="([^"]+\.js)"/)?.[1];
  if(!script)throw Error("HTML sin bundle Vite");
  const js=await fetch(new URL(script,site),{signal:AbortSignal.timeout(30000)});
  if(!js.ok)throw Error("Bundle JS no accesible");
  const code=await js.text();
  if(!code.includes("Abrir Excel original en Google Drive") ||
     !code.includes("Registros incompletos para la fecha seleccionada"))
     throw Error("Render todavía publica la versión anterior");
  const logo=await fetch(site+"/assets/urbe-logo.png",{signal:AbortSignal.timeout(30000)});
  if(!logo.ok || !(logo.headers.get("content-type")||"").startsWith("image/"))
     throw Error("Logo URBE inaccesible");
  const health=await fetch(api+"/api/health",{headers:{Origin:site},signal:AbortSignal.timeout(60000)});
  if(!health.ok || health.headers.get("access-control-allow-origin")!==site)
     throw Error("Backend sin CORS autorizado para el frontend en Render");
  const body=await health.json();
  if(body.status!=="ok" || body.dataReady!==true)throw Error("Backend todavía no está listo");
  return {site,script,logo:logo.status,monthsIndexed:body.monthsIndexed,cors:health.headers.get("access-control-allow-origin")};
}
for(let attempt=1;attempt<=18;attempt++){
  try{
    const data=await verify();
    console.log("SITIO PÚBLICO ACTUALIZADO:",JSON.stringify(data));
    process.exit(0);
  }catch(error){
    console.log("Intento "+attempt+"/18: "+error.message);
    if(attempt===18)process.exit(1);
    await pause(10000);
  }
}
