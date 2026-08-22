import type { Route } from "../data/hikingDb";

type PdfPage = { bytes: Uint8Array; width: number; height: number };

const encoder = new TextEncoder();
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN = 88;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function joinBytes(chunks: Uint8Array[]) {
  const output = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

function cleanRoadbook(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "• ")
    .replace(/[|]/g, " · ")
    .replace(/[`*_]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const character of paragraph.trim()) {
      const nextLine = line + character;
      if (line && context.measureText(nextLine).width > width) {
        lines.push(line);
        line = character;
      } else {
        line = nextLine;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("无法生成 PDF 页面")), "image/jpeg", 0.86);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function buildPdf(pages: PdfPage[]) {
  const objects: Uint8Array[] = [];
  const pageObjectIds = pages.map((_, index) => 3 + index * 3);

  objects.push(encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(encoder.encode(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`));

  pages.forEach((page, index) => {
    const pageObjectId = pageObjectIds[index];
    const contentObjectId = pageObjectId + 1;
    const imageObjectId = pageObjectId + 2;
    const content = "q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n";

    objects.push(encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`));
    objects.push(encoder.encode(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`));
    objects.push(joinBytes([
      encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>\nstream\n`),
      page.bytes,
      encoder.encode("\nendstream"),
    ]));
  });

  const header = encoder.encode("%PDF-1.4\n");
  const chunks: Uint8Array[] = [header];
  const offsets: number[] = [];
  let offset = header.length;

  objects.forEach((object, index) => {
    offsets.push(offset);
    const wrapped = joinBytes([encoder.encode(`${index + 1} 0 obj\n`), object, encoder.encode("\nendobj\n")]);
    chunks.push(wrapped);
    offset += wrapped.length;
  });

  const xrefOffset = offset;
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    "0000000000 65535 f \n",
    ...offsets.map((item) => `${String(item).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  ].join("");
  chunks.push(encoder.encode(xref));
  return joinBytes(chunks);
}

export async function createRoutePdf(route: Route) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器不支持 PDF 导出");

  const pages: PdfPage[] = [];
  let y = MARGIN;
  const startPage = () => {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    context.fillStyle = "#065f46";
    context.fillRect(0, 0, PAGE_WIDTH, 22);
    context.fillStyle = "#64748b";
    context.font = "500 22px 'Microsoft YaHei', sans-serif";
    context.fillText("欧洲一日徒步 · 路线路书", MARGIN, 55);
    y = 102;
  };
  const finishPage = async () => {
    context.fillStyle = "#64748b";
    context.font = "500 18px 'Microsoft YaHei', sans-serif";
    context.fillText("由欧洲徒步生成", MARGIN, PAGE_HEIGHT - 46);
    pages.push({ bytes: await canvasToJpeg(canvas), width: PAGE_WIDTH, height: PAGE_HEIGHT });
  };
  const ensureSpace = async (height: number) => {
    if (y + height <= PAGE_HEIGHT - MARGIN) return;
    await finishPage();
    startPage();
  };
  const drawLines = async (lines: string[], font: string, color: string, lineHeight: number, gap = 0) => {
    context.font = font;
    context.fillStyle = color;
    for (const line of lines) {
      await ensureSpace(lineHeight);
      if (line) context.fillText(line, MARGIN, y);
      y += lineHeight;
    }
    y += gap;
  };

  startPage();
  context.font = "800 46px 'Microsoft YaHei', sans-serif";
  await drawLines(wrapText(context, route.title, CONTENT_WIDTH), context.font, "#111827", 62, 22);
  await drawLines([
    `出发地：${route.departure}`,
    `难度：${route.difficultyCode} · ${route.difficulty}`,
    `路线距离：${route.distance}    徒步耗时：${route.duration}    累计爬升：${route.elevationGain}`,
  ], "600 26px 'Microsoft YaHei', sans-serif", "#065f46", 42, 28);
  await drawLines(wrapText(context, route.description, CONTENT_WIDTH), "400 26px 'Microsoft YaHei', sans-serif", "#334155", 42, 34);
  await drawLines(["详细徒步路书"], "800 34px 'Microsoft YaHei', sans-serif", "#111827", 48, 14);
  await drawLines(wrapText(context, cleanRoadbook(route.roadBook), CONTENT_WIDTH), "400 24px 'Microsoft YaHei', sans-serif", "#334155", 39);
  await finishPage();

  return new Blob([buildPdf(pages)], { type: "application/pdf" });
}
