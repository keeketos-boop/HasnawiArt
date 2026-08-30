import type { SiteSettings, BotSettings } from '@/types';

export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: 'عبد العزيز الحسناوي',
  heroSubtitle: 'فنان وعدسة — غات، ليبيا',
  heroBio: 'أبدع في الخط العربي، التصوير الفوتوغرافي، الفن التشكيلي والتصميم. كل عمل يحمل روح الصحراء وعمق التراث الليبي.',
  heroBackground: '',
  heroCta1: 'استعرض الأعمال',
  heroCta2: 'اطلب خدمة مخصصة',
  statsWorks: '100+',
  statsYears: '5+',
  statsClients: '200+',
  whatsappNumber: '218910000000',
  instagramUrl: '',
  facebookUrl: '',
  emailAddress: '',
  artistName: 'عبد العزيز الحسناوي',
  artistTitle: 'فنان تشكيلي وعدسة — غات',
  artistShortBio: 'فنان ليبي من مدينة غات، أمزج بين الموروث التشكيلي الصحراوي وأدوات التعبير المعاصر.',
  artistFullBio: 'وُلدتُ وترعرعتُ في غات، المدينة التي علّمتني كيف تتحدث الصحراء بلغة الصمت والجمال.\nبدأتُ رحلتي الفنية بالخط العربي، ثم انفتحتُ على التصوير الفوتوغرافي والفن التشكيلي.\nأسلوبي يجمع بين الجذور الليبية العميقة والنفَس المعاصر.',
  artistPhoto: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=400&q=80',
  showHero: true,
  showStats: true,
  showTypesCards: true,
  showFeatured: true,
  showCategories: true,
  showAbout: true,
  showReviews: true,
  featuredWorkIds: [],
};

export const DEFAULT_BOT: BotSettings = {
  enabled: true,
  welcomeText: 'أهلاً وسهلاً! أنا المساعد الذكي. كيف يمكنني مساعدتك؟',
  delaySeconds: 4,
  whatsappNumber: '218910000000',
  questions: [
    { id: 'q1', label: 'أريد عملاً جاهزاً', answer: 'يمكنك استعراض الأعمال الجاهزة في المعرض.', action: 'gallery' },
    { id: 'q2', label: 'خدمة مخصصة', answer: 'نقدم خدمات متعددة، يمكنك الحجز من نموذج الطلب.', action: 'order' },
    { id: 'q3', label: 'الأسعار', answer: 'الأسعار تختلف حسب الخدمة. خط: 150-600 / بورتريه: 300-1000 / تصوير: 200-600', action: 'faq' },
    { id: 'q4', label: 'التواصل المباشر', answer: 'سأحولك لواتساب الآن.', action: 'whatsapp' },
  ],
};
