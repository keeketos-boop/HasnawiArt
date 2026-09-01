import { Order, Review, SiteSettings, BotSettings, MediaFile, Notification, ActivityLog, Artwork, Service, Category } from '@/types';

const ORDERS_KEY = 'hasnawi_orders';
const REVIEWS_KEY = 'hasnawi_reviews';
const THEME_KEY = 'hasnawi_theme';
const ADMIN_SESSION_KEY = 'hasnawi_admin';
const VISIT_KEY = 'hasnawi_visits';
const SETTINGS_KEY = 'hasnawi_settings';
const BOT_SETTINGS_KEY = 'hasnawi_bot';
const MEDIA_KEY = 'hasnawi_media';
const NOTIFICATIONS_KEY = 'hasnawi_notifications';
const ACTIVITY_KEY = 'hasnawi_activity';
const ARTWORKS_KEY = 'hasnawi_artworks';
const SERVICES_KEY = 'hasnawi_services';
const CATEGORIES_KEY = 'hasnawi_categories';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Orders
export function getOrders(): Order[] { return safeGet<Order[]>(ORDERS_KEY, []); }
export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  safeSet(ORDERS_KEY, orders);
  addNotification({ type: 'order', title: 'طلب جديد', message: `${order.customerName} — ${order.artworkTitle || order.serviceTitle}`, link: '/admin/orders' });
  addActivityLog(`طلب جديد: ${order.orderNumber}`, `من ${order.customerName}`);
}
export function updateOrderStatus(id: string, status: Order['status']): void {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    const prev = orders[idx].status;
    orders[idx].status = status;
    if (!orders[idx].statusHistory) orders[idx].statusHistory = [];
    orders[idx].statusHistory!.push({ status, date: new Date().toISOString() });
    safeSet(ORDERS_KEY, orders);
    addActivityLog(`تغيير حالة طلب`, `${orders[idx].orderNumber}: ${prev} → ${status}`);
  }
}
export function generateOrderNumber(): string {
  const orders = getOrders();
  const num = orders.length + 1;
  return `ORD-${String(num).padStart(4, '0')}`;
}

// Reviews
export function getReviews(): Review[] { return safeGet<Review[]>(REVIEWS_KEY, []); }
export function saveReview(review: Review): void {
  const reviews = getReviews();
  reviews.unshift(review);
  safeSet(REVIEWS_KEY, reviews);
  addNotification({ type: 'review', title: 'تقييم جديد', message: `${review.customerName} — ${review.rating} نجوم`, link: '/admin/reviews' });
}
export function updateReviewStatus(id: string, status: Review['status'], reply?: string): void {
  const reviews = getReviews();
  const idx = reviews.findIndex(r => r.id === id);
  if (idx !== -1) {
    reviews[idx].status = status;
    if (reply) reviews[idx].reply = reply;
    safeSet(REVIEWS_KEY, reviews);
    addActivityLog(`تقييم ${status === 'published' ? 'نُشر' : 'رُفض'}`, reviews[idx].customerName);
  }
}
export function deleteReview(id: string): void {
  const reviews = getReviews().filter(r => r.id !== id);
  safeSet(REVIEWS_KEY, reviews);
}

// Artworks (custom, stored in localStorage to override defaults)
export function getStoredArtworks(): Artwork[] { return safeGet<Artwork[]>(ARTWORKS_KEY, []); }
export function saveArtwork(artwork: Artwork): void {
  const artworks = getStoredArtworks();
  const idx = artworks.findIndex(a => a.id === artwork.id);
  if (idx !== -1) { artworks[idx] = artwork; } else { artworks.unshift(artwork); }
  safeSet(ARTWORKS_KEY, artworks);
  addActivityLog('عمل فني', `${artwork.title} — ${artwork.isArchived ? 'أُرشف' : 'نُشر'}`);
}
export function deleteArtwork(id: string): void {
  const artworks = getStoredArtworks().filter(a => a.id !== id);
  safeSet(ARTWORKS_KEY, artworks);
}

// Services (custom)
export function getStoredServices(): Service[] { return safeGet<Service[]>(SERVICES_KEY, []); }
export function saveService(service: Service): void {
  const services = getStoredServices();
  const idx = services.findIndex(s => s.id === service.id);
  if (idx !== -1) { services[idx] = service; } else { services.unshift(service); }
  safeSet(SERVICES_KEY, services);
}
export function deleteService(id: string): void {
  const services = getStoredServices().filter(s => s.id !== id);
  safeSet(SERVICES_KEY, services);
}

// Categories (custom)
export function getStoredCategories(): Category[] { return safeGet<Category[]>(CATEGORIES_KEY, []); }
export function saveCategory(cat: Category): void {
  const cats = getStoredCategories();
  const idx = cats.findIndex(c => c.id === cat.id);
  if (idx !== -1) { cats[idx] = cat; } else { cats.push(cat); }
  safeSet(CATEGORIES_KEY, cats);
}
export function deleteCategory(id: string): void {
  const cats = getStoredCategories().filter(c => c.id !== id);
  safeSet(CATEGORIES_KEY, cats);
}

// Theme
export function getTheme(): 'dark' | 'light' { return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark'; }
export function setTheme(theme: 'dark' | 'light'): void { localStorage.setItem(THEME_KEY, theme); }

// Admin session
export function isAdminLoggedIn(): boolean { return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'; }
export function adminLogin(password: string): boolean {
  const settings = getSiteSettings();
  const pw = (settings as Record<string, unknown>).adminPassword as string || 'admin2024';
  if (password === pw) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    addActivityLog('تسجيل دخول', 'دخول ناجح للوحة التحكم');
    return true;
  }
  return false;
}
export function adminLogout(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  addActivityLog('تسجيل خروج', 'خروج من لوحة التحكم');
}

// Visits
export function incrementVisit(): void {
  const count = parseInt(localStorage.getItem(VISIT_KEY) || '0') + 1;
  localStorage.setItem(VISIT_KEY, String(count));
}
export function getVisitCount(): number { return parseInt(localStorage.getItem(VISIT_KEY) || '0'); }

// Site Settings
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
  artistFullBio: 'وُلدتُ وترعرعتُ في غات، المدينة التي علّمتني كيف تتحدث الصحراء بلغة الصمت والجمال. بدأتُ رحلتي الفنية بالخط العربي، ثم انفتحتُ على التصوير الفوتوغرافي والفن التشكيلي. أسلوبي يجمع بين الجذور الليبية العميقة والنفَس المعاصر.',
  artistPhoto: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=400&q=80',
  showHero: true,
  showStats: true,
  showTypesCards: true,
  showFeatured: true,
  showCategories: true,
  showAbout: true,
  showReviews: true,
  featuredWorkIds: ['aw-001', 'aw-002', 'aw-005', 'aw-006'],
};
export function getSiteSettings(): SiteSettings {
  return { ...DEFAULT_SETTINGS, ...safeGet<Partial<SiteSettings>>(SETTINGS_KEY, {}) };
}
export function saveSiteSettings(settings: Partial<SiteSettings>): void {
  const current = getSiteSettings();
  safeSet(SETTINGS_KEY, { ...current, ...settings });
  addActivityLog('إعدادات', 'تم تعديل إعدادات الموقع');
}

// Bot Settings
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
export function getBotSettings(): BotSettings { return { ...DEFAULT_BOT, ...safeGet<Partial<BotSettings>>(BOT_SETTINGS_KEY, {}) }; }
export function saveBotSettings(settings: Partial<BotSettings>): void {
  const current = getBotSettings();
  safeSet(BOT_SETTINGS_KEY, { ...current, ...settings });
}

// Media
export function getMedia(): MediaFile[] { return safeGet<MediaFile[]>(MEDIA_KEY, []); }
export function saveMedia(file: MediaFile): void {
  const media = getMedia();
  media.unshift(file);
  safeSet(MEDIA_KEY, media);
}
export function deleteMedia(id: string): void {
  const media = getMedia().filter(m => m.id !== id);
  safeSet(MEDIA_KEY, media);
}

// Notifications
export function getNotifications(): Notification[] { return safeGet<Notification[]>(NOTIFICATIONS_KEY, []); }
export function addNotification(n: Omit<Notification, 'id' | 'isRead' | 'dateCreated'>): void {
  const notifications = getNotifications();
  notifications.unshift({ ...n, id: Date.now().toString(), isRead: false, dateCreated: new Date().toISOString() });
  safeSet(NOTIFICATIONS_KEY, notifications.slice(0, 50));
}
export function markNotificationRead(id: string): void {
  const notifications = getNotifications().map(n => n.id === id ? { ...n, isRead: true } : n);
  safeSet(NOTIFICATIONS_KEY, notifications);
}
export function markAllNotificationsRead(): void {
  const notifications = getNotifications().map(n => ({ ...n, isRead: true }));
  safeSet(NOTIFICATIONS_KEY, notifications);
}
export function getUnreadCount(): number { return getNotifications().filter(n => !n.isRead).length; }

// Activity Log
export function getActivityLog(): ActivityLog[] { return safeGet<ActivityLog[]>(ACTIVITY_KEY, []); }
export function addActivityLog(action: string, details: string): void {
  const log = getActivityLog();
  log.unshift({ id: Date.now().toString(), action, details, date: new Date().toISOString() });
  safeSet(ACTIVITY_KEY, log.slice(0, 100));
}

// Export data
export function exportData(): string {
  return JSON.stringify({
    orders: getOrders(),
    reviews: getReviews(),
    settings: getSiteSettings(),
    artworks: getStoredArtworks(),
    services: getStoredServices(),
    exportDate: new Date().toISOString(),
  }, null, 2);
}
