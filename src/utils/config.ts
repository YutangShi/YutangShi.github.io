export const SITE_CONFIG = {
  title: 'Allen | AI 自動化 SRE 實戰',
  description: '專注於 AI 自動化 SRE、可觀測性、雲端平台與高可靠系統的技術部落格',
  author: 'Allen 技術微光',
  email: 'yutangshi@gmail.com',
  phone: '',
  bio: '資深 SRE 與軟體工程師，長期投入雲端平台維運與自動化流程設計，專注於 Incident Response、Runbook Automation、Observability 與 AI Agent 在維運場景的落地應用。',
  avatar: '/avatar.jpg',
  locale: 'zh-TW',
  twitter: '@allenshi',
  originalBlog: 'https://allen-shi.blogspot.tw/',
  social: {
    github: 'https://github.com/YutangShi',
    twitter: 'https://twitter.com/allenshi',
    linkedin: 'https://www.linkedin.com/in/yutang-shi-4109ab31/',
    email: 'mailto:yutangshi@gmail.com',
    blog: 'https://allen-shi.blogspot.tw/',
    resume: 'https://www.cake.me/s--XY7iN0UK7EZ_FKGXxpNqnA--/allen-shi'
  },
  navigation: [
    { name: '首頁', href: '/' },
    { name: '部落格', href: '/blog' },
    { name: 'AI學習地圖', href: '/learning-path' },
    { name: '作品集', href: '/portfolio' },
    { name: '關於我', href: '/about' },
    { name: '聯絡我', href: '/contact' }
  ],
  seo: {
    defaultImage: '/og-image.svg',
    twitterHandle: '@allenshi'
  },
  analytics: {
    gaMeasurementId: 'G-03GPEXTHRD',
    gtmContainerId: 'GTM-WBN6TTLG'
  },
  defaultMeta: {
    title: 'Allen | AI 自動化 SRE 實戰',
    description: 'AI 自動化 SRE、可觀測性與雲端平台工程的實戰筆記',
    image: '/og-image.svg',
    type: 'website'
  }
} as const;

export const BLOG_CONFIG = {
  postsPerPage: 6,
  categories: ["AI", "自動化", "SRE", "N8N", "Mobile App"]
} as const;

export const PORTFOLIO_CONFIG = {
  categories: [
    '網站開發',
    'UI/UX 設計',
    '行動應用',
    '電商平台',
    '企業系統'
  ]
} as const;
