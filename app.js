const exampleText = "Nowadays, English is becoming more and more important in our daily life. As students, we should spend more time learning English and improving our communication skills.\n\nIn my opinion, reading English books and practicing writing every day are effective ways to improve our English.";
const $ = (id) => document.getElementById(id);
let renderToken = 0;

function getSetting(name, fallback) {
  const input = document.querySelector(`[name="${name}"]:checked`);
  return input ? input.value : fallback;
}

function currentStyle() {
  return { fontSize: 28, lineHeight: "9mm", color: "#000000", mode: getSetting("mode", "copy") };
}

function createPage() {
  const page = document.createElement("article");
  page.className = "page";
  const content = document.createElement("div");
  content.className = "page-content";
  page.append(content);
  return page;
}

function styleLine(line, settings) {
  line.style.fontSize = `${settings.fontSize}px`;
  line.style.lineHeight = settings.lineHeight;
  line.style.color = "#000000";
  if (settings.mode === "outline") line.classList.add("mode-outline");
}

function makeWrappedLines(text, width, settings) {
  const measure = document.createElement("span");
  measure.className = "practice-line measure-surface";
  measure.style.width = `${width}px`;
  measure.style.fontSize = `${settings.fontSize}px`;
  measure.style.lineHeight = settings.lineHeight;
  document.body.append(measure);
  const lines = [];
  const sourceLines = text.replace(/\r\n?/g, "\n").split("\n");
  for (const sourceLine of sourceLines) {
    const words = sourceLine.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(""); continue; }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      measure.textContent = candidate;
      if (current && measure.scrollWidth > width) {
        lines.push(current);
        current = word;
      } else current = candidate;
    }
    if (current) lines.push(current);
  }
  measure.remove();
  return lines.length ? lines : [""];
}

function applyMode(lines, mode) {
  if (mode !== "trace") return lines;
  const result = [];
  for (const line of lines) {
    result.push(line);
    if (line !== "") result.push("");
  }
  return result.length ? result : [""];
}

async function render() {
  const token = ++renderToken;
  await document.fonts.ready;
  if (token !== renderToken) return;
  const rawText = $("essay-input").value;
  const text = rawText.trim();
  const hasContent = /\S/.test(rawText);
  const settings = currentStyle();
  $("char-count").textContent = `字符数：${rawText.length}`;
  $("word-count").textContent = `单词数：${text ? text.split(/\s+/).length : 0}`;
  const pages = $("preview-pages");
  pages.replaceChildren();
  const samplePage = createPage();
  pages.append(samplePage);
  const content = samplePage.querySelector(".page-content");
  const width = content.clientWidth;
  const lineUnit = document.createElement("div");
  lineUnit.style.height = "9mm";
  document.body.append(lineUnit);
  const lineHeightPx = lineUnit.getBoundingClientRect().height;
  lineUnit.remove();
  const capacity = Math.max(1, Math.floor((content.clientHeight - 1) / lineHeightPx));
  const sourceLines = makeWrappedLines(hasContent ? rawText : "请在左侧输入英语作文", width, settings);
  const lines = hasContent ? applyMode(sourceLines, settings.mode) : sourceLines;
  pages.replaceChildren();
  for (let start = 0; start < lines.length; start += capacity) {
    const page = createPage();
    const pageContent = page.querySelector(".page-content");
    lines.slice(start, start + capacity).forEach((value) => {
      const line = document.createElement("div");
      line.className = "practice-line";
      line.textContent = value || "\u00a0";
      styleLine(line, settings);
      if (!hasContent) line.classList.add("placeholder");
      pageContent.append(line);
    });
    pages.append(page);
  }
}

document.querySelectorAll("textarea, input").forEach((input) => input.addEventListener("input", () => {
  render();
}));
$("example-button").addEventListener("click", () => { $("essay-input").value = exampleText; render(); });
$("clear-button").addEventListener("click", () => { $("essay-input").value = ""; render(); });
$("print-button").addEventListener("click", () => window.print());
document.fonts.ready.then(() => { $("font-status").textContent = "字体：衡水体已加载"; render(); });
render();
