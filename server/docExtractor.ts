import fs from "fs";
import mammoth from "mammoth";

export interface ExtractedDocResult {
  text: string;
  html?: string;
  isFallback?: boolean;
}

function cleanExtractedString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\uFEFF/g, "") // 移除 BOM
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // 移除非打印控制字符，保留换行与制表符
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "") // 移除孤立代理字符
    .trim();
}

/**
 * 健壮地从各类教案文档（.docx、Word 97-2003 .doc、.txt、伪装后缀文本）中提取文本
 * 彻底防止 mammoth 在遇到非合规 zip / .doc 格式时抛出:
 * "Can't find end of central directory : is this a zip file ?"
 */
export async function extractTextFromAnyDocFile(
  filePath: string,
  originalFilename: string = ""
): Promise<ExtractedDocResult> {
  if (!fs.existsSync(filePath)) {
    return { text: "" };
  }

  const buf = fs.readFileSync(filePath);
  if (!buf || buf.length === 0) {
    return { text: "" };
  }

  // 1. 判断是否是标准 ZIP / DOCX 格式
  // 标准 ZIP 文件头签名为 0x50 0x4B 0x03 0x04 (PK\x03\x04)
  const isZip =
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04;

  if (isZip) {
    try {
      const textRes = await mammoth.extractRawText({ path: filePath });
      let htmlRes = "";
      try {
        const h = await mammoth.convertToHtml(
          { path: filePath },
          {
            convertImage: mammoth.images.imgElement((image) => {
              return image.read("base64").then((imageBuffer) => ({
                src: `data:${image.contentType};base64,${imageBuffer}`,
                class: "rounded-xl border border-slate-200 shadow-sm max-w-full my-4 mx-auto block",
              }));
            }),
          }
        );
        htmlRes = h.value || "";
      } catch {
        // html 转换失败不影响纯文本
      }
      if (textRes.value && textRes.value.trim().length > 0) {
        return { text: cleanExtractedString(textRes.value), html: htmlRes };
      }
    } catch (e: any) {
      console.warn(`[DocExtractor] mammoth 解析 .docx 失败，降级为二进制文本抽取:`, e.message);
    }
  }

  // 2. 如果是旧版 Word 97-2003 (.doc) 或 CFB 复合二进制文件
  // UTF-16LE 是 Word 97-2003 内核的主要文本存储格式
  try {
    const utf16Str = buf.toString("utf16le");
    // 优先匹配教学设计核心内容标记（避免命中文件头部的模板元数据）
    const coreMarkers = [
      "教学目标",
      "教学过程",
      "教学重难点",
      "教学重点",
      "教学内容",
      "备课时间",
      "一、教学目标",
      "一、导入",
      "【教学设计】",
    ];

    let bestPos = -1;
    for (const m of coreMarkers) {
      const p = utf16Str.indexOf(m);
      if (p !== -1 && (bestPos === -1 || p < bestPos)) {
        bestPos = p;
      }
    }

    if (bestPos !== -1) {
      // 往前寻找是否有"主备人"或起始标题
      const lookback = utf16Str.slice(Math.max(0, bestPos - 600), bestPos);
      const zbIdx = lookback.lastIndexOf("主备人");
      const start = zbIdx !== -1 ? Math.max(0, bestPos - 600 + zbIdx) : Math.max(0, bestPos - 300);
      const chunk = utf16Str.slice(start, start + 30000);
      const rawLines = chunk
        .split(/[\r\n]+/)
        .map((r) => r.replace(/[\x00-\x1f\ufffd]/g, "").trim())
        .filter(Boolean);

      const validLines: string[] = [];
      const htmlSections: string[] = [];

      for (const l of rawLines) {
        if (l.startsWith("INCLUDEPICTURE")) {
          validLines.push("【📐 教学板书/几何插图】");
          htmlSections.push(
            `<div class="my-2 p-2 bg-amber-50 rounded text-amber-800 text-xs">📐 教学插图</div>`
          );
          continue;
        }
        // 如果连续多行不再包含任何中文字符，说明脱离正文区进入末尾格式表
        if (validLines.length > 40 && !/[\u4e00-\u9fa5]/.test(l.slice(0, 3))) {
          break;
        }
        validLines.push(l);

        if (
          l.includes("教学目标") ||
          l.includes("教学重点") ||
          l.includes("教学过程") ||
          l.includes("板书设计") ||
          l.includes("作业设计")
        ) {
          htmlSections.push(
            `<h3 class="text-sm font-bold text-indigo-950 mt-4 mb-2 pb-1 border-b border-indigo-100">${l}</h3>`
          );
        } else {
          htmlSections.push(`<p class="my-1.5 leading-relaxed text-xs text-slate-700">${l}</p>`);
        }
      }

      if (validLines.length >= 3) {
        return {
          text: cleanExtractedString(validLines.join("\n")),
          html: htmlSections.join("\n"),
        };
      }
    }
  } catch (e: any) {
    console.warn(`[DocExtractor] UTF-16LE 解析 .doc 异常:`, e.message);
  }

  // 3. 尝试 UTF-8 编码（例如用户将 .txt 误重命名为 .docx 或 .doc 上传）
  try {
    const utf8Str = buf.toString("utf-8");
    const cleanUtf8 = cleanExtractedString(utf8Str);
    if (cleanUtf8.length > 10 && /[\u4e00-\u9fa5]/.test(cleanUtf8)) {
      const lines = cleanUtf8
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return {
        text: cleanUtf8,
        html: lines.map((l) => `<p class="my-1.5 text-xs text-slate-700">${l}</p>`).join("\n"),
      };
    }
  } catch {}

  // 4. 极端兜底：流式提取 UTF-16LE 中所有有效的中文和 ASCII 字符块
  const extractedLines: string[] = [];
  let currentChunk = "";
  for (let i = 0; i < buf.length - 1; i += 2) {
    const code = buf.readUInt16LE(i);
    if (
      (code >= 0x4e00 && code <= 0x9fa5) ||
      (code >= 32 && code <= 126) ||
      code === 10 ||
      code === 13 ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0xff01 && code <= 0xff5e)
    ) {
      currentChunk += String.fromCharCode(code);
    } else {
      if (currentChunk.trim().length >= 4 && /[\u4e00-\u9fa5]/.test(currentChunk)) {
        extractedLines.push(currentChunk.trim());
      }
      currentChunk = "";
    }
  }
  if (currentChunk.trim().length >= 4 && /[\u4e00-\u9fa5]/.test(currentChunk)) {
    extractedLines.push(currentChunk.trim());
  }

  const finalStr = cleanExtractedString(extractedLines.join("\n"));
  return {
    text: finalStr || cleanExtractedString(buf.toString("utf-8").slice(0, 5000)),
    isFallback: true,
  };
}
