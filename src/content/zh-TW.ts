import type { SiteContent } from "./types";
import { sharedContact } from "./shared";

export const zhTW: SiteContent = {
  locale: "zh-TW",
  htmlLang: "zh-Hant-TW",
  ogLocale: "zh_TW",
  meta: {
    title: "Amo Feng 馮聖淳｜全端工程師（後端・系統架構）",
    description:
      "Amo Feng（馮聖淳），台灣的全端工程師，後端與系統架構為主，從架構、程式到部署與維運都做。做過服務 2,000+ 企業的多通路客服訊息平台上的計費、AI 與通路整合、從報價到入帳的金流與 Stripe 訂閱計費、HubSpot 與 NetSuite 串接，以及跑在 Kubernetes 上的事件驅動服務。",
    ogAlt: "Amo Feng（馮聖淳），台灣的全端工程師",
    ogRole: "全端工程師｜後端・系統架構・金流正確性",
  },

  profile: {
    name: "Amo",
    fullName: "Amo Feng",
    nativeName: "馮聖淳",
    role: "全端工程師",
    specialty: "後端・系統架構",
    place: "台灣",
    headline: "全端工程師（後端・系統架構），在台灣。",
    a11yName: "Amo Feng 馮聖淳，台灣的全端工程師",
    timeZone: "Asia/Taipei",
    focus: "NestJS・React・PHP・MySQL／PostgreSQL／MongoDB・RabbitMQ・Kubernetes",
    positioning: "讓牽涉到錢的系統，每一步都算得對。",
    proof: [
      { figure: "2,000+", label: "企業在用的客服平台，預付點數計費由我主寫", short: "家企業在用，計費由我主寫" },
      { figure: "0 張", label: "換定價模型時，需要重算的已簽約報價", short: "換定價模型時\u200b重算的報價" },
      { figure: "44 ms", label: "預約查詢原本 6.3\u00a0s：找回被\u00a0ORM\u00a0刪掉的\u00a0index", short: "預約查詢，原本 6.3\u00a0s" },
    ],
    summary:
      "做過服務 2,000+ 企業的客服平台上的預付點數計費、AI 與通路整合，和一條從 3D 報價、簽約、付款到 Stripe 訂閱計費，並與 HubSpot、NetSuite 同步的 quote-to-cash 鏈。追到根因之後，修在讓同一類 bug 進不來的那個點。",
    statement:
      "我最擅長找出看起來正常、其實已經壞掉的問題。\n\nsocket 還連著，卻沒有人在處理事件；migration 紀錄說跑過了，index 卻不在資料庫裡；框架升級順利，middleware 卻默默不再執行；測試全綠，測的卻是 production 不存在的狀態。\n\n這些都不會出現在儀表板上，要從程式碼、佇列和資料庫一路追下去。追到之後，我要的修法是找到那一個關鍵點，讓同一類 bug 再也進不來。",
    aside:
      "遠端加入過香港與美國的團隊，文件、code review 和會議都用英文。也習慣把 standup 裡的技術細節翻成 PM、業務和會計讀得懂的版本。架構決策要讓依賴它的人都看得懂，才算做完。",
  },

  ui: {
    skipLink: "跳到主要內容",
    mainNav: "主要",
    sectionNav: "段落",
    contactShort: "聯絡",
    menu: { open: "目錄", close: "關閉" },
    switchLanguage: { label: "EN", href: "/en", hrefLang: "en" },
    hero: {
      timeLabel: "台灣時間",
      ctaWork: "看 {count} 則真實案例",
      ctaGithub: "GitHub",
      ctaContact: "聯絡／索取履歷",
      motionLabel: "動態效果",
      motionOn: "開",
      motionOff: "關",
    },
    experience: { role: "角色", scope: "負責範圍", stack: "技術", earlier: "更早的工作", impact: "影響", more: "其餘 {count} 項負責範圍", highlights: "{count} 項重點", teamStack: "團隊與技術" },
    projects: { details: "做法與細節" },
    systems: {
      emptyTitle: "選一個節點，看看資料怎麼流動。",
      emptyBody:
        "圖上有 {nodes} 個系統、{edges} 條我實際接過的連線。深色的是核心系統，其他是外部平台。",
      flowsTo: "傳到",
      reset: "恢復排列",
      skillsTitle: "技術範圍",
    },
    work: {
      filter: "篩選",
      byType: "依類型篩選",
      byTrack: "依經歷篩選",
      all: "全部",
      cause: "根因",
      actions: "怎麼處理",
      result: "結果",
      lesson: "學到的事",
    },
    offDuty: {
      hold: "按住踩油門",
      holdKeys: "也可以按住空白鍵",
      rpm: "轉速",
      redline: "紅線",
      ratioLabel: "記憶體控制器比例",
      chartLabel: "比例 {ratio} 時的 frame time 示意",
      chart21: "示意：控制器跑在 2:1，frame time 不時跳出尖峰，就是遊戲裡那一下頓。",
      chart11: "示意：調回 1:1 之後，尖峰消失，虛線是 144 Hz 的單格時間。",
      details: "規格與量測",
    },
    contact: {
      headline: "有系統要接，或是哪裡斷了？",
      write: "寫信給我",
      copy: "複製 Email",
      copied: "已複製 Email",
      copyFailed: "無法複製，請手動選取",
      status: "正在找全端或後端職缺，台灣或海外遠端都可以。",
      resume: "索取履歷（中／英）",
      resumeSubject: "索取履歷",
    },
    footer: { now: "現在是台灣時間", backToTop: "回到頂端" },
  },

  sections: {
    signal: { label: "我做什麼", nav: "關於" },
    experience: {
      label: "經歷",
      nav: "經歷",
      lead: "四段工作，依領域描述。前兩段是主要的：一套服務 2,000+ 企業的多通路客服訊息平台，和一家美國數位招牌公司從報價到入帳的整條鏈。",
    },
    systems: {
      label: "接過的系統",
      nav: "系統",
      lead: "每一條線都是真實的整合，上面流動的是錢、訂單或訊息。深色節點是我做過的核心系統，點一下看資料怎麼流。",
    },
    work: {
      label: "事件紀錄",
      nav: "紀錄",
      lead: "真實處理過的案子：問題、根因、怎麼修、學到什麼。客戶與內部名稱已去識別化，點開一則看細節。",
    },
    principles: {
      label: "工作方式",
      nav: "原則",
      lead: "寫程式、做架構決策、審 code 時一直在用的幾條規矩。每一條後面都有一件真實發生過的事。",
    },
    ai: {
      label: "和 AI 一起工作",
      nav: "AI",
    },
    projects: {
      label: "個人專案",
      nav: "專案",
      lead: "工作之外寫的程式，每一個都有能跑的程式碼；公開的附上 repo 連結。",
    },
    offDuty: {
      label: "下班後",
      nav: "下班後",
      lead: "下班後開賽車模擬器。電腦卡頓也一樣處理：先量，再修。",
    },
    contact: { label: "聯絡", nav: "聯絡" },
  },

  experience: [
    {
      id: "messaging",
      short: "客服訊息平台",
      domain:
        "香港的 AI 全通路客服訊息 SaaS。企業透過它在 WhatsApp、WeChat、LINE、Messenger、Instagram 和網頁聊天上與客戶對話，再交給共用收件匣、工單路由、chatbot 與 AI Agent 處理。",
      context:
        "多租戶平台，服務 2,000+ 企業，另有企業版與私有雲部署。PHP 單體加 NestJS 微服務，RabbitMQ 事件匯流排，跑在 AWS EKS 上；遠端加入香港團隊，工作語言英文。",
      role: "全端工程師：PHP 與 NestJS 後端、React 前端、AI 整合、架構規劃與 code review，並擔任 Email 通路專案的 owner",
      summary:
        "負責對話背後的系統：訊息怎麼進來、怎麼送出、怎麼計費、怎麼交給 AI 處理。從訂閱方案與預付點數計費做起，接手一套大型機構的預約系統，之後主做 WhatsApp 群組、語音轉文字、翻譯與 AI Agent 自動回覆的整條鏈路，並處理多起 production 事故到根因。",
      areas: [
        {
          title: "預付點數計費平台",
          body: "主要作者（初始 infra 由同事建立）。系統每小時以滑動視窗拉 WhatsApp、LLM 與 workflow 的用量並扣預付點數，再做每日對帳、月結與多幣別計價；金額一律用 Decimal128，每筆交易都能追回來源。也支援把帳號金鑰推送到客戶的私有雲部署，請求以 HMAC-SHA256 簽章，並擋掉內網與雲端 metadata 位址。",
          impact: "所有預付客戶的每一筆扣點、每日對帳與月結單都由這套產生；對 BSP 用量 API 的呼叫主動限速在官方上限的 2/3。",
        },
        {
          title: "AI 鏈路：語音轉文字、翻譯、AI Agent 回覆",
          body: "定下 AI 事件的分工原則：AI 服務只呼叫供應商並發布結果事件，寫入與推播由擁有資料的核心系統負責。語音轉文字用 Azure Speech 串流處理、長度不受限；AI Agent 回覆以（租戶、工單、訊息）為冪等鍵，commit 之後的失敗一律 park，不 requeue。",
          impact: "語音轉文字橫跨五個服務上線，沒有新增任何 Kubernetes Deployment；翻譯一次呼叫翻完租戶用到的所有語言，prompt 成本不隨語言數增加。",
        },
        {
          title: "Email 通路 owner 與 code review",
          body: "擔任 Email 通路專案的 owner：用過去幾個功能的實際工期校準估點、以區間給出日期，OAuth scope 刻意最小化。在 code review 中抓出一個授權模型錯誤。",
        },
        {
          title: "WhatsApp 與通路整合",
          body: "WhatsApp 群組 API 以 Adapter pattern 支援三家 BSP，建群非同步、等 lifecycle webhook 回寫才完成。媒體下載的指數退避重試刻意塞在 Meta 媒體連結 24 小時的有效期內；用量 API 改成並行加快取：原本一次呼叫佔住 worker 18 秒，快取命中後 50 毫秒以下。自助開通改接 Embedded Signup v4，後端先確認號碼確實屬於客戶授權的帳號才註冊。",
          impact: "三家 BSP 共用同一套群組介面；媒體重試八段退避累計約 22.7 小時，收在 24 小時有效期內；一個客戶回報的權限問題追出四個同源缺陷。",
          metric: { label: "用量 API（快取命中）", before: 18000, after: 50, beforeText: "18 s", afterText: "< 50 ms", factor: "360× 以上" },
        },
        {
          title: "接手的兼職人員預約系統",
          body: "接手香港一家大型會員制機構的兼職人員預約系統，成為主要開發者與維運負責人。做了候補、保留與逾時遞補的狀態機，遞補用 FOR UPDATE SKIP LOCKED 逐筆處理；兩次重大事故後，把 DateRangePolicy 定為所有日期條件的唯一出口。",
          impact: "兩次重大事故之後，所有日期條件都經過同一個 policy，預設 30 天前到 180 天後、硬上限 400 天，查詢不可能再沒有上界。",
          metric: { label: "篩選查詢（index 修回後）", before: 6300, after: 44, beforeText: "6.3 s", afterText: "44 ms", factor: "143×" },
        },
        {
          title: "收件匣、工單與聯絡人",
          body: "工單指派加上分散式鎖與樂觀並行控制，和前端的期望值不符就回 409；lock key 的算法刻意對齊，讓 PHP 核心與 Node 的工單路由服務共用同一組 Redis 鎖。聯絡人更新帶版本號，過期就拒絕，所有更新都即時推播同步。",
        },
        {
          title: "共用程式庫、Cron 與維運",
          body: "排程統一成 nest-commander 加 Kubernetes CronJob，取代 @nestjs/schedule 加 Redlock；超大 collection 的資料保留任務改用 cursor 分批刪除。另外新增 envelope encryption 程式庫，交付走 GitLab CI、Helm 與 ArgoCD 到 AWS EKS。",
          impact: "框架升級讓 LLM 用量計費靜默中斷的事故，用最小重現定位後，11 個 module 的子路由 middleware 一次救回並加上 fail-loud。",
        },
      ],
      stack: [
        "PHP (Yii2)",
        "TypeScript",
        "NestJS",
        "React",
        "redux-saga",
        "MySQL (Aurora)",
        "MongoDB",
        "Redis",
        "RabbitMQ",
        "Azure OpenAI",
        "WhatsApp Business API",
        "Kubernetes (AWS EKS)",
      ],
    },
    {
      id: "signage",
      short: "報價到入帳",
      domain:
        "美國的 LED 數位招牌公司，賣戶外 LED 招牌，硬體附軟體訂閱。終端客戶在線上 3D 報價器設計招牌、報價、簽約、付款；合作招牌商在批發平台進貨再加價轉售。",
      context:
        "直客、批發招牌商、內部業務代報價三種通路，服務美國與加拿大。系統橫跨主後端、CRM 與 3D 報價器、招牌商批發平台、訂閱付款服務、資料平台與 NetSuite 腳本；遠端加入美國團隊。",
      role: "quote-to-cash 鏈的主力全端工程師：後端、前端、3D、資料模型、NetSuite 腳本與發版協調，並直接和會計、財務、法務、業務對接",
      summary:
        "負責從一張招牌設計到一筆入帳的整條路：3D 報價器、報價引擎、Stripe 訂閱計費、HubSpot 與 NetSuite 同步、給招牌商用的批發平台。牽涉到錢的系統，重點是正確：可以重試，但不會重複扣款；錯誤要講清楚發生什麼事；判斷要用真實資料驗證。",
      areas: [
        {
          title: "統一報價引擎與版本化定價",
          body: "從零設計分層的報價引擎，每條 line item 都附 cost trace；上面再加版本化定價，策略放在 code 裡的 registry，未知版本 fail-closed，翻 pointer 就是切換或回滾。公司換到硬體買斷的新商業模式，沒有重算任何一張已簽約的報價。更早一次舊引擎重構，用 55 個 golden master 加新舊引擎比對，抓到 11 個差異，修到 100% 一致才切換。",
          impact: "公司換商業模式時沒有重算任何一張已簽約的報價；NetSuite 沿用既有 item，零新 SKU。",
          metric: { label: "舊引擎重構：新舊比對差異", before: 11, after: 0, beforeText: "11 處", afterText: "0 處" },
        },
        {
          title: "Cellular 計費引擎：事件溯源、扣款恰好一次",
          body: "把三代並存的行動網路計費收斂成一張登記表、一個 Stripe writer、一個純函式政策引擎，partial unique index 從資料層杜絕雙收。先寫 ledger 再呼叫 Stripe，batch 必須帶兩封提醒信的事件 id 才能扣卡；不變式用 39,622 個生成案例驗證。",
          impact: "不變式 grid 從 7,745 擴到 39,622 個案例，70 分鐘模擬 4 年；同一台控制器被收兩次由資料層約束擋掉。",
        },
        {
          title: "招牌商批發平台與 3D 報價器",
          body: "從零建立批發報價模組：報價與數量折扣、品牌化 PDF、結帳與電子簽名、ACH 與信用卡手續費。客戶提案從沒有成本欄位的型別逐欄組出，成本靠結構不外洩；3D 報價器改用 InstancedMesh，50×100 英尺的招牌從 12,503 個 draw call 降到 8 個、重建從 290 毫秒降到 8 毫秒。",
          impact: "客戶提案的成本欄位在型別上不存在，外洩在結構上不可能；3D 改動用 52 個情境、2 個視角做像素比對，標準尺寸 0 px 差異。",
          metric: { label: "大尺寸招牌重建", before: 290, after: 8, beforeText: "290 ms", afterText: "8 ms", factor: "36×" },
        },
        {
          title: "Stripe 訂閱計費",
          body: "把一筆加總的訂閱改成逐項計費，結帳時同時鑄造月繳與年繳的 price，切換週期只是換 id；出貨後才開始計費，用 billing_cycle_anchor 取代假的試用期。Stripe webhook 改走 BullMQ 管線，有重試、冪等與可 replay 的 dead-letter queue。",
          impact: "新版訂單出貨後永遠不會扣款的問題，在第一筆訂單出貨前修好；webhook 五次指數退避、冪等鍵保留 7 天、DLQ 保留 30 天可 replay。",
        },
        {
          title: "Quote-to-cash 跨系統同步",
          body: "HubSpot 成交後依序 upsert 客戶、聯絡人、機會與估價單到 NetSuite，Stripe 的付款與訂金自動入帳，財務可以直接對帳。寫入前先查 NetSuite 是否已有會計手建的單據，查不到就 fail-closed；運費集中成單一服務，立下「承運商失敗絕不寫成 0」的不變式。",
          impact: "切換多棧板運費 payload 前做受控的 production 金額比對，差異為 0；付款條件回填把對 ERP 的請求從上千次降到個位數。",
        },
        {
          title: "發版協調與資料模型",
          body: "主導一次橫跨六個服務、二十多張票的訂閱計費發版：對自己的計畫做對抗式審查、抓出三個影響營收的排序錯誤，runbook 含 34 條 pre-flight 與回滾表。在同事建立的資料平台上負責 cellular 與訂閱的 dbt 與 Cube 模型。",
          impact: "runbook 的 34 條 pre-flight 每條附停止條件，十多步部署每步寫「做錯順序會壞什麼」，並列出明知留著的洞。",
        },
      ],
      stack: [
        "TypeScript",
        "NestJS",
        "Next.js",
        "React",
        "Three.js",
        "MongoDB",
        "PostgreSQL",
        "BullMQ",
        "Stripe Billing",
        "HubSpot",
        "NetSuite",
        "dbt",
      ],
    },
    {
      id: "social-app",
      short: "社群 App",
      earlier: true,
      domain: "台灣新創的在地即時社群 App。",
      context: "NestJS 微服務（帳號、社群、排行榜、地點、日記與兩個 API gateway）跑在 Kubernetes 上，用 GCP。",
      role: "後端工程師",
      summary:
        "入職前沒碰過 NestJS，邊學邊把服務拆開。負責社群 API、推播與管理後台，App 準時上線並穩定運作。",
      areas: [
        {
          title: "Snowflake ID 服務",
          body: "Kubernetes 自動擴展下 pod 數量不固定，worker ID 無法靜態分配。用 Redis 有序集合做 worker ID 的分配與回收，包成一個 NestJS 服務。",
        },
        {
          title: "10 位數不連續的使用者 ID",
          body: "拆成亂數、唯一、固定 10 位、可編碼解碼四個子問題，用進位制轉換自己設計演算法。",
        },
        {
          title: "推播、排程與後台",
          body: "FCM 推播 API，以及推播排程、活動管理與 App 封面的管理後台；Cloud Scheduler 每日資料封存與 Slack 通知自動化。",
        },
      ],
      stack: ["NestJS", "TypeORM", "MySQL", "Redis", "Kubernetes", "GCP", "Firebase Cloud Messaging", "Vue", "Slack API"],
    },
    {
      id: "factory",
      short: "製造業數位轉型",
      earlier: true,
      domain: "替傳統製造業做數位轉型的軟體公司。",
      context: "客戶是傳產工廠；PHP 與 MySQL、MSSQL，串接工廠既有的 MES 與 ERP。",
      role: "全端工程師",
      summary: "職涯的起點。學會和真實的老舊系統與資料打交道，用 PHP 把工廠的採購、訂單和機台監控接上網。",
      areas: [
        {
          title: "EIP 採購與訂單系統",
          body: "CodeIgniter 寫的企業入口系統，串接 MES、直接使用 ERP 資料庫，讓跨部門看到同一份資料。",
        },
        {
          title: "雲端 MQTT 監控網站",
          body: "從零開發機台的雲端監控網站，之後優化即時資料的處理並重新設計介面。",
        },
        {
          title: "客戶官網 CMS",
          body: "替客戶做官網與內容管理後台。",
        },
      ],
      stack: ["PHP (CodeIgniter)", "JavaScript", "MySQL", "MSSQL", "MQTT"],
    },
  ],

  systems: {
    nodes: [
      {
        id: "quote",
        label: "報價到入帳",
        kind: "hub",
        note: "數位招牌公司的核心：3D 報價器、版本化定價引擎、結帳、訂閱與出貨在這裡對齊。每一條 line item 都附 cost trace 與付款方。",
      },
      {
        id: "data",
        label: "資料平台",
        kind: "hub",
        note: "Meltano、dbt 與 Cube.js 的倉儲。平台由同事建立；我負責 cellular 與訂閱的 dbt 與 Cube 模型，以及擷取階段的隱私遮蔽。",
      },
      {
        id: "messaging",
        label: "客服訊息平台",
        kind: "hub",
        note: "多通路客服 SaaS：PHP 單體加 NestJS 微服務，RabbitMQ 事件匯流排，STOMP 即時推播，跑在 AWS EKS。點數計費、AI 鏈路與預約系統都掛在這裡。",
      },
      {
        id: "n8n",
        label: "n8n 工作流",
        kind: "hub",
        note: "自家 fork 的 workflow 引擎。維護自訂 node、用量 API 與資料清理；處理過清理任務擋住 webhook 寫入的事故。",
      },
      {
        id: "stripe",
        label: "Stripe",
        kind: "service",
        note: "訂閱、ACH 與一次性付款。每次嘗試一把冪等鍵，webhook 走 BullMQ 管線，用 test clock 演練未來的帳單。",
      },
      {
        id: "hubspot",
        label: "HubSpot",
        kind: "service",
        note: "業務的成交紀錄在這裡。顯示標籤和內部值不同，少一個連字號就會分錯整類 lead。",
      },
      {
        id: "netsuite",
        label: "NetSuite",
        kind: "service",
        note: "最後所有的錢都要在 ERP 裡對得上。SuiteQL 在一萬列會靜默截斷，item 與 terms 的 id 每個環境都不同。",
      },
      {
        id: "avalara",
        label: "Avalara",
        kind: "service",
        note: "銷售稅，依付款方拆分 transaction。",
      },
      {
        id: "fedex",
        label: "FedEx",
        kind: "service",
        note: "LTL 運費報價。承運商失敗絕不寫成 0，地址自己先驗。",
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        kind: "service",
        note: "Cloud API 與多家 BSP。群組 API、媒體下載重試、用量計費與 Embedded Signup。",
      },
      {
        id: "line",
        label: "LINE",
        kind: "service",
        note: "多通路收件匣的其中一個通道，和 WeChat、Messenger、Instagram 一起進同一套工單路由。",
      },
      {
        id: "email",
        label: "Email",
        kind: "service",
        note: "Email 通路專案的 owner：M365 與 Gmail OAuth、最小 scope、token 以 envelope encryption 保存。",
      },
      {
        id: "openai",
        label: "Azure OpenAI",
        kind: "service",
        note: "語音轉文字、翻譯、AI Agent 回覆與 LLM 用量計量；AI 服務只發結果事件，寫入由核心系統負責。",
      },
    ],
    edges: [
      { from: "quote", to: "hubspot", flow: "報價建立 deal，金額與階段自動同步；成交後觸發 NetSuite 同步" },
      { from: "quote", to: "netsuite", flow: "成交後 upsert 客戶、機會與估價單；Stripe 付款與訂金入帳；寫入前先查既有單據" },
      { from: "stripe", to: "quote", flow: "訂閱計費、ACH、webhook 管線（BullMQ、冪等、DLQ）" },
      { from: "avalara", to: "quote", flow: "依付款方拆分的銷售稅" },
      { from: "fedex", to: "quote", flow: "LTL 運費報價；失敗回 null，不回 0" },
      { from: "quote", to: "data", flow: "訂閱與 cellular 的分析模型（dbt、Cube）" },
      { from: "stripe", to: "data", flow: "付款與訂閱資料擷取進倉儲，個資在擷取階段移除" },
      { from: "whatsapp", to: "messaging", flow: "多家 BSP 的訊息、群組 API、媒體下載重試、對話用量計費" },
      { from: "line", to: "messaging", flow: "LINE 與其他通路的訊息進同一個收件匣與工單路由" },
      { from: "email", to: "messaging", flow: "核心只留最小 adapter，email 服務做 ingress 與 egress，跨服務只傳指標" },
      { from: "messaging", to: "openai", flow: "語音轉文字、翻譯、AI Agent 回覆；短效租戶 JWT 讀取 LLM 用量" },
      { from: "messaging", to: "n8n", flow: "workflow 用量 API、依聊天終止執行、Shopify 與 Meta Catalog 節點、SSH tunnel MySQL node" },
    ],
    skills: [
      {
        label: "主力（每天用，能設計與排障）",
        items: [
          "TypeScript / Node.js",
          "NestJS",
          "React",
          "redux-saga",
          "PHP (Yii2)",
          "MySQL / Aurora",
          "PostgreSQL",
          "MongoDB",
          "Redis",
          "RabbitMQ",
          "BullMQ",
          "Stripe Billing",
          "Kubernetes (AWS EKS)",
          "Docker",
        ],
      },
      {
        label: "上線過（有實作與案例）",
        items: [
          "Next.js",
          "Three.js",
          "GraphQL (Apollo Federation)",
          "Strapi v4",
          "HubSpot",
          "NetSuite (SuiteQL, SuiteScript)",
          "Avalara",
          "WhatsApp Business API",
          "Chargebee",
          "n8n",
          "Azure OpenAI",
          "Azure Speech",
          "Elasticsearch",
          "dbt",
          "Cube.js",
          "Helm / ArgoCD",
          "GitLab CI",
          "GitHub Actions",
          "Sentry",
          "AWS (S3, SES, KMS)",
          "Playwright",
          "Jest",
          "Vitest",
        ],
      },
      {
        label: "方法",
        items: [
          "事件溯源",
          "分散式鎖與樂觀並行控制",
          "冪等鍵設計",
          "golden master 與 property-based 測試",
          "Stripe Test Clock 演練",
          "runbook 與分階段發版",
          "ADR 與規格先行",
          "AI 輔助開發（決策與 production 操作由人負責）",
        ],
      },
    ],
  },

  work: {
    categories: {
      incident: "事故",
      payments: "金流",
      integration: "整合",
      architecture: "架構",
      data: "資料",
      product: "產品",
    },
    entries: [
      {
        id: "pricing-engine",
        title: "換商業模式，不重算任何一張已簽約的報價",
        category: "architecture",
        track: "signage",
        featured: true,
        outcome: "已簽約報價重算 0 張",
        problem:
          "公司要從依招牌面積收月訂閱，轉成硬體買斷加自由組合的加購。原本三套各自演進的報價邏輯重複又會漂移，而切換時已簽約的報價絕對不能被重新定價。",
        cause:
          "定價變更常常是整段邏輯重寫，光改數字的 config 不夠；用環境變數切換沒有稽核、無法回滾；用權限開關違反單一職責。所以邏輯和數字要一起版本化。",
        actions: [
          "從零設計分層的 Quote v3：domain、catalog、費用政策、毛利、orchestrator、output adapter，每條 line item 附 cost trace",
          "版本化定價引擎：策略放在 code 裡的 registry，依報價自己的 stamp、全域 active pointer、預設的順序解析，未知版本 fail-closed",
          "Mongo 只存 active pointer 與 append-only 變更史，翻 pointer 就是切換或回滾",
          "只有已鎖定的報價凍結在 stamp 版本，草稿跟著 pointer 走，存檔時重新 stamp",
          "每條 line 標記付款方，不變式測試鎖住終端客戶應付加招牌商應付等於總額，稅、NetSuite、PDF 與 Stripe 都依付款方拆分",
          "分階段交付，每階段舊行為逐位元不變",
          "切換前做 legacy parity 稽核，抓到可能讓舊訂單月費歸零並產生雙重訂閱的縫隙",
        ],
        result: "成為新商業模式的正式定價模型並上線，沒有重算任何一張已簽約的報價，NetSuite 零新 SKU；後續的新產品線與模組直接掛在這套架構上擴充。",
        evidence: [
          "不變式測試鎖住：終端客戶應付加招牌商應付等於總額",
          "切換前的 legacy parity 稽核掃過完整 diff",
          "NetSuite 沿用既有 item，零新 SKU",
        ],
        lesson: "定價的邏輯和數字要一起版本化，放在 code 裡才有稽核和回滾。",
        flows: [
          {
            label: "報價引擎的分層",
            steps: ["Domain", "Catalog", "費用政策", "毛利", "Orchestrator", "Output adapter"],
            note: "每條 line item 都附 cost trace",
          },
          {
            label: "選哪一版定價",
            steps: ["報價自己的 stamp", "全域 active pointer", "預設版本"],
            note: "找不到版本就 fail-closed；翻 pointer 就是切換或回滾",
          },
        ],
        stack: ["NestJS", "MongoDB", "Strategy / Registry", "Avalara", "Stripe", "NetSuite", "Next.js"],
      },
      {
        id: "vanishing-index",
        title: "消失的 index：migration 說建好了，資料庫說沒有",
        category: "incident",
        track: "messaging",
        featured: true,
        problem:
          "接手維運的預約系統，管理員回報「用員工編號篩選，結果出現不相干的人」。看起來像篩選邏輯寫錯。",
        cause:
          "後端沒帶日期時其實已經逾時回 500；前端 SWR 開了 keepPreviousData，失敗時繼續顯示上一次的資料，後端錯誤被偽裝成資料錯誤。再往下查，migration 紀錄顯示兩支 index migration 都跑過，SHOW INDEX 卻說不存在：Strapi v4 開機先跑 migration，接著 schema sync 把沒宣告在 content-type 裡的 index 全部刪掉。沒有 index，MySQL 只能把 CTE 規劃成全表 hash join。",
        actions: [
          "把 index 宣告進 Strapi 的 schema.json，交給 ORM 自己維護",
          "加 guard test，防止用 Content-Type Builder 改 schema 時把 index 洗掉",
          "logger 會丟掉 meta 物件，所以把錯誤原因寫進訊息字串",
          "前端失敗時顯示錯誤，不再沿用舊資料",
          "寫成 ADR，讓團隊之後都知道",
        ],
        result: "查詢從 6.3 秒降到 44 毫秒；index 在重啟與強制 full sync 之後仍然存在。",
        metrics: [
          { label: "查詢時間", before: 6300, after: 44, beforeText: "6.3 s", afterText: "44 ms", factor: "143×" },
        ],
        evidence: [
          "SHOW INDEX 確認 index 在重啟與強制 full sync 之後仍存在",
          "guard test 守住 schema.json，Content-Type Builder 改 schema 也洗不掉",
        ],
        lesson: "「紀錄說做過」和「它現在存在」是兩回事，驗證要看最終狀態。",
        stack: ["Strapi v4", "MySQL", "Knex", "SWR", "ADR"],
      },
      {
        id: "configurator",
        title: "3D 報價器：12,503 個 draw call 變 8 個",
        category: "product",
        track: "signage",
        featured: true,
        problem:
          "內部報價工具要支援 50×100 英尺的超大招牌，等於 2,500 個 block、12,500 個 mesh 和等量的 draw call，而且每次改尺寸都整個重建，拖曳 slider 就卡住。",
        cause: "每個 block 部件各自一個 mesh，共享資源也在重建時被 dispose，GPU 每次重新上傳並重新編譯 shader。",
        actions: [
          "每個部件改成一個 InstancedMesh，共用 geometry 與 material，重建時不再 dispose 共享資源",
          "用 requestAnimationFrame 把 slider 拖曳合併成每幀最多一次重建",
          "bounding box 改用 float64，float32 的誤差會讓 LED 平面偏移並改變摩爾紋",
          "USDZ 只能表示獨立節點樹，匯出 AR 前先展開 instance",
          "本機 headless Chromium 做 GPU 像素比對：52 個情境、2 個視角，先證明 master 自己跑兩次是 0 px 差，確認 harness 穩定",
        ],
        result: "標準尺寸 0 px 差異，大尺寸的拖曳也跟得上手。",
        metrics: [
          { label: "Draw call", before: 12503, after: 8, beforeText: "12,503", afterText: "8", factor: "1,563×" },
          { label: "重建", before: 290, after: 8, beforeText: "290 ms", afterText: "8 ms", factor: "36×" },
          { label: "拖曳", before: 457, after: 27, beforeText: "457 ms", afterText: "27 ms", factor: "17×" },
        ],
        evidence: [
          "本機 headless Chromium 做 GPU 像素比對：52 個情境、2 個視角",
          "先證明 master 對自己跑兩次是 0 px 差，確認 harness 穩定",
          "標準尺寸 0 px 差異；最大尺寸差異 ≤ 0.14%，來源是 LED 點陣的摩爾紋，相機移動 0.001 mm 的對照組差得更多",
          "GLTF 與 USDZ 匯出內容一致",
        ],
        lesson: "效能優化要附帶「畫面沒變」的證明，否則只是換了一種 bug。",
        stack: ["Three.js", "React", "Playwright", "WebGL"],
      },
      {
        id: "cellular-billing",
        title: "行動網路計費：扣款恰好一次，通知至少一次",
        category: "payments",
        track: "signage",
        outcome: "雙重收費由資料層擋下",
        problem:
          "招牌控制器內建 SIM，預付期滿後要開始收費，三類訂單規則不同。三代互不相認的機制並存：舊 cron、coverage 引擎、補收。可能雙重收費，多個 Stripe writer 互相覆蓋數量，驗證時甚至觸發過 Stripe 退款。要求很直接：日後有人問為什麼收 2 台，要能直接從紀錄回答。",
        cause: "沒有單一的真實來源，也沒有單一的寫入者。",
        actions: [
          "純 domain 政策 decide(term, history, today)，不 import 任何框架",
          "所有狀態變化寫進 append-only 事件 log，確定性 eventId 加 unique index，用事件筆數做樂觀並行控制",
          "一張登記表：每台控制器的每段服務是一個單位，partial unique index 保證同一台同時只有一個未結束的單位",
          "一個 Stripe writer，分成 planner、executor、reconciler、recorder，不變式是 Stripe quantity 永遠等於登記表上計費中的單位數",
          "Ledger-first：先寫 pending ledger 再呼叫 Stripe，每次嘗試一把冪等鍵，超過 24 小時改和 Stripe 對帳",
          "PostgreSQL advisory lock 固定鎖順序，呼叫 Stripe 期間不開 transaction",
          "通知證明護欄：batch 必須帶兩封提醒信的事件 id 才能轉成扣卡，沒通知到就不會被扣",
          "停用 SIM 只在第三封催繳信實際寄出之後，人工單未決時 fail-closed",
        ],
        result: "已上線；同一台控制器被收兩次由資料層約束擋掉，切換採 expand-contract 四階段，每階段都可以回滾。",
        evidence: [
          "不變式 grid 從 7,745 擴到 19,811，統一版 39,622 個案例；每加一個維度都先證明舊規則會違反，修正後歸零",
          "property test：60 個 seed，隨機注入斷線，每步斷言 Stripe 數量等於登記表",
          "端到端演練：70 分鐘模擬 4 年，423 步",
          "改動前的 46 個舊測試原封不動跑綠，證明旗標關閉等於今天的行為",
        ],
        lesson: "錢的路徑 fail-closed：沒有證據就不扣款。日期不是開關，扣掉的錢退不回來。",
        flows: [
          {
            label: "一筆扣款怎麼產生",
            steps: ["純函式政策 decide(term, history, today)", "append-only 事件 log", "登記表：每台每段一個單位", "Stripe writer"],
            note: "partial unique index 保證同一台同時只有一個未結束的單位",
          },
          {
            label: "Stripe writer 內部",
            steps: ["planner", "先寫 pending ledger", "executor（每次嘗試一把冪等鍵）", "reconciler", "recorder"],
            note: "沒有兩封提醒信的事件 id，就不會扣卡",
          },
        ],
        stack: ["Event sourcing", "PostgreSQL", "Stripe", "BullMQ", "AWS SES", "dbt"],
      },
      {
        id: "subscription-billing",
        title: "出貨後才開始計費，而且不能顯示成免費試用",
        category: "payments",
        track: "signage",
        outcome: "在第一筆出貨前修好",
        problem:
          "舊訂閱是一筆加總金額，客戶看不出自己付了什麼。用 Stripe 的 trial_end 表示「出貨後才計費」，付費客戶卻看到免費試用，收據還印著 TRIAL。盤點時又發現：新版訂單出貨後，月費、提醒信與分期第二筆全部不會觸發。",
        cause:
          "建訂閱的 cron 讀的是舊 collection 的出貨日，新版訂單的出貨資訊在另一個 collection；也沒有任何程式把新版報價推進到偵測要看的狀態。",
        actions: [
          "逐項計費，每個產品一個 Stripe item，結帳時同時鑄造月繳與年繳的 counterpart price，切換週期只是換 id",
          "新增 pending_shipment 狀態，出貨後才建 Stripe 訂閱，用 billing_cycle_anchor 加 proration_behavior none 取代試用期",
          "期末取消用 Subscription Schedule 移除付費 item，訂閱保持存活，可一鍵恢復",
          "統一的 OrderShipDateReader，修在第一筆新版訂單出貨之前",
          "用真實的 Stripe Test Clock 演練取消、首張發票與年繳切換，抓到換 price 沒帶 quantity 會把數量重設成 1，把「換價必定重述數量」集中成一個 helper",
        ],
        result: "新版訂單出貨後不會扣款的問題在第一筆出貨前修好；付費客戶不再看到免費試用，收據不再印 TRIAL。",
        evidence: [
          "真實的 Stripe Test Clock 演練取消、首張發票與年繳切換",
          "換 price 沒帶 quantity 會重設成 1 的 bug 是演練抓到的，mock 抓不到",
          "修在第一筆新版訂單出貨之前",
        ],
        lesson: "計費的 bug 要等到下一次扣款才浮現，測試得能穿越時間。mock 抓不到 Stripe 的真實語意，test clock 可以。",
        stack: ["Stripe Billing", "NestJS", "PostgreSQL", "TypeORM", "BullMQ"],
      },
      {
        id: "ai-replies-lost",
        title: "AI 回覆全部石沉大海，測試卻全綠",
        category: "incident",
        track: "messaging",
        outcome: "AI 回覆全部送達",
        problem:
          "AI Agent 部署到測試環境後，每一則 AI 回覆都沒送到客戶。LLM 的答案是對的，AI 服務也把結果送回來了，核心系統就是沒寫入。",
        cause:
          "存訊息時經過變更紀錄、指派客服、取客服名字，第 4 層才讀取目前租戶，前三層看起來和租戶毫無關係。這個 handler 在內部 daemon 裡執行，沒有 HTTP Host，租戶初始化直接丟例外；catch 把它判成暫時性錯誤並 rethrow，訊息無限重送，pod 最後被 OOMKilled。原本的端對端測試在開頭自己設好了租戶，剛好補上 handler 缺的東西，27 個斷言全過，測的是 production 不存在的狀態。",
        actions: [
          "handler 一開始就解析租戶放進 slot，只接受正常狀態的租戶，結束時在 finally 清掉，避免長駐程序把下一則訊息算到錯的租戶",
          "先提交只有測試、沒有修正的 commit，讓 CI 留下紅燈，再提交修正",
          "再找出兩個假綠測試：一個在 fixture 階段就出錯、根本沒測到 handler，一個沒觸發到風險路徑，都改成真正執行的行為測試",
          "測試移進 CI 的 blocking lane",
        ],
        result: "AI 回覆全部送達客戶，pod 不再因為無限重送被 OOMKilled；三個測試改成真正執行 handler 的行為測試。",
        evidence: [
          "先提交只有測試的 commit，CI 留下紅燈；再提交修正，轉綠",
          "原本 27 個斷言的 E2E 改成不自己設租戶、真正執行 handler 的行為測試",
          "另外兩個假綠測試一併改寫，全部進 CI 的 blocking lane",
        ],
        lesson: "測試全綠時，要問它證明了什麼。",
        stack: ["PHP", "RabbitMQ", "多租戶", "Kubernetes"],
      },
      {
        id: "save-error-contract",
        title: "把模糊的 500 變成可行動的錯誤",
        category: "integration",
        track: "signage",
        problem: "業務不斷回報「存檔 500」，訊息模糊，沒人知道原因，客服也無從追起。",
        cause:
          "先用 production 唯讀普查排除資料面的假設，全部是 0。實際執行全域 exception filter 才發現：只有自訂例外和 404 保留狀態碼，全 repo 約 385 處刻意拋出的 4xx 全被壓成 500，前端依狀態碼分流的分支因此全是死碼。",
        actions: [
          "有序的 ExceptionMapper 鏈取代單一 filter，每個錯誤都帶 requestId，客服可以直接追查",
          "上游 HubSpot 的錯誤一律回 502，不回傳上游 body；只有 5xx 進 Sentry",
          "webhook 自身設定缺漏時回 503，因為發送方收到 401 會直接丟棄事件",
          "建單改成先計價再建 HubSpot deal，失敗就封存，不留孤兒",
          "Idempotency-Key 加 partial unique index，逾時重送不會重複建單",
          "付款冪等鍵改成每次嘗試一把，只在結果未知時重用",
          "修好一個在 production 從未建立成功的唯一索引，並加上索引健康檢查",
          "前端依 error code 分支：4xx 顯示伺服器給的原因，5xx 顯示重試提示與 Ref id",
        ],
        result: "每一次報價存檔的錯誤都帶 requestId 可追，逾時重送不會重複建單，付款重試不會重播被拒的卡。",
        metrics: [
          { label: "被壓成 500 的 4xx", before: 385, after: 0, beforeText: "約 385 處", afterText: "0 處" },
        ],
        evidence: [
          "production 唯讀普查：所有壞資料假設的計數都是 0",
          "實際執行全域 exception filter，數出約 385 處 4xx 被改成 500",
          "43 個 E2E 情境全部通過，接真實的 Stripe test mode 與模擬的 HubSpot",
          "每個情境同時斷言 HTTP 狀態、errorCode、外部副作用次數與 DB 狀態",
        ],
        lesson: "先排除資料，再懷疑程式。錯誤要讓客服能追、讓前端能分流。",
        stack: ["NestJS", "pino", "Sentry", "Stripe", "HubSpot", "MongoDB", "Next.js"],
      },
      {
        id: "n8n-lock-defence",
        title: "資料清理擋住客戶 webhook：四層防禦",
        category: "incident",
        track: "messaging",
        outcome: "清理照跑，webhook 不再被擋",
        problem:
          "自家 fork 的 workflow 引擎每天清理舊的執行紀錄。清理跑起來時，客戶的 webhook 寫入全部逾時，建在上面的自動化跟著停擺。",
        cause:
          "原本的範圍 DELETE 在大型執行紀錄表上長時間持有 gap lock；backport 兩階段清理之後，軟刪除的 UPDATE 被 optimizer 選成 index_merge intersect，持有 supremum lock，把新資料的 INSERT 全部擋住。",
        actions: [
          "拆成「先查 id、再依 id 更新」兩步，縮小鎖的範圍",
          "FORCE INDEX 固定執行計畫，不讓 optimizer 換",
          "這個 session 用 READ COMMITTED 消除 gap lock，透過專用的 QueryRunner 確保設定落在同一條實體連線",
          "MAX_EXECUTION_TIME 把查詢限制在 30 秒",
          "migration 明確指定 ALGORITHM=INSTANT/INPLACE，做不到就直接失敗，不會在 production 默默重建大表",
        ],
        result: "清理任務照常跑，建在 webhook 上的所有客戶自動化不再被擋；migration 做不到 online DDL 就直接失敗，不會默默重建大表。",
        lesson: "鎖的行為取決於執行計畫，而執行計畫會變。防禦要多層，不能只靠其中一層。",
        stack: ["n8n", "MySQL", "InnoDB", "TypeORM", "Kubernetes"],
      },
      {
        id: "inbox-freeze",
        title: "搜尋過一次之後，收件匣就不再即時更新",
        category: "incident",
        track: "messaging",
        outcome: "搜尋之後也持續即時更新",
        problem:
          "客服在收件匣用過搜尋後，新訊息就不再出現，只能重新整理頁面。監控全部顯示健康。",
        cause:
          "即時更新靠 3 個 redux-saga worker 消費同一個 STOMP channel。迴圈裡用 return 來跳過這筆事件，但 generator 裡的 return 會結束整個 worker。搜尋讓這個分支頻繁觸發，3 個 worker 很快死光；socket 還連著、心跳照常，監控就判定一切正常。",
        actions: [
          "抽出 processStompEvent 與 runStompWorkerLoop，每筆事件各自 try/catch",
          "只有傳輸層錯誤才退出迴圈並重新連線",
          "替這個迴圈補上單元測試",
        ],
        result: "所有用過搜尋的客服，收件匣都持續即時更新，不用再重新整理；存活檢查改看最後一次成功處理事件的時間。",
        lesson: "存活檢查要看最後一次成功處理事件的時間。連線開著和有人在工作是兩個不同的訊號。",
        stack: ["React", "redux-saga", "STOMP", "WebSocket"],
      },
      {
        id: "ffmpeg-licence",
        title: "語音轉文字用的 ffmpeg，授權上不能再散佈",
        category: "architecture",
        track: "messaging",
        outcome: "約 50 MB → 數 MB，可合規散佈",
        problem: "語音轉文字要先用 ffmpeg 把音訊解成 PCM。檢查依賴時發現 ffmpeg-static 是用 nonfree 旗標編譯的，依 FFmpeg 授權不可再散佈。",
        cause: "方便的預編譯套件把授權風險一起打包進來，沒有人檢查過它的 configure 旗標。",
        actions: [
          "用 --disable-everything 自行編一個 musl 靜態連結、只含需要的 decoder 的 LGPL 最小版本",
          "建置時有 guard：發現 GPL 或 nonfree 旗標就讓 build 失敗",
          "每種收到的容器格式都用 fixture 解碼一次",
          "configure 遇到不認識的元件名稱只警告不失敗，所以加上名稱比對不到就讓 build 失敗的檢查",
        ],
        result: "執行檔從約 50 MB 降到幾 MB，攻擊面跟著縮小，授權可以合規散佈。",
        lesson: "供應鏈裡的授權也是依賴的一部分，要在 build 裡擋，不能靠人記得。",
        stack: ["ffmpeg", "musl", "Docker", "Azure Speech"],
      },
      {
        id: "reporting-gap",
        title: "每日消費報表無聲斷層",
        category: "data",
        track: "messaging",
        problem:
          "點數計費系統裡，所有服務的每日重算都在失敗，報表空了一大段，沒有任何告警。",
        cause:
          "為了支援軟刪除，unique index 改成 partial（deletedAt: null），但 MongoDB 的 $merge 要求非 partial 的 unique index，每次重算都報 error 51183。",
        actions: [
          "改用 bulkWrite upsert，key 為（帳戶、日期、類型、服務、deletedAt: null），partial index 完全不用動",
          "用 initialize 端點回填歷史資料",
          "順手處理 CI 測試的 heap OOM：把組 operation 的邏輯抽成不依賴 DI 的純 util",
        ],
        metrics: [
          { label: "CI 測試記憶體", before: 2048, after: 166, beforeText: "2 GB+", afterText: "166 MB", factor: "12× 以上" },
        ],
        result: "所有服務的每日消費報表回填完成，之後的重算不再碰 partial index；測試記憶體從 2 GB 以上降到 166 MB，約 1 秒跑完。",
        lesson: "schema 層的決策會在別處以意想不到的方式回來咬人。",
        stack: ["MongoDB", "NestJS", "nest-commander", "Kubernetes CronJob"],
      },
      {
        id: "usage-api-worker",
        title: "一次用量查詢佔住 worker 18 秒",
        category: "incident",
        track: "messaging",
        problem: "計費系統向 BSP 拉 WhatsApp 用量時，一次呼叫會把 PHP worker 佔住 18 秒，其他工作排在後面等。",
        cause: "逐一 channel 串行呼叫 BSP，cURL 沒有設 timeout；任何一個 channel 慢，整批都慢。",
        actions: [
          "已經過去、不會再變的時間視窗寫進 Redis 快取，保留 5 分鐘安全邊際；任何 channel 失敗就不寫快取，快取讀寫 fail-open",
          "用 curl_multi 並行抓取，concurrency 4；每個請求 15 秒總上限、5 秒連線上限",
          "部分 channel 失敗不影響其他 channel",
          "對 BSP 主動限速，只用官方上限的 2/3",
        ],
        result: "快取命中時從 18 秒降到 50 毫秒以下，worker 不再被單一租戶的用量查詢佔住。",
        metrics: [
          { label: "用量查詢（快取命中）", before: 18000, after: 50, beforeText: "18 s", afterText: "< 50 ms", factor: "360× 以上" },
        ],
        lesson: "對外部 API 的每一次呼叫都要有 timeout，而且不能讓一個慢的來源拖住整批。",
        stack: ["PHP", "Redis", "cURL", "WhatsApp Business API"],
      },
    ],
  },

  principles: [
    {
      id: "root-cause",
      title: "修在源頭，不打補丁",
      body: "找到那一個 choke point，讓同一類 bug 沒辦法再發生。預約系統的 DateRangePolicy 是所有日期條件的唯一出口；工單指派重複的 fallback 邏輯收斂成一個 assignWithValidation。",
    },
    {
      id: "final-state",
      title: "驗證最終狀態，不信過程紀錄",
      body: "migration 跑過不代表 index 存在，心跳正常不代表有人在處理事件。要去看資料庫裡真正有什麼，看最後一次成功處理是什麼時候。",
    },
    {
      id: "tests-fail",
      title: "測試要能失敗才算數",
      body: "先提交紅燈再提交修正，讓 CI 留下證據。把 guard 條件反過來仍然全綠的測試，一律改成真正執行的行為測試；AI 回覆事故後找出的假綠測試都是這樣修的。",
    },
    {
      id: "disprove",
      title: "推論先證偽，再採信",
      body: "LLM 計費中斷時，第一個推論用 log 推翻，再以部署版本的套件組合做最小重現，才找到框架升級後在子路由靜默跳過的 middleware。審查者的主張也一樣，先對照程式碼再採用。",
    },
    {
      id: "money",
      title: "錢的路徑 fail-closed",
      body: "先寫 ledger 再呼叫 Stripe，每次嘗試一把冪等鍵；沒有通知證明就不扣款；未知的定價版本直接拒絕。承運商失敗絕不寫成 0，因為 0 在下游會被讀成免費。",
    },
    {
      id: "contracts",
      title: "契約驗到最外層",
      body: "跨服務的事件連 envelope 一起驗，做 JSON round-trip。翻譯結果的語言代碼曾被回應攔截器從 zh-Hant 改成 zh-_hant，五輪 review 和三個 repo 的單元測試都沒抓到，因為兩邊各自自洽，問題只在中間的 wire contract。",
    },
    {
      id: "humble",
      title: "對外部系統保持謙遜",
      body: "對 BSP 限速只用官方上限的 2/3；分頁 cursor 要防不前進和拒絕舊 cursor；重試退避塞在媒體連結 24 小時的有效期內；FedEx 不驗證地址，就自己做 preflight。",
    },
    {
      id: "admit",
      title: "承認錯誤，留下紀錄",
      body: "判斷錯了就 revert，並在 commit 寫清楚理由。曾認定 WhatsApp 群組沒有 24 小時客服視窗並加上豁免，隔天確認有，當天撤回；在 MR 裡引入的回歸，下一個 MR 自己修正並記下來。",
    },
  ],

  ai: {
    intro:
      "Claude Code 是我日常開發的主力。需求、所有決策、查證要求、上線順序和 production 操作由我負責；查證程式碼、寫 spec 與票、實作、審查、E2E 交給 agent。每一次改動都走同一條流程，走完才會變成 MR。",
    steps: [
      {
        id: "spec",
        title: "規格先行",
        body: "用 OpenSpec 寫 proposal、design、tasks 與 spec。決策逐條編號，附「為什麼」和「排除了什麼」；大功能附 sequence diagram。",
      },
      {
        id: "verify",
        title: "先查證，再設計",
        body: "讀程式碼時引用 file:line，經同意後做 production 唯讀普查，讀官方文件。把「已驗證」和「推估」分開標示。",
      },
      {
        id: "tdd",
        title: "TDD，紅燈先進 CI",
        body: "先提交會失敗的測試，再提交修正。每個 repo 一個 git worktree，只跑受影響的測試。",
      },
      {
        id: "review",
        title: "對抗式 review",
        body: "獨立的唯讀 agent 審一次，嚴重度分 HIGH、MEDIUM、LOW。意見逐條處理，不照單全收，沒採納的寫理由。",
      },
      {
        id: "e2e",
        title: "腳本化本機 E2E",
        body: "harness 只放暫存目錄、跑完就刪，不為測試新增端點。金流用真實的 Stripe test clock 演練未來的帳單。",
      },
      {
        id: "mr",
        title: "然後才是 MR 與 runbook",
        body: "部署順序每一步寫「反過來會怎樣」，backfill 先 dry-run，旗標一支一支開。production 寫入與合併由我親自執行。",
      },
    ],
    toolsLabel: "工具",
    tools: [
      "Claude Code（skills、agents、hooks、worktrees）",
      "OpenSpec",
      "Stripe test clocks",
      "MCP：Figma MCP、graphiti 知識圖譜記憶",
    ],
  },

  projects: [
    {
      id: "pr-flow",
      name: "PR-Flow",
      status: "私人 repo",
      description:
        "給台灣公關公司用的財務與專案管理平台：客戶與廠商、專案看板、報價、支出與財務報表，多租戶隔離。",
      details: [
        "租戶隔離做在資料庫層：每張表都開 Row Level Security，租戶與角色（Owner / Admin / Member）由 Postgres function 判斷，應用層繞不過去",
        "報價編號、明細金額與稅額由 trigger 計算；註冊建租戶、接受邀請這類多步驟流程各包成一個 SQL function，要嘛整筆成功、要嘛整筆退回",
        "Vitest + Testing Library 共 738 個測試；PRD、資料庫 schema、開發指南與維運 runbook 都放在 repo 裡",
        "Supabase Auth 的邀請與 magic link 流程、Resend 通知信、SWR 快取",
      ],
      stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL", "Vitest"],
      visual: "layers",
    },
    {
      id: "restaurant-cms",
      name: "餐廳官網與自建後台",
      href: "https://github.com/amo0725/ailav-next",
      description:
        "高雄一間 fine-dining 餐廳的正式官網，已上線。前台是 Next.js 16 加 GSAP 的捲動式動態頁面，後台是我為它寫的單人 CMS。",
      details: [
        "後台登入採密碼加 TOTP 兩段驗證，iron-session 加密 cookie，Upstash Redis 限制登入次數（每 15 分鐘 5 次）",
        "Proxy 層統一下 CSP、HSTS 等安全標頭，並擋下未登入的 /admin 與 /api/admin 請求",
        "內容存取抽成 ContentRepository 介面，目前以 Vercel Blob 實作；儲存後用 revalidateTag 讓前台立即更新",
        "以 Lighthouse 為準做效能調整，加上 JSON-LD 與 sitemap；Husky + lint-staged 把 lint 問題擋在 commit 之前",
      ],
      stack: ["Next.js 16", "Tailwind CSS v4", "GSAP", "iron-session", "Upstash Redis", "Vercel Blob"],
      visual: "contour",
    },
    {
      id: "orbit",
      name: "Orbit 共軌",
      alias: "Orbit",
      status: "私人 repo",
      description:
        "把習慣養成做成社群打卡的 PWA：建立「軌道」、邀請朋友一起每日打卡，看統計與成就。週末做出來的作品。",
      details: [
        "Web Push 從頭走到尾：VAPID 金鑰、Service Worker 收推播並處理點擊導向、訂閱存在 Supabase，由 server action 與 Edge Function 發送",
        "通知排程放在資料庫：notification_queue 資料表加上 queue_daily_reminders function 產生每日提醒",
        "索引依實際查詢模式設計（複合索引、部分索引），每張表都有 RLS",
        "Google OAuth 登入、Workbox 預快取與離線頁面",
      ],
      stack: ["Next.js 15", "Supabase", "PostgreSQL", "Web Push", "Workbox", "Tailwind CSS"],
      visual: "radar",
    },
    {
      id: "event-checkin",
      name: "活動報到系統",
      status: "私人 repo",
      description:
        "QR Code 報到系統，實際用在兩場實體活動：一場兩天三場次的開放日，以及一場需登錄繼續教育積分的一日國際研討會。",
      details: [
        "我負責 API 與資料流：MongoDB 名單、報到端點、jose 簽發的 JWT cookie session、Resend 寄送附個人 QR Code 的行前通知、Excel 匯出",
        "現場工作人員用手機掃 QR Code，API 擋下重複報到；後台名單可篩選、排序、分頁",
        "GitHub Actions 在 push 到 main 時呼叫 Vercel deploy hook；Renovate 管依賴更新",
      ],
      stack: ["Next.js", "TypeScript", "MongoDB", "Resend", "GitHub Actions", "Vercel"],
      visual: "tiles",
    },
  ],

  offDuty: {
    sim: {
      name: "Sim racing",
      note: "按住油門，指針往上爬，碰到紅線就被斷油器擋下來。",
    },
    rig: {
      title: "那台電腦，和一次 Valorant 卡頓",
      note: "Valorant 偶爾會頓一下。先用 LatencyMon 量 DPC 延遲，再一次隔離一個變因：BIOS 的 CCD 設定、Process Lasso 把遊戲鎖在 V-Cache CCD、記憶體控制器比例從 2:1 調回 1:1。頓挫消失。",
      specs: [
        { label: "CPU", value: "Ryzen 9 9900X3D" },
        { label: "GPU", value: "RTX 5080" },
        { label: "記憶體", value: "DDR5-6400，控制器 1:1" },
        { label: "排程", value: "Process Lasso 鎖在 V-Cache CCD" },
        { label: "量測", value: "LatencyMon DPC 分析" },
      ],
    },
  },

  contact: sharedContact,

  reel: {
    title: "30 秒，看我在做什麼",
    lead: "整支片是程式碼畫出來的，32 秒一圈。可以拖到任何一格，也可以直接跳章節。",
    summary:
      "一顆綠點從頭演到尾。開場從雷達中心擴散出去；接著變成一筆付款，依序通過報價、HubSpot、Stripe、NetSuite；再打開成客服收件匣，WhatsApp、LINE、Email 的訊息進來，分送給語音轉文字、AI Agent 和 n8n；下一段它畫出心跳線，旁邊的事件計數卻停了，畫面寫著「看起來正常」「其實已經壞了」，綠點落在那個該修的關鍵點上；最後拉長成名字底下的色帶，旁邊是職稱和四個關鍵字。色帶收回成一開始的那顆點，影片從頭再來。",
    play: "播放",
    pause: "暫停",
    replay: "重播",
    fullscreen: "全螢幕",
    scrubber: "播放進度",
    chaptersLabel: "章節",
    chapters: [
      { id: "signal", title: "訊號", at: 0 },
      { id: "cash", title: "報價到入帳", at: 4.5 },
      { id: "messages", title: "訊息", at: 10.5 },
      { id: "root", title: "根因", at: 16.5 },
      { id: "name", title: "Amo Feng", at: 25.5 },
    ],
    s1: { line: "每一個訊號", sub: "都要送到它該去的地方" },
    s2: {
      nodes: ["報價", "HubSpot", "Stripe", "NetSuite"],
      check: "對帳完成",
      line: "每一步都要算得對",
    },
    s3: {
      channels: ["WhatsApp", "LINE", "Email"],
      inbox: "收件匣",
      services: ["語音轉文字", "AI Agent", "n8n"],
      line: "從一則訊息，到每一個服務",
    },
    s4: {
      socket: "socket 已連線",
      events: "已處理事件",
      stalled: "停止處理",
      looks: "看起來正常",
      broken: "其實已經壞了",
      fix: "修在那一個關鍵點",
    },
    s5: {
      role: "全端工程師，在台灣",
      tagline: "系統架構  ·  金流  ·  訊息系統  ·  維運",
    },
    making: {
      label: "怎麼做的",
      concept:
        "全片只有一個元素：開場那顆綠點。它變成封包、收件匣、畫心跳線的筆尖、關鍵點，再拉長成名字底下的色帶，最後縮回原本的那顆點。每一段都是從上一段變形過來的，沒有切換。",
      mapLabel: "節拍表｜120 BPM，64 拍，一拍 0.5 秒",
      states: {
        dot: "綠點",
        packet: "封包",
        inbox: "收件匣",
        pen: "筆尖",
        gate: "關鍵點",
        bar: "色帶",
      },
      rulesLabel: "規則",
      rules: [
        "每個動作都從畫面上已有的東西長出來",
        "所有時間點都落在 120 BPM 的拍子上",
        "段與段之間只有變形，沒有淡入淡出",
        "最後一格等於第一格，直接循環",
      ],
      avoidLabel: "刻意不用",
      avoid: ["光暈", "粒子", "交叉淡化", "畫面震動", "彈跳", "角落數值", "隨機"],
      build:
        "每個屬性都是時間的純函數，所以可以暫停、拖到任何一格。網頁上播的就是這份程式碼。MP4 是用無頭瀏覽器一格一格截圖，再串給 ffmpeg 編出來的。",
      download: "下載 MP4",
      downloadMeta: "1920 × 1080・60 fps",
    },
    video: {
      src: "/reel/amo-feng-showreel-zh-TW.mp4",
      poster: "/reel/amo-feng-showreel-zh-TW.jpg",
    },
  },
};
