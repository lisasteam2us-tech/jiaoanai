# 项目执行规范与防卡死守则 (AGENTS.md)

## 0. 语言与交流规范
- 沟通交流首选简体中文，除非专业术语等。
- 给出清晰、直接、专注结果的高质量总结，不输出无意义的内部中间过程。

## 1. Think Before Coding (编码前深思)
- **Don't assume. Don't hide confusion. Surface tradeoffs.**
- 在动手前明确假设；如果存在多种解释，主动呈现而不盲目二选一。
- 坚持最简单有效的架构，不引入未经用户要求的复杂性。

## 2. Simplicity First (奥卡姆剃刀原则)
- **Minimum code that solves the problem. Nothing speculative.**
- 严禁添加用户未要求的过度设计、冗余页面、配置项或过渡抽象。
- 能用 50 行清晰写完的逻辑绝不写 200 行。

## 3. Surgical Changes (外科手术式精准修改)
- **Touch only what you must. Clean up only your own mess.**
- 只修改与任务直接相关的代码行，不随意格式化或重构未损坏的相邻代码。
- 自身改动产生的无用变量、函数或导入，必须在当轮彻底清理干净。

## 4. Goal-Driven Execution (目标驱动与闭环验证)
- 每次修改后，必须通过 `lint_applet`（类型检查）和 `compile_applet`（构建检查）双重验证。
- 验证通过后立即结束工具调用，不拖沓。

---

## 5. 防卡死与执行稳定性军规 (Anti-Hang & Robust Execution)

为防止平台抛出 "There was an unexpected error" 或因命令超时/异步未决导致会话卡死，所有智能体必须严格遵循以下铁律：

### 5.1 严禁滥用行内 Node 脚本探测 (`node -e '...'`)
- 容器沙箱对 `run_command` 的超时与子进程管理较为敏感，执行包含动态 import、文件 I/O、未捕获 Promise 的复杂的 `node -e` 脚本极易导致上下文阻塞或挂起。
- **正解**：
  - 需要确认第三方库类型结构时，**必须直接使用 `view_file`** 查看 `node_modules/<pkg>/.../*.d.ts`。
  - 需要验证逻辑时，优先直接在代码中编写并调用 `lint_applet` 或 `compile_applet`。

### 5.2 严格遵循专用工具优先 (Prefer Dedicated Tools)
- 文件查阅：使用 `view_file` 或 `list_dir`，禁止用 `cat`、`ls` 等 shell 命令代替。
- 代码修改：使用 `edit_file` 或 `create_file`。
- 质量检查：使用 `lint_applet` 与 `compile_applet`。

### 5.3 异步操作与外部数据必须具备「熔断降级」与「保护性超时」
- 在处理 Canvas 图片转换（`toBlob`）、文件流读取（`FileReader`）、网络请求或大对象打包时：
  - **必须包裹有限超时（如 1.5 秒超时拒绝或返回 null 降级）**，绝不允许无超时的未决 Promise 挂死主线程或导出队列。
  - 核心导出流（如 Word/PDF 生成）必须始终具备优雅降级（Graceful Degradation）分支：若图片渲染不可用，优雅降级为文字版式，绝不让整个导出崩溃。

### 5.4 严格遵循第三方 SDK 的类型规范 (例如 docx ImageRun)
- 引入或调用外部库方法时，严格核对其类型参数。
- 例如 `docx` 的 `ImageRun` 必须明确指定 `type: "png" | "jpg"`、`data` 以及 `transformation: { width, height }`，并在外部做完整 `try...catch` 防御。

### 5.5 单轮任务及时闭环收敛
- 避免在后台挂载长任务或未终止的监听器；在完成既定修改与编译验证后，立即停止调用工具并交由用户。
