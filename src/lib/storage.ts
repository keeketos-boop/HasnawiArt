/**
 * Compatibility re-exports — keeps old imports working while we migrate to api.ts
 * All functions now delegate to api.ts (Supabase) instead of localStorage.
 */
export {
  fetchCategories as getStoredCategories,
  fetchArtworks as getStoredArtworks,
  fetchServices as getStoredServices,
  fetchOrders as getOrders,
  fetchReviews as getReviews,
  fetchSiteSettings as getSiteSettings,
  fetchBotSettings as getBotSettings,
  fetchNotifications as getNotifications,
  fetchActivityLog as getActivityLog,
  fetchMedia as getMedia,
  insertOrder as saveOrder,
  upsertArtwork as saveArtwork,
  deleteArtwork,
  upsertService as saveService,
  deleteService,
  upsertCategory as saveCategory,
  deleteCategory,
  saveMediaFile,
  deleteMediaFile,
  insertReview as saveReview,
  updateReviewStatus,
  deleteReview,
  saveSiteSettings,
  saveBotSettings,
  updateOrderStatus,
  generateOrderNumber,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  logActivity as addActivityLog,
  exportData,
  getTheme,
  setTheme,
  incrementVisit,
  getVisitCount,
  adminSignIn,
  adminSignOut,
  getAdminSession,
} from './api';

// These are kept as stubs for older callers that still do adminLogin(password)
export function isAdminLoggedIn(): boolean {
  // Will be replaced by session check — kept for legacy compatibility
  return false;
}

export function adminLogin(_password: string): boolean {
  // Legacy stub — callers should use adminSignIn from api.ts directly
  return false;
}

export function adminLogout(): void {
  import('./api').then(m => m.adminSignOut());
}
