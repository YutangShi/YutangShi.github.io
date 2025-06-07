export const SITE_CONFIG = {
  title: 'Allen - Senior SRE & 軟體工程師',
  description: '多年專業經驗的資深工程師，專精於 SRE、雲端架構、全端開發與 AI 技術研究',
  author: 'Allen 技術微光',
  email: 'yutangshi@gmail.com',
  bio: '專精於雲端架構、DevOps、全端開發。曾開發 POS、進銷存、購物網站、企業 APP 等系統，並透過 AWS/Azure 建置與維護 Infra。個性易於相處與合作，做事細心，樂於學習新技術與分享新知。',
  avatar: '/avatar.jpg',
  locale: 'zh-TW',
  twitter: '@allenshi',
  originalBlog: 'https://allen-shi.blogspot.tw/',
  social: {
    github: 'https://github.com/YutangShi',
    twitter: 'https://twitter.com/allenshi',
    linkedin: 'https://linkedin.com/in/allenshi',
    email: 'mailto:yutangshi@gmail.com',
    blog: 'https://allen-shi.blogspot.tw/',
    resume: 'https://www.cake.me/s--XY7iN0UK7EZ_FKGXxpNqnA--/allen-shi'
  },
  navigation: [
    { name: '首頁', href: '/' },
    { name: '部落格', href: '/blog' },
    { name: '作品集', href: '/portfolio' },
    { name: '關於我', href: '/about' },
    { name: '聯絡我', href: '/contact' },
    { name: '服務項目', href: '/services' }
  ],
  seo: {
    defaultImage: '/og-image.svg',
    twitterHandle: '@allenshi'
  },
  defaultMeta: {
    title: 'Allen Shi - Senior SRE & 軟體工程師',
    description: '專業經驗的資深工程師，專精於 SRE、雲端架構、全端開發與 AI 技術研究',
    image: '/og-image.svg',
    type: 'website'
  }
} as const;

export const BLOG_CONFIG = {
  postsPerPage: 6,
  categories: [
    'SRE',
    '雲端架構',
    'DevOps',
    '移動開發',
    '後端開發',
    '前端開發',
    'AI 技術',
    '監控運維',
    'Infra',
    'AWS/Azure',
    'Docker/K8s',
    '程式語言',
    '專案心得',
    '學習筆記'
  ]
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

export const SERVICES_CONFIG = {
  categories: [
    'SRE 服務',
    '雲端架構設計',
    'DevOps 導入',
    '系統監控優化',
    '行動應用開發',
    '全端開發',
    'AI 應用技術諮詢',
    'Infra 建置維護',
    '技術顧問',
    '系統維運'
  ]
} as const; 