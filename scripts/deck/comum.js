/* Base comum dos decks do Radar: tema, layouts (CAPA, CONTEUDO, FECHO) e auxiliares de desenho.
   Poppins (D55, Brand Guidelines para PowerPoint), cores Arena, logo oficial.
   Uso: const D = novoDeck({ titulo, rodape, capa }); ... await D.escrever(ficheiro); */
const path = require("path");
const pptxgen = require("pptxgenjs");
const ROOT = path.resolve(__dirname, "../..");
const LOGO = path.join(ROOT, "assets/arena_media_portugal_logo.jpg");
const CAP = f => path.join(ROOT, "deliverables/capturas", f);

const THEME = {
  name: "Arena Radar",
  headFontFace: "Poppins", bodyFontFace: "Poppins",
  colors: { dk1: "0F2623", lt1: "FFFFFF", dk2: "4E5F5C", lt2: "F1F4F3",
            accent1: "328CF5", accent2: "FFDC32", accent3: "00B89B", accent4: "E60000", accent5: "733478", accent6: "1B6FD6",
            hlink: "1B6FD6", folHlink: "733478" },
};
const H = THEME.colors;
// Cores em hexadecimal (do THEME), para o ficheiro não depender de aplicar o tema depois de escrito.
const C = { text1: H.dk1, text2: H.dk2, background1: H.lt1, background2: H.lt2, accent1: H.accent1, accent2: H.accent2 };
const TINT = { ok: "E2F5F0", okInk: "0B6B58", wip: "FFF5C7", wipInk: "5E4B00", todo: "F1F4F3", todoInk: "4E5F5C", line: "DCE3E1" };
const W = 13.333, M = 0.6;
const DEMO = "Demonstração com clientes e marcas fictícios (D33). Sem dados reais.";

function novoDeck({ titulo, rodape, capa }) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13,33 × 7,5 polegadas
  pres.title = titulo;
  pres.author = "Arena Media Portugal";
  pres.company = "Arena Media Portugal";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

  pres.defineSlideMaster({
    title: "CAPA", background: { color: H.dk1 },
    objects: [
      { rect: { x: M, y: 0.6, w: 1.0, h: 1.0, fill: { color: C.background1 }, rectRadius: 0.12 } },
      { image: { path: LOGO, x: M + 0.08, y: 0.68, w: 0.84, h: 0.84 } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.35, w: 9.5, h: 1.3, fontSize: 60, bold: true, color: C.background1, margin: 0, valign: "bottom", align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 3.85, w: 9.5, h: 1.2, fontSize: 24, color: C.background1, margin: 0, valign: "top", align: "left" }, text: "" } },
      { text: { text: capa, options: { x: M, y: 6.55, w: 8, h: 0.4, fontSize: 13, color: C.background2, margin: 0 } } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTEUDO", background: { color: H.lt1 },
    margin: [0.5, M, 0.8, M],
    objects: [
      { text: { text: rodape, options: { x: M, y: 6.95, w: 9, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
      { image: { path: LOGO, x: W - M - 0.42, y: 6.86, w: 0.42, h: 0.42 } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: W - 2 * M, h: 0.85, fontSize: 32, bold: true, color: C.text1, margin: 0, valign: "middle", align: "left" }, text: "" } },
    ],
    slideNumber: { x: W - M - 1.3, y: 6.95, w: 0.7, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
  });
  pres.defineSlideMaster({
    title: "FECHO", background: { color: H.dk1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.6, w: W - 2 * M, h: 0.9, fontSize: 36, bold: true, color: C.background1, margin: 0, align: "left" }, text: "" } },
      { rect: { x: W - M - 0.62, y: 6.62, w: 0.62, h: 0.62, fill: { color: C.background1 }, rectRadius: 0.08 } },
      { image: { path: LOGO, x: W - M - 0.57, y: 6.67, w: 0.52, h: 0.52 } },
      { text: { text: rodape, options: { x: M, y: 6.95, w: 9, h: 0.3, fontSize: 10, color: C.background2, margin: 0 } } },
    ],
    slideNumber: { x: W - M - 1.5, y: 6.95, w: 0.7, h: 0.3, fontSize: 10, color: C.background2, align: "right" },
  });

  const txt = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, margin: 0, fontSize: 15, color: C.text1, valign: "top" }, o));
  const card = (s, x, y, w, h, nome, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background2 }, line: { color: fill || C.background2, width: 0 }, objectName: nome });
  const num = (s, x, y, n, escuro) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: 0.46, h: 0.46, fill: { color: escuro ? C.background1 : C.text1 }, line: { color: escuro ? C.background1 : C.text1, width: 0 }, objectName: "numero " + n });
    txt(s, String(n), { x, y, w: 0.46, h: 0.46, fontSize: 15, bold: true, align: "center", valign: "middle", color: escuro ? C.text1 : C.background1 });
  };
  const legenda = (s, x, y, w, t) => txt(s, t, { x, y, w, h: 0.3, fontSize: 11, color: C.text2, italic: true });
  const img = (s, f, x, y, w, h, nome) => s.addImage({ path: CAP(f), x, y, w, h, objectName: nome, altText: nome });
  const contorno = (s, x, y, w, h) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { type: "none" }, line: { color: TINT.line, width: 1 }, objectName: "moldura" });
  // motivo da capa: radar (círculos concêntricos, varrimento e o ponto amarelo do sinal)
  const radar = (s, cx, cy, k = 1) => {
    [3.2, 2.3, 1.4].forEach((d, i) => s.addShape(pres.shapes.OVAL, { x: cx - d * k / 2, y: cy - d * k / 2, w: d * k, h: d * k, fill: { type: "none" }, line: { color: C.background1, width: 1, transparency: 70 + i * 5 }, objectName: "radar " + i }));
    s.addShape(pres.shapes.LINE, { x: cx, y: cy - 1.6 * k, w: 0, h: 1.6 * k, line: { color: C.accent2, width: 1.5 }, objectName: "varrimento" });
    s.addShape(pres.shapes.OVAL, { x: cx + 0.62 * k, y: cy - 1.0 * k, w: 0.18, h: 0.18, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "sinal" });
  };
  const escrever = async out => {
    await pres.writeFile({ fileName: out });
    const tema = process.env.APPLY_THEME_JS; // opcional: caminho de um apply_theme.js que escreve as cores no tema do ficheiro
    if (tema) { const { applyTheme } = require(tema); await applyTheme(out, THEME); }
    console.log(path.relative(ROOT, out));
  };
  return { pres, THEME, H, C, TINT, W, M, DEMO, ROOT, txt, card, num, legenda, img, contorno, radar, escrever };
}
module.exports = { novoDeck, ROOT };
