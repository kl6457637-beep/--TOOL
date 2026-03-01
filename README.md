# Amazon Ad Semantic Smart Push Workflow (MVP)

## 一、产品核心定位 | Product Core Positioning

一款专为亚马逊中小卖家设计的"低门槛、重决策、高透明"的广告分析助理。它通过将业务硬规则与LLM语义推理解耦，解决卖家"无效点击多、分析耗时长、不敢信任AI"的核心痛点。

A low-barrier, decision-driven, and transparent ad analysis assistant designed specifically for small and medium-sized Amazon sellers. It decouples hard business rules from LLM semantic reasoning to address sellers' core pain points: excessive invalid clicks, time-consuming analysis, and lack of trust in AI.

---

## 二、核心操作流：从"混乱数据"到"一键优化" | Core Operation Flow: From "Chaotic Data" to "One-Click Optimization"

### 第一步：上下文对齐 (Context Loading)

**输入项 A (Listing)**: 运营输入产品的 ASIN 或直接粘贴标题、五点描述、核心参数。
**Input A (Listing)**: The operator enters the product ASIN or directly pastes the title, bullet points, and core parameters.

**输入项 B (Report)**: 上传亚马逊后台导出的 Search Term Report (STR) 原始文件。
**Input B (Report)**: Upload the raw Search Term Report (STR) exported from Amazon Seller Central.

**PM 注项**: 此时 Agent 会自动解析 Listing，提炼出产品的"功能边界"（例如：这是真皮，不是人造革；这是办公椅，不是电竞椅）。
**Note**: At this point, the Agent will automatically parse the Listing and extract the product's "functional boundaries" (e.g., this is genuine leather, not faux leather; this is an office chair, not a gaming chair).

---

### 第二步：硬规则"脱水" (Pre-filtering - 建立掌控感的第一层)

在消耗 AI Token 前，系统先根据预设的"硬性业务指标"进行第一波清洗：

Before consuming AI Tokens, the system performs the first round of cleaning based on preset "hard business metrics":

**过滤条件 | Filter Conditions**:
1. 点击量 > 20次且订单量 = 0 的"高点击无转化"词。| Clicks > 20 and Orders = 0 "high clicks, no conversion" terms.
2. CTR（点击率）极低且 ACOS 已经爆表的词。| Terms with extremely low CTR and excessively high ACOS.
3. 包含敏感/无关词根的词（如 free, cheap, used）。| Terms containing sensitive/unrelated keywords (e.g., free, cheap, used).

**交付物 | Deliverable**: 界面弹出一个列表，标注："这些词已根据业务规则判定为垃圾流量，建议直接否定"。运营可勾选确认，也可一键剔除误伤词。
**Deliverable**: A pop-up list on the interface labeled: "These terms have been identified as spam traffic based on business rules, recommended for direct negation." Operators can check to confirm or one-click remove false positives.

---

### 第三步：LLM 语义深度穿透 (Semantic Deep Dive - 核心技术壁垒 | Core Technology Barrier)

对第一步留下的"疑似相关但表现不佳"的词，由 LLM 结合 Listing 进行深度推理：

For terms that remain from Step 1 that are "suspected relevant but underperforming," the LLM performs deep reasoning combined with the Listing:

**意图识别 | Intent Recognition**: 识别搜索词背后的场景是否匹配。
Identify whether the scenario behind the search term matches.

**案例 | Example**: 搜索词为"儿童学习椅"，而 Listing 属性是"重型成人老板椅"。AI 会判定为："用户群体错位"。
Search term is "children's study chair," but the Listing attributes are "heavy-duty adult executive chair." The AI will determine: "User group mismatch."

**逻辑背书 | Logical Endorsement**: 为每一个建议生成的词提供一句"活人感"的理由。
Provide a "human-like" reason for each suggested term.

**理由示例 | Example Reason**: "虽然包含关键词『椅子』，但该词指向电竞风格，与您Listing中的商务行政风格严重背离，建议否定。"
"Although it contains the keyword 'chair,' this term points to a gaming style that severely conflicts with the business administrative style in your Listing, recommend negation."

---

### 第四步：交互式仪表盘 (The "Control" Center - 掌控感的终极体现)

运营看到的不再是冷冰冰的数字，而是一张**"诊断建议表"**：

What the operator sees is no longer cold numbers, but a **"Diagnostic Suggestion Table"**:

- **建议否定区 | Negation Suggestion Area**: 拆分为"规则判定"和"语义不符"两个子项。| Divided into two sub-items: "Rule-Based" and "Semantic Mismatch"
- **潜力发现区 | Potential Discovery Area**: AI 发现的高转化长尾词（虽然点击少，但转化极好），建议"单独提词建组"。| High-conversion long-tail terms discovered by AI (few clicks but excellent conversion), recommend "separate ad group creation."
- **操作权 | Operation Authority**: 每一行都有一个 Checkbox。运营通过"勾选/取消"行使最高决策权。| Each row has a Checkbox. Operators exercise the highest decision-making authority through "check/uncheck."

---

### 第五步：标准格式产出 (Final Output)

**CSV 自动化生成 | Automated CSV Generation**: 点击"确认优化"，系统根据运营勾选的结果，自动生成符合亚马逊 Bulk Upload (批量上传文件) 格式要求的 CSV 文件。
Click "Confirm Optimization," and the system automatically generates a CSV file in the required Amazon Bulk Upload format based on the operator's checked results.

**闭环操作 | Closed-Loop Operation**: 运营只需下载该文件，直接传到亚马逊后台广告管理界面，几秒钟内完成数百条词的操作。
The operator only needs to download the file and upload it directly to the Amazon Seller Central ad management interface, completing hundreds of keyword operations in seconds.

---

## Project Status

This is an MVP (Minimum Viable Product) project for the Amazon Ad Semantic Smart Push Workflow.

### Tech Stack

- **Frontend**: React/Next.js + TypeScript + Tailwind CSS
- **State Management**: Zustand (with LocalStorage persistence)
- **CSV Processing**: Papa Parse
- **AI**: LLM integration (OpenAI API)

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.
