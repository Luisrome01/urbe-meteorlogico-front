import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
  testDir:"./e2e", timeout:120000, expect:{timeout:120000},
  retries:process.env.CI?1:0, reporter:process.env.CI?"github":"list",
  use:{baseURL:"http://localhost:5173",trace:"retain-on-failure"},
  projects:[
    {name:"desktop-chromium",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:900}}},
    {name:"mobile-chromium",use:{...devices["iPhone 13"],browserName:"chromium"}},
  ],
  webServer:{
    command:"npm run dev -- --host localhost --port 5173 --strictPort",
    url:"http://localhost:5173",
    reuseExistingServer:!process.env.CI,
    timeout:120000,
    env:{VITE_API_BASE_URL:"https://urbe-meteorlogico-api.onrender.com"},
  },
  outputDir:"test-results",
});
