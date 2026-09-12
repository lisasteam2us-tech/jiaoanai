import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { extractAndInspectZip, inspectAllCases, CASES_ROOT_DIR } from "./server/casesManager.ts";
import { customizePlanWithGemini, getEnhancedPlan, analyzeAndReconstructRawLessonPlan } from "./server/expertEngine.ts";
import { extractTextFromAnyDocFile } from "./server/docExtractor.ts";
import mammoth from "mammoth";
import { seedComprehensiveKnowledge } from "./src/db/seedKnowledge.ts";
import {
  getKnowledgeStats,
  retrieveComprehensiveKnowledgeFromSql,
  getRecentDiagnoses,
} from "./src/db/knowledgeService.ts";

// 全局异常与拒绝兜底，确保 Node 服务永不崩溃
process.on("unhandledRejection", (reason) => {
  console.warn("[Process] 捕获未处理的 Rejection，防止进程崩溃:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("[Process] 捕获未处理的 Exception，保持平稳运行:", error);
});

const uploadDir = path.resolve(process.cwd(), "temp_uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 过滤安全文件名，避免操作系统特殊字符或不可打印字符导致落盘异常
    const ext = path.extname(file.originalname) || ".docx";
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "");
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 允许最大 200MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // 0. API: 服务健康检查与 Cloud SQL 状态
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), db: "Cloud SQL (PostgreSQL)" });
  });

  // 0.1 API: 获取真实 Cloud SQL 知识库统计数据
  app.get("/api/knowledge/stats", async (req, res) => {
    try {
      const stats = await getKnowledgeStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "读取知识库统计失败" });
    }
  });

  // 0.2 API: 检索 Cloud SQL 知识库（课标、教材节点、易错盲区、名师支架）
  app.get("/api/knowledge/query", async (req, res) => {
    try {
      const title = String(req.query.title || "");
      const subject = String(req.query.subject || "");
      const stage = String(req.query.stage || "");
      const data = await retrieveComprehensiveKnowledgeFromSql(title, subject, stage);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "知识库检索失败" });
    }
  });

  // 0.3 API: 获取历史教案诊断记录
  app.get("/api/knowledge/recent-diagnoses", async (req, res) => {
    try {
      const records = await getRecentDiagnoses(15);
      res.json({ success: true, data: records });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "获取诊断记录失败" });
    }
  });

  // 静态提供案例中提取的高清图标与多媒体插图
  app.get("/cases_media/*", (req, res, next) => {
    try {
      const decodedRel = decodeURIComponent(req.path.replace(/^\/cases_media\//, ""));
      const targetPath = path.resolve(process.cwd(), "public/cases_media", decodedRel);
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        return res.sendFile(targetPath);
      }
    } catch {
      // 继续 fallback
    }
    next();
  });
  app.use("/cases_media", express.static(path.resolve(process.cwd(), "public/cases_media")));

  // 1. API: 上传 Zip 压缩包或直接多文件上传
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "请选择要上传的文件" });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname.toLowerCase();

      let result;
      if (originalName.endsWith(".zip")) {
        // 解压并结构化审阅
        result = await extractAndInspectZip(filePath);
      } else if (originalName.endsWith(".docx") || originalName.endsWith(".doc")) {
        // 直接上传的单个案例文件，拷贝到统一目录
        const targetCaseDir = path.join(CASES_ROOT_DIR, req.file.originalname.replace(/\.[^/.]+$/, ""));
        fs.mkdirSync(targetCaseDir, { recursive: true });
        const targetPath = path.join(targetCaseDir, req.file.originalname);
        fs.copyFileSync(filePath, targetPath);
        result = await inspectAllCases(true);
      } else {
        // 如果是改了后缀的 zip（如 .txt / .bin），依然尝试当作 zip 解压
        try {
          result = await extractAndInspectZip(filePath);
        } catch {
          return res.status(400).json({ error: "文件格式不支持，请上传 .zip 压缩包或 .docx 文档" });
        }
      }

      // 清理临时文件
      try {
        fs.unlinkSync(filePath);
      } catch {}

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("上传/解压处理异常:", error);
      return res.status(500).json({ error: error.message || "文件解压与审阅处理失败" });
    }
  });

  // 2. API: 多文件直接批量上传
  app.post("/api/upload-multiple", upload.array("files", 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "请选择上传的文件" });
      }

      for (const f of files) {
        if (f.originalname.endsWith(".zip")) {
          await extractAndInspectZip(f.path);
        } else {
          const caseName = f.originalname.replace(/\.[^/.]+$/, "");
          const targetDir = path.join(CASES_ROOT_DIR, caseName);
          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(f.path, path.join(targetDir, f.originalname));
        }
        try { fs.unlinkSync(f.path); } catch {}
      }

      const result = await inspectAllCases();
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "批量处理失败" });
    }
  });

  // 3. API: 获取当前所有案例及审阅报告
  app.get("/api/cases", async (req, res) => {
    try {
      const result = await inspectAllCases();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "读取案例列表失败" });
    }
  });

  // 4. API: 重新审阅所有文件
  app.post("/api/reanalyze", async (req, res) => {
    try {
      const result = await inspectAllCases(true);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "重新审阅失败" });
    }
  });

  // 5. API: 根据个性化教师需求，调用 Gemini 对指定案例进行实时针对性重构
  app.post("/api/cases/:caseId/customize", async (req, res) => {
    try {
      const { caseId } = req.params;
      const { customPrompt } = req.body;
      if (!customPrompt) {
        return res.status(400).json({ error: "请提供定制提示要求" });
      }

      const all = await inspectAllCases();
      const targetCase = all.cases.find(c => c.folderName === caseId || c.id === caseId);
      if (!targetCase) {
        return res.status(404).json({ error: "未找到对应案例" });
      }

      const basePlan = targetCase.enhancedPlan || getEnhancedPlan(targetCase);
      const customRes = await customizePlanWithGemini(basePlan, customPrompt);
      return res.json(customRes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "定制重构失败" });
    }
  });

  // 6. API: 核心输入接口 —— 用户输入（直接粘贴文本 或 上传教案单文件 .docx/.txt），即时分析诊断并生成完整重构方案
  app.post(
    "/api/analyze-plan",
    (req, res, next) => {
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("multipart/form-data")) {
        upload.single("file")(req, res, (err) => {
          if (err) {
            console.error("[Upload] Multer 解析文件出错:", err);
            return res.status(400).json({ error: `文件上传解析异常: ${err.message || "不支持的文件流"}` });
          }
          next();
        });
      } else {
        next();
      }
    },
    async (req, res) => {
      try {
        let rawText = req.body?.lessonPlanText || "";
        let fileNameHint = req.body?.fileName || "";

        // 如果有上传文件，先解析文件文本
        if (req.file) {
          fileNameHint = req.file.originalname;
          try {
            const extracted = await extractTextFromAnyDocFile(req.file.path, req.file.originalname);
            rawText = extracted.text || "";
          } catch (fileErr: any) {
            console.warn("[Upload] 文档提取失败，回退到纯文本读取:", fileErr?.message);
            try {
              rawText = fs.readFileSync(req.file.path, "utf-8");
            } catch {}
          }

          try { fs.unlinkSync(req.file.path); } catch {}
        }

        if (!rawText || rawText.trim().length < 10) {
          return res.status(400).json({ error: "请输入或上传有效的教案内容（至少包含10字以上）" });
        }

        console.log(`[教案分析引擎] 正在对输入文档执行特级深度诊断重构，字数：${rawText.length}`);
        const plan = await analyzeAndReconstructRawLessonPlan(rawText, fileNameHint);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(200).json({
          success: true,
          data: {
            plan,
            originalWordCount: rawText.length,
            fileNameHint
          }
        });
      } catch (err: any) {
        console.error("教案输入解析诊断异常:", err);
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(500).json({ error: err.message || "教案解析与诊断重构失败" });
      }
    }
  );

  // 7. API 全局错误处理兜底：拦截所有 /api 开头的错误，确保永远返回 JSON，绝不穿透至 Vite HTML 中间件
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[API Error Interceptor]:", err);
    res.status(err.status || 500).json({
      error: err.message || "服务端处理异常，请稍后重试"
    });
  });

  // 8. 绝对阻断：所有未被上述路由接管的 /api 请求返回 404 JSON，坚决杜绝穿透到 Vite SPA HTML Fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `未找到指定的 API 端点: [${req.method}] ${req.path}` });
  });

  // Vite 开发中间件与静态文件
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    // 异步执行 Cloud SQL 初始知识库检查与填充，不阻塞服务启动
    seedComprehensiveKnowledge().catch((err) => {
      console.warn("[CloudSQL Seed] 初始化数据检查/填充异常:", err?.message || err);
    });
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
