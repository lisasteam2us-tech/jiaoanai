import { EnhancedTeachingPlan } from "../types";

type BoardDesign = EnhancedTeachingPlan["boardDesign"];

/**
 * 文本按像素宽度自动拆分成多行
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const resultLines: string[] = [];
  const rawParagraphs = text.split("\n");

  for (const paragraph of rawParagraphs) {
    if (paragraph.trim().length === 0) {
      resultLines.push("");
      continue;
    }

    let currentLine = "";
    for (let i = 0; i < paragraph.length; i++) {
      const char = paragraph[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        resultLines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) {
      resultLines.push(currentLine);
    }
  }

  return resultLines;
}

/**
 * 在客户端使用 HTML5 Canvas 绘制高质感拟真物理黑板图像
 * 分辨率: 1600 x 850 (约 1.88:1 真实物理黑板宽幅比例)
 */
export function renderBlackboardToCanvas(
  board: BoardDesign,
  topic: string
): HTMLCanvasElement | null {
  if (typeof document === "undefined") {
    return null; // 非浏览器环境降级
  }

  const canvas = document.createElement("canvas");
  const width = 1600;
  const height = 850;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. 实木/金属质感黑板外框
  ctx.fillStyle = "#3d271d"; // 深红木外框
  ctx.fillRect(0, 0, width, height);

  // 外框木纹质感条纹与高光边
  ctx.fillStyle = "#52372a";
  ctx.fillRect(4, 4, width - 8, height - 8);
  ctx.fillStyle = "#271811";
  ctx.fillRect(10, 10, width - 20, height - 20);

  // 四角金属包角装饰
  const cornerSize = 28;
  ctx.fillStyle = "#78644e";
  // 左上
  ctx.fillRect(0, 0, cornerSize, 12);
  ctx.fillRect(0, 0, 12, cornerSize);
  // 右上
  ctx.fillRect(width - cornerSize, 0, cornerSize, 12);
  ctx.fillRect(width - 12, 0, 12, cornerSize);
  // 左下
  ctx.fillRect(0, height - 12, cornerSize, 12);
  ctx.fillRect(0, height - cornerSize, 12, cornerSize);
  // 右下
  ctx.fillRect(width - cornerSize, height - 12, cornerSize, 12);
  ctx.fillRect(width - 12, height - cornerSize, 12, cornerSize);

  // 2. 真实教学墨绿黑板板面 (深邃、哑光磨砂感)
  const boardMargin = 16;
  const boardWidth = width - boardMargin * 2;
  const boardHeight = height - boardMargin * 2 - 28; // 底部预留粉笔凹槽

  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    100,
    width / 2,
    height / 2,
    width * 0.75
  );
  bgGrad.addColorStop(0, "#193d2c"); // 中心稍明亮
  bgGrad.addColorStop(0.7, "#123022");
  bgGrad.addColorStop(1, "#0a1e15"); // 四周微暗角

  ctx.fillStyle = bgGrad;
  ctx.fillRect(boardMargin, boardMargin, boardWidth, boardHeight);

  // 细微粉笔擦留下的轻柔质感晕斑
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(
      boardMargin + 200 + i * 220,
      boardMargin + 220 + (i % 2) * 80,
      140,
      70,
      (i * 15 * Math.PI) / 180,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();

  // 3. 黑板顶部横幅标牌区
  const headerY = boardMargin + 26;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 副标：新课标特级示范课 · 40分钟物理板书规划图
  ctx.font = "bold 15px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillStyle = "#80b299";
  ctx.fillText("【新课标特级示范课 · 物理黑板空间板书规划方案】", width / 2, headerY);

  // 主课题名：模拟鲜亮黄色粉笔字
  ctx.font = "bold 34px 'Microsoft YaHei', 'SimHei', sans-serif";
  ctx.fillStyle = "#ffeb3b";
  ctx.shadowColor = "rgba(255, 235, 59, 0.4)";
  ctx.shadowBlur = 6;
  ctx.fillText(`《${topic || "课堂核心板书"}》`, width / 2, headerY + 42);
  ctx.shadowBlur = 0;

  // 课题下方的白粉笔精致装饰双线
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, headerY + 70);
  ctx.lineTo(width / 2 + 280, headerY + 70);
  ctx.stroke();

  // 4. 三大区域物理划分规划 (左翼 28%, 中台 44%, 右翼 28%)
  const contentTopY = headerY + 92;
  const contentBottomY = boardMargin + boardHeight - 55;
  const contentHeight = contentBottomY - contentTopY;

  const leftX = boardMargin + 24;
  const leftW = 420;

  const centerX = leftX + leftW + 30;
  const centerW = 630;

  const rightX = centerX + centerW + 30;
  const rightW = 420;

  // 竖向虚线分隔线（仿讲台细槽分割）
  ctx.strokeStyle = "rgba(128, 178, 153, 0.35)";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(leftX + leftW + 15, contentTopY - 10);
  ctx.lineTo(leftX + leftW + 15, contentBottomY + 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + centerW + 15, contentTopY - 10);
  ctx.lineTo(centerX + centerW + 15, contentBottomY + 10);
  ctx.stroke();

  ctx.setLineDash([]); // 恢复实线

  // 5. 绘制三区内容
  // --- 5.1 左翼：主干任务与概念聚焦 ---
  drawSectionBox(
    ctx,
    leftX,
    contentTopY,
    leftW,
    contentHeight,
    "左翼 · 概念聚焦与驱动任务",
    "#ffd54f", // 淡暖黄粉笔标牌
    board?.leftWing || "【主干知识脉络】\n• 核心概念聚焦\n• 驱动性大问题\n• 前置探究回顾",
    "left"
  );

  // --- 5.2 中台：师生互动推导演进图谱 (核心区，加微黄虚线板书框强调) ---
  drawCenterSectionBox(
    ctx,
    centerX,
    contentTopY,
    centerW,
    contentHeight,
    "中台 · 师生协同推导演进图谱（核心区）",
    "#ffffff", // 白粉笔重点标牌
    board?.centerStage || "【核心模型建构与推导演进】\n师生协同推导演进建模图谱\n揭示本质规律与思维转化路径",
    board?.layoutType || "结构化推导型"
  );

  // --- 5.3 右翼：反思总结与星级达标 ---
  drawSectionBox(
    ctx,
    rightX,
    contentTopY,
    rightW,
    contentHeight,
    "右翼 · 反思总结与表现性评价",
    "#81c784", // 淡绿粉笔标牌
    board?.rightWing || "【应用与达标】\n• 变式应用要诀\n• 易错陷阱规避\n• 表现性评价自测",
    "left"
  );

  // 6. 黑板底部金属粉笔凹槽与粉笔盒写实装饰
  const trayY = boardMargin + boardHeight + 4;
  const trayHeight = 22;

  // 金属底槽渐变
  const trayGrad = ctx.createLinearGradient(0, trayY, 0, trayY + trayHeight);
  trayGrad.addColorStop(0, "#4a5568");
  trayGrad.addColorStop(0.5, "#2d3748");
  trayGrad.addColorStop(1, "#1a202c");
  ctx.fillStyle = trayGrad;
  ctx.fillRect(boardMargin + 10, trayY, boardWidth - 20, trayHeight);

  // 凹槽高光边
  ctx.fillStyle = "#718096";
  ctx.fillRect(boardMargin + 10, trayY, boardWidth - 20, 2);

  // 绘制几支散落的彩色粉笔与板擦
  // 白粉笔
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(width / 2 - 120, trayY + 6, 46, 9);
  // 黄粉笔
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(width / 2 - 60, trayY + 6, 42, 9);
  // 绿粉笔
  ctx.fillStyle = "#69f0ae";
  ctx.fillRect(width / 2 - 8, trayY + 6, 38, 9);
  // 蓝粉笔
  ctx.fillStyle = "#40c4ff";
  ctx.fillRect(width / 2 + 38, trayY + 6, 44, 9);
  // 黑板擦
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(width / 2 + 105, trayY + 4, 76, 13);
  ctx.fillStyle = "#d7ccc8";
  ctx.fillRect(width / 2 + 107, trayY + 17, 72, 3);

  // 7. 底部说明栏：教师板书提示
  ctx.font = "italic 13px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillStyle = "#a0aec0";
  ctx.textAlign = "left";
  const noteText = `💡 彩粉笔与板书提示：${board?.teacherNotes || "中台推演注重师生动态生成，核心公式用彩色粉笔醒目标出。"}`;
  ctx.fillText(noteText.length > 95 ? noteText.substring(0, 92) + "..." : noteText, leftX, height - 8);

  return canvas;
}

/**
 * 绘制左右翼普通板块
 */
function drawSectionBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  badgeColor: string,
  rawContent: string,
  align: "left" | "center"
) {
  // 顶部区域标签
  ctx.textAlign = "left";
  ctx.font = "bold 17px 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = badgeColor;
  ctx.fillText(`▍ ${title}`, x + 6, y + 16);

  // 板块内背景微透黑板框
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(x, y + 30, w, h - 35);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + 30, w, h - 35);

  // 绘制文字
  ctx.font = "15px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillStyle = "#f1f5f9";
  const lines = wrapText(ctx, rawContent, w - 24);

  let currentY = y + 58;
  const lineHeight = 27;

  for (const line of lines) {
    if (currentY > y + h - 18) {
      // 避免超出底部
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("...", x + 14, currentY);
      break;
    }

    // 重点词高亮着色（如带有【】或“•”开头的标题行）
    if (line.startsWith("【") || line.startsWith("[") || line.includes("核心") || line.includes("大观念")) {
      ctx.fillStyle = "#ffe082"; // 浅黄
      ctx.font = "bold 15px 'Microsoft YaHei', sans-serif";
    } else if (line.startsWith("•") || line.startsWith("-")) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "15px 'Microsoft YaHei', sans-serif";
    } else {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px 'Microsoft YaHei', sans-serif";
    }

    ctx.fillText(line, x + 14, currentY);
    currentY += lineHeight;
  }
}

/**
 * 绘制中台中核板块（师生互动动态推导）
 */
function drawCenterSectionBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  badgeColor: string,
  rawContent: string,
  layoutType: string
) {
  // 顶部标牌
  ctx.textAlign = "center";
  ctx.font = "bold 18px 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = badgeColor;
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = 4;
  ctx.fillText(title, x + w / 2, y + 16);
  ctx.shadowBlur = 0;

  // 版式类型药丸标签
  ctx.font = "11px 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#81c784";
  ctx.fillText(`[版式构型: ${layoutType}]`, x + w / 2, y + 36);

  // 核心推导框（居中仿浅黄粉笔虚线框）
  const innerMargin = 12;
  const innerW = w - innerMargin * 2;
  const innerH = h - 50;
  const innerY = y + 46;

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(x + innerMargin, innerY, innerW, innerH);

  ctx.strokeStyle = "rgba(255, 235, 59, 0.55)";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + innerMargin, innerY, innerW, innerH);
  ctx.setLineDash([]);

  // 绘制中台文字内容
  ctx.font = "16px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  const lines = wrapText(ctx, rawContent, innerW - 32);

  let currentY = innerY + 36;
  const lineHeight = 30;

  for (const line of lines) {
    if (currentY > innerY + innerH - 18) {
      break;
    }

    // 判断是否为核心公式或主结论
    const isFormula =
      line.includes("=") ||
      line.includes("→") ||
      line.includes("转化") ||
      line.includes("S =") ||
      line.includes("公式");

    if (isFormula) {
      ctx.textAlign = "center";
      ctx.font = "bold 18px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "#fff59d"; // 醒目明黄
      ctx.fillText(line, x + w / 2, currentY);
    } else if (line.startsWith("【") || line.startsWith("[")) {
      ctx.textAlign = "center";
      ctx.font = "bold 16px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "#4fc3f7"; // 浅天蓝
      ctx.fillText(line, x + w / 2, currentY);
    } else {
      ctx.textAlign = "center";
      ctx.font = "15px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(line, x + w / 2, currentY);
    }

    currentY += lineHeight;
  }
}

/**
 * 将 Canvas 异步导出为 PNG 的 Uint8Array 数据，供 docx ImageRun 直接打包
 */
export async function generateBlackboardImageBytes(
  board: BoardDesign,
  topic: string
): Promise<Uint8Array | null> {
  const canvas = renderBlackboardToCanvas(board, topic);
  if (!canvas) return null;

  return new Promise<Uint8Array | null>((resolve) => {
    // 保护性超时机制：超过 1500ms 自动降级返回 null，防止导出被意外挂起
    const timer = setTimeout(() => {
      resolve(null);
    }, 1500);

    try {
      canvas.toBlob((blob) => {
        clearTimeout(timer);
        if (!blob) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(new Uint8Array(reader.result));
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        reader.readAsArrayBuffer(blob);
      }, "image/png");
    } catch (e) {
      clearTimeout(timer);
      console.warn("Canvas toBlob 导出异常:", e);
      resolve(null);
    }
  });
}

/**
 * 将 Canvas 导出为用于前端 UI 预览的 DataURL
 */
export function generateBlackboardDataUrl(
  board: BoardDesign,
  topic: string
): string | null {
  const canvas = renderBlackboardToCanvas(board, topic);
  if (!canvas) return null;
  try {
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("Canvas toDataURL 失败:", e);
    return null;
  }
}
