/**
 * API layer — all database & storage operations go through here.
 * Public reads use anon key; admin writes require authenticated session.
 */
import { supabase } from './supabase';
import type {
  Artwork, Service, Category, Order, Review, SiteSettings, BotSettings,
  MediaFile, Notification, ActivityLog,
} from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_BOT } from './defaults';

// ─── Helpers ───────────────────────────────────────────────────────────────

function log(label: string, error: unknown) {
  console.error(`[API] ${label}`, error);
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_archived', false)
    .order('sort_order', { ascending: true });
  if (error) { log('fetchCategories', error); return []; }
  return (data || []).map(rowToCategory);
}

export async function upsertCategory(cat: Category): Promise<void> {
  const { error } = await supabase.from('categories').upsert(categoryToRow(cat));
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

function rowToCategory(r: Record<string, unknown>): Category {
  return {
    id: r.id as string,
    label: r.label as string,
    color: (r.color as string) || '#D4722A',
    coverImage: (r.cover_image as string) || undefined,
    description: (r.description as string) || undefined,
    parentId: (r.parent_id as string) || undefined,
    isArchived: (r.is_archived as boolean) || false,
    sortOrder: (r.sort_order as number) || 0,
  };
}

function categoryToRow(c: Category): Record<string, unknown> {
  return {
    id: c.id,
    label: c.label,
    color: c.color,
    cover_image: c.coverImage,
    description: c.description,
    parent_id: c.parentId,
    is_archived: c.isArchived || false,
    sort_order: c.sortOrder || 0,
  };
}

// ─── Artworks ──────────────────────────────────────────────────────────────

export async function fetchArtworks(opts?: { archivedOnly?: boolean }): Promise<Artwork[]> {
  let q = supabase.from('artworks').select('*').order('created_at', { ascending: false });
  if (opts?.archivedOnly) q = q.eq('is_archived', true);
  const { data, error } = await q;
  if (error) { log('fetchArtworks', error); return []; }
  return (data || []).map(rowToArtwork);
}

export async function upsertArtwork(artwork: Artwork): Promise<void> {
  const { error } = await supabase.from('artworks').upsert(artworkToRow(artwork));
  if (error) throw error;
}

export async function deleteArtwork(id: string): Promise<void> {
  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadArtworkImage(file: File, folder = 'artworks'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('artworks').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('artworks').getPublicUrl(path);
  return data.publicUrl;
}

export async function deletStorageFile(bucket: string, url: string): Promise<void> {
  const path = url.split(`/${bucket}/`)[1];
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

function rowToArtwork(r: Record<string, unknown>): Artwork {
  return {
    id: r.id as string,
    title: r.title as string,
    category: (r.category as string) || 'painting',
    description: (r.description as string) || undefined,
    dimensions: (r.dimensions as string) || undefined,
    technique: (r.technique as string) || undefined,
    price: r.price ? Number(r.price) : undefined,
    isPriceOnRequest: (r.is_price_on_request as boolean) || false,
    images: (r.images as string[]) || [],
    isArchived: (r.is_archived as boolean) || false,
    isFeatured: (r.is_featured as boolean) || false,
    dateAdded: (r.created_at as string) || new Date().toISOString(),
  };
}

function artworkToRow(a: Artwork): Record<string, unknown> {
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    description: a.description,
    dimensions: a.dimensions,
    technique: a.technique,
    price: a.price,
    is_price_on_request: a.isPriceOnRequest || false,
    images: a.images,
    is_archived: a.isArchived || false,
    is_featured: a.isFeatured || false,
    updated_at: new Date().toISOString(),
  };
}

// ─── Services ──────────────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { log('fetchServices', error); return []; }
  return (data || []).map(rowToService);
}

export async function upsertService(svc: Service): Promise<void> {
  const { error } = await supabase.from('services').upsert(serviceToRow(svc));
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

function rowToService(r: Record<string, unknown>): Service {
  const details: string[] = [];
  const fullDesc = (r.full_description as string) || '';
  fullDesc.split('\n').filter(Boolean).forEach(l => details.push(l));
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.short_description as string) || '',
    details,
    duration: (r.duration as string) || '',
    priceRange: 'حسب الطلب',
    category: (r.category || 'photography') as Service['category'],
    coverImage: (r.images as string[])?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    requiresDeposit: true,
    isArchived: (r.is_archived as boolean) || false,
    images: (r.images as string[]) || [],
    depositNote: (r.deposit_note as string) || undefined,
  };
}

function serviceToRow(s: Service): Record<string, unknown> {
  return {
    id: s.id,
    title: s.title,
    short_description: s.description,
    full_description: s.details?.join('\n'),
    duration: s.duration,
    deposit_note: (s as Record<string, unknown>).depositNote as string,
    images: (s as Record<string, unknown>).images as string[] || (s.coverImage ? [s.coverImage] : []),
    is_archived: s.isArchived || false,
    updated_at: new Date().toISOString(),
  };
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { log('fetchOrders', error); return []; }
  return (data || []).map(rowToOrder);
}

export async function insertOrder(order: Order): Promise<void> {
  const { error } = await supabase.from('orders').insert(orderToRow(order));
  if (error) throw error;
  // Trigger internal notification
  await addNotification({
    type: 'order',
    title: 'طلب جديد',
    message: `${order.customerName} — ${order.artworkTitle || order.serviceTitle || ''}`,
    link: '/admin/orders',
  });
  await logActivity(`طلب جديد: ${order.orderNumber}`, `من ${order.customerName}`);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { data: existing } = await supabase.from('orders').select('status_history').eq('id', id).single();
  const history = (existing?.status_history as Order['statusHistory']) || [];
  history.push({ status, date: new Date().toISOString() });
  const { error } = await supabase.from('orders').update({
    status,
    status_history: history,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function generateOrderNumber(): Promise<string> {
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const num = (count || 0) + 1;
  return `ORD-${String(num).padStart(4, '0')}`;
}

function rowToOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    orderNumber: r.order_number as string,
    type: r.type as Order['type'],
    artworkId: (r.artwork_id as string) || undefined,
    artworkTitle: (r.artwork_title as string) || undefined,
    serviceId: (r.service_id as string) || undefined,
    serviceTitle: (r.service_title as string) || undefined,
    category: (r.service_category as string) || undefined,
    description: (r.description as string) || undefined,
    customerName: r.customer_name as string,
    customerPhone: r.customer_phone as string,
    deliveryMethod: (r.delivery_method as Order['deliveryMethod']) || 'pickup',
    address: (r.address as string) || undefined,
    referralCode: (r.referral_code as string) || undefined,
    notes: (r.notes as string) || undefined,
    status: r.status as Order['status'],
    dateCreated: r.created_at as string,
    totalAmount: r.total_amount ? Number(r.total_amount) : undefined,
    statusHistory: (r.status_history as Order['statusHistory']) || [],
  };
}

function orderToRow(o: Order): Record<string, unknown> {
  return {
    id: o.id,
    order_number: o.orderNumber,
    type: o.type,
    artwork_id: o.artworkId,
    artwork_title: o.artworkTitle,
    service_id: o.serviceId,
    service_title: o.serviceTitle,
    service_category: o.category,
    description: o.description,
    delivery_method: o.deliveryMethod,
    address: o.address,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    referral_code: o.referralCode,
    notes: o.notes,
    total_amount: o.totalAmount,
    status: o.status,
    status_history: o.statusHistory || [],
  };
}

// ─── Reviews ───────────────────────────────────────────────────────────────

export async function fetchReviews(publishedOnly = false): Promise<Review[]> {
  let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (publishedOnly) q = q.eq('status', 'published');
  const { data, error } = await q;
  if (error) { log('fetchReviews', error); return []; }
  return (data || []).map(rowToReview);
}

export async function insertReview(review: Review): Promise<void> {
  const { error } = await supabase.from('reviews').insert(reviewToRow(review));
  if (error) throw error;
}

export async function updateReviewStatus(id: string, status: Review['status'], reply?: string): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (reply) updates.reply = reply;
  const { error } = await supabase.from('reviews').update(updates).eq('id', id);
  if (error) throw error;
  await logActivity(`تقييم ${status === 'published' ? 'نُشر' : 'رُفض'}`, id);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

function rowToReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    customerName: r.customer_name as string,
    rating: Number(r.rating),
    comment: r.comment as string,
    image: (r.image_url as string) || undefined,
    status: r.status as Review['status'],
    reply: (r.reply as string) || undefined,
    dateCreated: r.created_at as string,
  };
}

function reviewToRow(r: Review): Record<string, unknown> {
  return {
    id: r.id,
    customer_name: r.customerName,
    rating: r.rating,
    comment: r.comment,
    image_url: r.image || undefined,
    status: r.status,
    reply: r.reply || undefined,
  };
}

// ─── Site Settings ─────────────────────────────────────────────────────────

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('data').eq('id', 1).single();
  if (error || !data) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(data.data as Partial<SiteSettings>) };
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const current = await fetchSiteSettings();
  const merged = { ...current, ...settings };
  const { error } = await supabase.from('site_settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() });
  if (error) throw error;
  await logActivity('إعدادات', 'تم تعديل إعدادات الموقع');
}

// ─── Bot Settings ──────────────────────────────────────────────────────────

export async function fetchBotSettings(): Promise<BotSettings> {
  const { data, error } = await supabase.from('bot_settings').select('data').eq('id', 1).single();
  if (error || !data) return { ...DEFAULT_BOT };
  return { ...DEFAULT_BOT, ...(data.data as Partial<BotSettings>) };
}

export async function saveBotSettings(settings: Partial<BotSettings>): Promise<void> {
  const current = await fetchBotSettings();
  const merged = { ...current, ...settings };
  const { error } = await supabase.from('bot_settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── Profile Image Upload ──────────────────────────────────────────────────

export async function uploadSiteAsset(file: File, folder = 'profile'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Media Library ─────────────────────────────────────────────────────────

export async function fetchMedia(): Promise<MediaFile[]> {
  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { log('fetchMedia', error); return []; }
  return (data || []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    url: r.url as string,
    folder: (r.folder as string) || 'general',
    dateAdded: r.created_at as string,
    size: r.size ? Number(r.size) : undefined,
  }));
}

export async function saveMediaFile(file: MediaFile & { bucketPath: string }): Promise<void> {
  const { error } = await supabase.from('media_files').insert({
    id: file.id,
    name: file.name,
    url: file.url,
    bucket_path: file.bucketPath,
    folder: file.folder,
    size: file.size,
  });
  if (error) throw error;
}

export async function deleteMediaFile(id: string, bucketPath: string): Promise<void> {
  await supabase.storage.from('artworks').remove([bucketPath]);
  const { error } = await supabase.from('media_files').delete().eq('id', id);
  if (error) throw error;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { log('fetchNotifications', error); return []; }
  return (data || []).map(r => ({
    id: r.id as string,
    type: r.type as Notification['type'],
    title: r.title as string,
    message: r.message as string,
    isRead: r.is_read as boolean,
    dateCreated: r.created_at as string,
    link: (r.link as string) || undefined,
  }));
}

export async function addNotification(n: Omit<Notification, 'id' | 'isRead' | 'dateCreated'>): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    id: Date.now().toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    is_read: false,
  });
  if (error) log('addNotification', error);
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
  return count || 0;
}

// ─── Activity Log ──────────────────────────────────────────────────────────

export async function fetchActivityLog(): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) { log('fetchActivityLog', error); return []; }
  return (data || []).map(r => ({
    id: r.id as string,
    action: r.action as string,
    details: r.details as string,
    date: r.created_at as string,
  }));
}

export async function logActivity(action: string, details: string): Promise<void> {
  await supabase.from('activity_logs').insert({
    id: Date.now().toString() + Math.random(),
    action,
    details,
  });
}

// ─── Visit Counter (localStorage — fine for analytics) ───────────────────

export function incrementVisit(): void {
  const n = parseInt(localStorage.getItem('hasnawi_visits') || '0') + 1;
  localStorage.setItem('hasnawi_visits', String(n));
}
export function getVisitCount(): number {
  return parseInt(localStorage.getItem('hasnawi_visits') || '0');
}

// ─── Theme ─────────────────────────────────────────────────────────────────

export function getTheme(): 'dark' | 'light' {
  return (localStorage.getItem('hasnawi_theme') as 'dark' | 'light') || 'dark';
}
export function setTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem('hasnawi_theme', theme);
}

// ─── Export ────────────────────────────────────────────────────────────────

export async function exportData(): Promise<string> {
  const [orders, reviews, settings, artworks, services] = await Promise.all([
    fetchOrders(), fetchReviews(), fetchSiteSettings(), fetchArtworks(), fetchServices(),
  ]);
  return JSON.stringify({ orders, reviews, settings, artworks, services, exportDate: new Date().toISOString() }, null, 2);
}
