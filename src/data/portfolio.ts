export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  technologies: string[];
  website: string;
  overview: string;
  highlights: { title: string; items: string[] }[];
  challenges: { title: string; problem: string; solution: string }[];
  outcomes: string[];
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "ginseng-official-store",
    title: "金蔘官方購物網站",
    category: "電子商務",
    summary: "金蔘股份有限公司的人蔘與健康食品官方購物網站。",
    image: "/images/portfolio/ginseng-store.png",
    technologies: ["電子商務", "商品型錄", "購物車", "會員服務"],
    website: "https://www.ginseng.com.tw/",
    overview:
      "金蔘官方網站整合人蔘與健康食品的商品展示、購物車、會員服務與客服資訊，提供消費者從商品瀏覽到結帳的官方購買入口。",
    highlights: [
      { title: "商品總覽", items: ["呈現人蔘、黑蔘與健康食品商品", "提供商品價格與加入購物車入口"] },
      { title: "購物服務", items: ["支援購物車與結帳流程", "提供會員權益、退換貨與常見問題說明"] },
      { title: "品牌服務", items: ["提供品牌故事、安心品質與人蔘介紹內容", "整合客服電話、電子郵件與 LINE 聯絡資訊"] },
    ],
    challenges: [
      { title: "商品資訊呈現", problem: "健康食品商品需要讓消費者快速辨識品項與購買選項。", solution: "以商品總覽集中呈現商品名稱、價格與加入購物車入口，降低瀏覽與選購門檻。" },
      { title: "購買前疑慮", problem: "消費者在結帳前會需要確認會員、退換貨與產品相關資訊。", solution: "在官方網站提供會員權益、退換貨說明、常見問題與品質資訊等支援入口。" },
    ],
    outcomes: ["建立人蔘與健康食品的官方線上購買入口", "串連商品瀏覽、購物車與結帳流程", "集中提供品牌內容與多元客服聯絡方式"],
  },
  {
    slug: "1on1-today",
    title: "1on1.today 全球家教共享平台",
    category: "平台開發",
    summary: "連接超過 120 個國家的家教、老師、教練與學習者。",
    image: "/images/portfolio/1on1-today.png",
    technologies: ["Laravel", "Vue.js", "MySQL", "AWS", "Redis", "Stripe"],
    website: "https://1on1.today/zh-TW",
    overview:
      "一個全球家教資源共享平台，讓學習者探索不同領域的教育工作者，也協助教師與專業人士媒合合適的教學機會。",
    highlights: [
      { title: "全球連結", items: ["覆蓋 120+ 國家的家教資源", "多語言介面與跨國支付結算"] },
      { title: "智能媒合", items: ["依位置與專長搜尋", "課程需求配對與推薦"] },
      { title: "安全交易", items: ["第三方支付保障", "身份驗證與評價機制"] },
    ],
    challenges: [
      { title: "全球化支付", problem: "需處理不同國家的貨幣與支付方式。", solution: "整合 Stripe 國際支付，支援多幣別換算與結算。" },
      { title: "即時通訊", problem: "跨國訊息需兼顧延遲與穩定性。", solution: "以 WebSocket 搭配 Redis 建立低延遲聊天服務。" },
      { title: "資料規模", problem: "用戶成長後，查詢與資料處理壓力提高。", solution: "導入讀寫分離、快取策略與資料庫優化。" },
    ],
    outcomes: ["支援多語言與跨國交易流程", "建立可擴展的媒合與即時溝通架構", "優化從搜尋到預約的使用者旅程"],
  },
  {
    slug: "circle-we-life",
    title: "Circle We Life 健康生活平台",
    category: "網站開發",
    summary: "整合健康產品、課程資訊與社群支持的生活平台。",
    image: "/images/portfolio/circle-we-life.png",
    technologies: ["PHP", "MySQL", "JavaScript", "Responsive Design", "SEO"],
    website: "https://circlewelife.com",
    overview:
      "專注於健康、生活品質與心靈成長的整合平台，將產品銷售、課程活動與社群資源放在一致的使用體驗中。",
    highlights: [
      { title: "整合服務", items: ["健康產品展示與銷售", "課程、工作坊與報名資訊"] },
      { title: "社群支持", items: ["健康知識資源分享", "用戶交流與專家諮詢入口"] },
      { title: "穩定體驗", items: ["跨裝置響應式介面", "會員與訂單流程整合"] },
    ],
    challenges: [
      { title: "多元功能", problem: "電商、課程與社群功能有不同的資料與操作需求。", solution: "採用模組化設計，讓功能獨立演進並維持一致資料流。" },
      { title: "安全與效能", problem: "平台處理會員資料及交易，需兼顧安全與載入效率。", solution: "強化資料保護，並優化資料庫查詢與頁面載入流程。" },
    ],
    outcomes: ["提供完整的健康生活服務入口", "建立一致的會員、訂單與活動體驗", "兼顧內容曝光與 SEO 基礎"],
  },
  {
    slug: "i80-website",
    title: "i80.com.tw 購物網站平台",
    category: "電子商務",
    summary: "以流暢購物體驗與高效交易流程為重點的電商平台。",
    image: "/images/portfolio/i80-website.png",
    technologies: ["React", "Node.js", "MongoDB", "Redis", "AWS", "Stripe"],
    website: "https://www.i80.com.tw/",
    overview:
      "現代化電商購物平台，聚焦於商品探索、結帳轉換與後台營運效率，讓消費者能快速找到並購買需要的商品。",
    highlights: [
      { title: "購物體驗", items: ["商品搜尋與推薦", "購物車及結帳流程優化"] },
      { title: "營運管理", items: ["商品、庫存及訂單管理", "物流與客戶關係整合"] },
      { title: "交易安全", items: ["多元支付方式", "退款與爭議處理流程"] },
    ],
    challenges: [
      { title: "流量高峰", problem: "促銷期間會出現突發流量。", solution: "採用彈性擴展與 CDN 分發，並優化快取與資料庫查詢。" },
      { title: "個人化推薦", problem: "需讓推薦結果貼近使用者需求。", solution: "結合使用行為資料與內容特徵，建構推薦邏輯。" },
      { title: "第三方整合", problem: "支付與服務供應商的串接需求多元。", solution: "以模組化整合架構降低服務間耦合。" },
    ],
    outcomes: ["優化商品探索與結帳路徑", "讓核心交易與營運流程更易維護", "建立能因應成長的電商服務架構"],
  },
];

export const getPortfolioProject = (slug: string) =>
  portfolioProjects.find((project) => project.slug === slug);
