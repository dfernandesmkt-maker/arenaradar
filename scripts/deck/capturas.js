/* Capturas do protótipo v4 para o deck da direção (RB-10).
   Requer: python3 scripts/v4/gerar_dados.py && python3 prototype/v4/build.py
   Uso: node scripts/deck/capturas.js  →  deliverables/capturas/*.png (2x, tema claro, movimento reduzido) */
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"))); }
const ROOT = path.resolve(__dirname, "../..");
const F = "file://" + path.join(ROOT, "prototype/arena-radar-v4.html") + "#/";
const OUT = path.join(ROOT, "deliverables/capturas");
fs.mkdirSync(OUT, { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
(async () => {
  const b = await chromium.launch(exe);
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce", colorScheme: "light" })).newPage();
  const shot = async (rota, nome, fn) => { await p.goto(F + rota); await p.waitForTimeout(700); await p.addStyleTag({ content: ".top{position:static!important}" }); if (fn) await fn(); await p.waitForTimeout(300); console.log(nome); };
  // 1. Agora: primeiro ecrã
  await shot("vetra/agora", "agora", async () => { await p.screenshot({ path: path.join(OUT, "agora.png") }); });
  // 2. Gaveta do movimento: prova e porquê
  await shot("vetra/agora", "movimento", async () => { await p.click("#feed [data-mv] >> nth=0"); await p.waitForTimeout(600); await p.locator("#drawer").screenshot({ path: path.join(OUT, "movimento.png") }); });
  // 3. Resumo da semana
  await shot("vetra/agora", "resumo", async () => { await p.locator(".summary details").evaluate(e => e.open = false); await p.locator(".summary").screenshot({ path: path.join(OUT, "resumo.png") }); });
  // 4. Antecipar: faixa das 12 semanas
  await shot("vetra/antecipar", "antecipar", async () => { await p.locator("#tlf").evaluate(e => e.closest(".panel").classList.add("cap-tl")); await p.locator(".cap-tl").screenshot({ path: path.join(OUT, "antecipar.png") }); });
  // 5. Choque com o plano
  await shot("vetra/antecipar", "plano", async () => { await p.locator(".plano").screenshot({ path: path.join(OUT, "plano.png") }); });
  // 6. Previsão com sinal precoce
  await shot("vetra/antecipar#p-zefira-inverno", "previsao", async () => { await p.locator("#p-zefira-inverno").screenshot({ path: path.join(OUT, "previsao.png") }); });
  // 7. Torre
  await shot("agencia/torre", "torre", async () => { await p.screenshot({ path: path.join(OUT, "torre.png") }); });
  await b.close();
})();
