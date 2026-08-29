export type ArtCategory = 'all' | 'calligraphy' | 'painting' | 'photography' | 'design' | 'portrait';

export type ArtTab = 'ready' | 'services';

export interface Artwork {
  id: string;
  title: string;
  category: ArtCategory;
  description?: string;
  dimensions?: string;
  technique?: string;
  price?: number;
  isPriceOnRequest?: boolean;
  images: string[];
  isSold?: boolean;
  isArchived?: boolean;
  isFeatured?: boolean;
  dateAdded: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  details: string[];
  duration: string;
  priceRange: string;
  category: ArtCategory;
  coverImage: string;
  requiresDeposit: boolean;
  isArchived?: boolean;
}

export type OrderType = 'ready' | 'service';
export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'awaiting_deposit'
  | 'deposit_received'
  | 'in_progress'
  | 'on_hold'
  | 'under_review';

export type DeliveryMethod = 'pickup' | 'shipping' | 'digital';

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  artworkId?: string;
  artworkTitle?: string;
  serviceId?: string;
  serviceTitle?: string;
  category?: string;
  description?: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  referralCode?: string;
  notes?: string;
  status: OrderStatus;
  dateCreated: string;
  totalAmount?: number;
  statusHistory?: { status: OrderStatus; date: string }[];
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  image?: string;
  status: 'pending' | 'published' | 'rejected';
  reply?: string;
  dateCreated: string;
  orderId?: string;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  coverImage?: string;
  description?: string;
  parentId?: string;
  isArchived?: boolean;
  sortOrder?: number;
}

export interface AdminStats {
  totalOrders: number;
  newOrders: number;
  publishedWorks: number;
  totalVisits: number;
  pendingReviews: number;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBio: string;
  heroBackground: string;
  heroCta1: string;
  heroCta2: string;
  statsWorks: string;
  statsYears: string;
  statsClients: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  emailAddress: string;
  artistName: string;
  artistTitle: string;
  artistShortBio: string;
  artistFullBio: string;
  artistPhoto: string;
  showHero: boolean;
  showStats: boolean;
  showTypesCards: boolean;
  showFeatured: boolean;
  showCategories: boolean;
  showAbout: boolean;
  showReviews: boolean;
  featuredWorkIds: string[];
}

export interface BotSettings {
  enabled: boolean;
  welcomeText: string;
  delaySeconds: number;
  whatsappNumber: string;
  questions: { id: string; label: string; answer: string; action: string }[];
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  folder: string;
  dateAdded: string;
  size?: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'review' | 'inquiry' | 'backup' | 'security';
  title: string;
  message: string;
  isRead: boolean;
  dateCreated: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  date: string;
}
