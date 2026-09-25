import type { Route } from "../data/hikingDb";

type PdfPage = { bytes: Uint8Array; width: number; height: number };
type CanvasPage = { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D };

const encoder = new TextEncoder();
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN = 88;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const GREEN = "#065f46";
const DARK = "#111827";
const BODY = "#334155";
const MUTED = "#64748b";

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
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[|]/g, " · ")
    .replace(/[`*_]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readRoadBookField(roadBook: string, label: string, fallback = "待补充") {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return roadBook.match(new RegExp(`^\\s*-\\s*${escaped}[：:]\\s*(.+)$`, "m"))?.[1]?.trim() || fallback;
}

function readSection(roadBook: string, keyword: string) {
  const match = roadBook.match(new RegExp(`^#{1,3}[^\\n]*${keyword}[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3}\\s|$)`, "m"));
  return cleanRoadbook(match?.[1] || "");
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
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("无法生成 PDF 页面")), "image/jpeg", 0.9);
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

function makeSafeFilename(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[\\/:*?"<>|]/g, "-").trim();
}

function getSubtitle(route: Route) {
  const match = route.title.match(/\(([^)]+)\)/);
  if (match?.[1]) return match[1];
  return route.subtitle || route.departure;
}

function getTimetable(route: Route): [string, string][] {
  const timetable = readSection(route.roadBook, "行程时间表");
  const rows = timetable.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    .map((line) => line.match(/^(\d{1,2}:\d{2})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => [match[1], match[2]] as [string, string]);

  if (rows.length > 0) return rows;
  return [
    [readRoadBookField(route.roadBook, "出发时间", "07:30"), `${route.departure} 出发`],
    [readRoadBookField(route.roadBook, "到达时间", "08:30"), "抵达起点，停车、整备"],
    ["09:00", "开始徒步"],
    [readRoadBookField(route.roadBook, "预计回程时间", "14:00"), "完成徒步并准备返程"],
  ];
}

function getRouteSteps(route: Route) {
  const itinerary = route.roadBook.match(/##[^\n]*徒步路线规划[^\n]*\n([\s\S]*?)(?=\n##|$)/)?.[1] || "";
  const matches = [...itinerary.matchAll(/^###\s*(\d+)\.\s*(.+?)\s*\n([\s\S]*?)(?=^###\s*\d+\.|$)/gm)];
  return matches.map((match) => {
    const body = match[3];
    const field = (label: string) => body.match(new RegExp(`^\\s*-\\s*${label}[：:]\\s*(.+)$`, "m"))?.[1]?.trim() || "";
    return {
      title: `${match[1]}. ${match[2].trim()}`,
      meta: [field("对应路段"), field("耗时")].filter(Boolean).join(" | "),
      description: field("路线说明") || cleanRoadbook(body),
    };
  });
}

function getPhotoText(route: Route) {
  return readSection(route.roadBook, "打卡拍照") || route.photoSpot || "沿途选择视野开阔且安全的位置拍照，避免在湿滑、暴露或无护栏区域停留太久。";
}

export async function createRoutePdf(route: Route) {
  const pages: CanvasPage[] = [];
  let current: CanvasPage;
  let y = MARGIN;

  const addPage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH;
    canvas.height = PAGE_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("浏览器不支持 PDF 导出");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    context.fillStyle = GREEN;
    context.fillRect(MARGIN, 72, CONTENT_WIDTH, 3);
    current = { canvas, context };
    pages.push(current);
    y = 118;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= PAGE_HEIGHT - 120) return;
    addPage();
  };

  const drawText = (text: string, x: number, font: string, color = BODY, width = CONTENT_WIDTH, lineHeight = 38, gap = 0) => {
    current.context.font = font;
    current.context.fillStyle = color;
    const lines = wrapText(current.context, text, width);
    for (const line of lines) {
      ensureSpace(lineHeight);
      if (line) current.context.fillText(line, x, y);
      y += lineHeight;
    }
    y += gap;
  };

  const section = (title: string) => {
    ensureSpace(82);
    y += 10;
    drawText(title, MARGIN, "800 34px 'Microsoft YaHei', 'PingFang SC', sans-serif", DARK, CONTENT_WIDTH, 46, 8);
    current.context.fillStyle = GREEN;
    current.context.fillRect(MARGIN, y, CONTENT_WIDTH, 2);
    y += 34;
  };

  const drawKeyValueGrid = (items: [string, string][]) => {
    const colWidth = CONTENT_WIDTH / 2;
    const labelWidth = 150;
    current.context.font = "700 22px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    for (let i = 0; i < items.length; i += 2) {
      ensureSpace(86);
      const rowY = y;
      for (let col = 0; col < 2; col += 1) {
        const item = items[i + col];
        if (!item) continue;
        const x = MARGIN + col * colWidth;
        current.context.fillStyle = "#f8fafc";
        current.context.fillRect(x, rowY - 30, colWidth - 18, 72);
        current.context.fillStyle = MUTED;
        current.context.font = "700 21px 'Microsoft YaHei', 'PingFang SC', sans-serif";
        current.context.fillText(item[0], x + 18, rowY);
        current.context.fillStyle = DARK;
        current.context.font = "600 22px 'Microsoft YaHei', 'PingFang SC', sans-serif";
        const valueLines = wrapText(current.context, item[1], colWidth - labelWidth - 38).slice(0, 2);
        valueLines.forEach((line, index) => current.context.fillText(line, x + labelWidth, rowY + index * 30));
      }
      y += 86;
    }
    y += 14;
  };

  const drawTimeline = (rows: [string, string][]) => {
    current.context.font = "700 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    for (const [time, activity] of rows) {
      ensureSpace(52);
      current.context.fillStyle = GREEN;
      current.context.fillText(time, MARGIN, y);
      current.context.fillStyle = BODY;
      current.context.font = "500 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      wrapText(current.context, activity, CONTENT_WIDTH - 150).slice(0, 2).forEach((line, index) => {
        current.context.fillText(line, MARGIN + 150, y + index * 32);
      });
      y += 58;
      current.context.font = "700 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    }
    y += 12;
  };

  addPage();

  drawText(`🏔️ ${route.title.replace(/^[^\p{L}\p{N}]+/u, "")}`, MARGIN, "800 50px 'Microsoft YaHei', 'PingFang SC', sans-serif", DARK, CONTENT_WIDTH, 64, 4);
  drawText(getSubtitle(route), MARGIN, "500 italic 30px Georgia, 'Times New Roman', serif", BODY, CONTENT_WIDTH, 42, 16);
  drawText("📷 封面建议：选用路线实景图或 Wikimedia Commons / 自有授权照片，确保图片版权可用于分享。", MARGIN, "500 23px 'Microsoft YaHei', 'PingFang SC', sans-serif", MUTED, CONTENT_WIDTH, 36, 22);

  section("📌 基本信息");
  drawKeyValueGrid([
    ["出发时间", readRoadBookField(route.roadBook, "出发时间", "07:30 AM")],
    ["出发地", readRoadBookField(route.roadBook, "出发地", route.departure)],
    ["目的地", readRoadBookField(route.roadBook, "目的地", getSubtitle(route))],
    ["到达时间", readRoadBookField(route.roadBook, "到达时间", "以现场为准")],
    ["驾车耗时", readRoadBookField(route.roadBook, "驾车耗时", "以当天交通为准")],
    ["徒步耗时", readRoadBookField(route.roadBook, "徒步耗时", route.duration)],
    ["路线距离", readRoadBookField(route.roadBook, "路线距离", route.distance)],
    ["休息拍照", readRoadBookField(route.roadBook, "休息与拍照", "按体力与天气安排")],
    ["预计返程", readRoadBookField(route.roadBook, "预计回程时间", "下午返程")],
    ["线路强度", readRoadBookField(route.roadBook, "线路强度", `${route.difficultyCode} ${route.difficulty}`)],
  ]);

  section("🚗 行程时间表");
  drawText(route.description, MARGIN, "400 25px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 39, 16);
  drawTimeline(getTimetable(route));

  section("🥾 徒步路线规划");
  const steps = getRouteSteps(route);
  if (steps.length > 0) {
    for (const step of steps) {
      drawText(step.title, MARGIN, "800 27px 'Microsoft YaHei', 'PingFang SC', sans-serif", DARK, CONTENT_WIDTH, 38, 4);
      if (step.meta) drawText(step.meta, MARGIN, "600 22px 'Microsoft YaHei', 'PingFang SC', sans-serif", GREEN, CONTENT_WIDTH, 34, 2);
      drawText(step.description, MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38, 18);
    }
  } else {
    drawText(cleanRoadbook(route.roadBook), MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38, 12);
  }

  section("⚠️ 注意事项与预备方案");
  drawText(readSection(route.roadBook, "注意事项") || "出发前检查天气、交通、停车与步道开放情况。若遇到大风、雷雨、低云、明显湿滑或身体状态不佳，请缩短路线并优先安全下撤。", MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38, 16);

  section("📸 打卡拍照点推荐");
  drawText(getPhotoText(route), MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38, 16);

  section("💡 最后的建议与安全提醒");
  drawText(`很高兴你选择了我们的服务！本路线计划仅供参考，最终还需要你根据当天状态、天气、交通、步道封闭信息和同行伙伴体力进行安排。\n\n小泷提醒你：爬山，安全第一。若当天出现风、雨、雷暴、低云、岩石湿滑或明显疲劳，请及时缩短停留时间，优先安全下撤。`, MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38, 18);

  section("🎒 小泷建议的爬山装备清单");
  drawText((route.packingList.length ? route.packingList : ["速干底层 / 保暖层", "防风防雨外层", "防滑登山鞋", "登山杖", "充足饮用水", "高能量零食 / 简单午餐", "离线地图与充电宝"]).map((item) => `• ${item}`).join("\n"), MARGIN, "400 24px 'Microsoft YaHei', 'PingFang SC', sans-serif", BODY, CONTENT_WIDTH, 38);

  const pageTitle = makeSafeFilename(route.title).replace(/一日徒步计划.*/, "Hiking Plan");
  pages.forEach((page, index) => {
    page.context.fillStyle = MUTED;
    page.context.font = "500 18px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    page.context.fillText(`${pageTitle} Page ${index + 1} of ${pages.length}`, MARGIN, PAGE_HEIGHT - 46);
  });

  const pdfPages: PdfPage[] = [];
  for (const page of pages) {
    pdfPages.push({ bytes: await canvasToJpeg(page.canvas), width: PAGE_WIDTH, height: PAGE_HEIGHT });
  }

  return new Blob([buildPdf(pdfPages)], { type: "application/pdf" });
}