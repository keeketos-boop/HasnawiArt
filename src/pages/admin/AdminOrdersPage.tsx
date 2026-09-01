import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus, logActivity } from '@/lib/api';
import type { Order } from '@/types';
import { ExternalLink, Search, ChevronDown, X, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد', preparing: 'قيد التجهيز', ready: 'جاهز للتسليم',
  delivered: 'تم التسليم', completed: 'مكتمل', cancelled: 'ملغي',
  awaiting_deposit: 'بانتظار العربون', deposit_received: 'عربون مستلم',
  in_progress: 'قيد التنفيذ', on_hold: 'مؤجل', under_review: 'قيد المراجعة',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-900/50 text-blue-300', preparing: 'bg-yellow-900/50 text-yellow-300',
  ready: 'bg-purple-900/50 text-purple-300', delivered: 'bg-green-900/50 text-green-300',
  completed: 'bg-green-900/70 text-green-200', cancelled: 'bg-red-900/50 text-red-300',
  awaiting_deposit: 'bg-orange-900/50 text-orange-300', deposit_received: 'bg-teal-900/50 text-teal-300',
  in_progress: 'bg-indigo-900/50 text-indigo-300', on_hold: 'bg-gray-700 text-gray-400',
  under_review: 'bg-pink-900/50 text-pink-300',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortDesc, setSortDesc] = useState(true);

  const load = async () => {
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Poll every 30s for new orders
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = orders
    .filter(o => {
      const matchSearch = !search || o.customerName.includes(search) || o.customerPhone.includes(search) || o.orderNumber.includes(search);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchType = typeFilter === 'all' || o.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => sortDesc
      ? new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      : new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    );

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      await logActivity('تغيير حالة طلب', `${id} → ${status}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
      toast.success('تم تغيير الحالة ✓');
    } catch { toast.error('فشل تغيير الحالة'); }
  };

  const copyOrderSummary = (order: Order) => {
    const text = `طلب ${order.orderNumber}\nالعميل: ${order.customerName}\nالهاتف: ${order.customerPhone}\nالعمل: ${order.artworkTitle || order.serviceTitle}\nالحالة: ${STATUS_LABELS[order.status]}`;
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الطلبات</h1>
          <p className="text-sm text-gray-400">{filtered.length} طلب</p>
        </div>
        <button onClick={() => setSortDesc(!sortDesc)} className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 transition-colors">
          <ChevronDown size={14} className={sortDesc ? '' : 'rotate-180'} />{sortDesc ? 'الأحدث أولاً' : 'الأقدم أولاً'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="bg-gray-800 border border-gray-700 rounded-lg pr-8 pl-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 w-52" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
          <option value="all">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
          <option value="all">كل الأنواع</option>
          <option value="ready">عمل جاهز</option>
          <option value="service">خدمة</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <p className="text-gray-500 text-sm">لا توجد طلبات بعد</p>
          <p className="text-gray-600 text-xs mt-1">ستظهر الطلبات هنا بمجرد إرسالها من الموقع</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-right">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">الطلب</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">العميل</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">النوع</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">التاريخ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-3">
                      <p className="text-sm text-amber-400 font-mono">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{order.artworkTitle || order.serviceTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-200">{order.customerName}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{order.type === 'ready' ? 'عمل جاهز' : 'خدمة'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-400'}`}>{STATUS_LABELS[order.status] || order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{new Date(order.dateCreated).toLocaleDateString('ar-LY')}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${order.customerName}، بخصوص طلبك رقم ${order.orderNumber}`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400 hover:bg-green-900/50 transition-colors"><ExternalLink size={13} /></a>
                        <button onClick={() => copyOrderSummary(order)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"><Copy size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end" onClick={() => setSelectedOrder(null)}>
          <div className="h-full w-full max-w-md bg-gray-900 border-r border-gray-700/50 flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-700/50 flex-shrink-0">
              <div>
                <h3 className="text-gray-100 font-semibold">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-400">{new Date(selectedOrder.dateCreated).toLocaleString('ar-LY')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400"><X size={16} /></button>
            </div>
            <div className="flex-1 p-5 space-y-5">
              <div className="space-y-2">
                {[
                  { label: 'العميل', value: selectedOrder.customerName },
                  { label: 'الهاتف', value: selectedOrder.customerPhone },
                  { label: 'النوع', value: selectedOrder.type === 'ready' ? 'عمل جاهز' : 'خدمة مخصصة' },
                  { label: 'العمل/الخدمة', value: selectedOrder.artworkTitle || selectedOrder.serviceTitle || '—' },
                  { label: 'التسليم', value: selectedOrder.deliveryMethod === 'pickup' ? 'مباشر' : selectedOrder.deliveryMethod === 'shipping' ? 'شحن' : 'رقمي' },
                  ...(selectedOrder.address ? [{ label: 'العنوان', value: selectedOrder.address }] : []),
                  ...(selectedOrder.description ? [{ label: 'الوصف', value: selectedOrder.description }] : []),
                  ...(selectedOrder.referralCode ? [{ label: 'كود الإحالة', value: selectedOrder.referralCode }] : []),
                  ...(selectedOrder.totalAmount ? [{ label: 'المبلغ', value: `${selectedOrder.totalAmount.toLocaleString()} د.ل` }] : []),
                ].map(item => (
                  <div key={item.label} className="flex gap-3 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-gray-300 break-words">{item.value}</span>
                  </div>
                ))}
              </div>
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">سجل الحالات</p>
                  <div className="space-y-1.5">
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status] || 'bg-gray-700 text-gray-400'}`}>{STATUS_LABELS[h.status]}</span>
                        <span className="text-gray-500">{new Date(h.date).toLocaleString('ar-LY')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-2">تغيير الحالة</label>
                <div className="relative">
                  <select value={selectedOrder.status} onChange={e => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm appearance-none focus:outline-none focus:border-amber-500/60">
                    {Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-700/50 flex-shrink-0 space-y-2">
              <a href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${selectedOrder.customerName}، بخصوص طلبك رقم ${selectedOrder.orderNumber}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors">فتح واتساب</a>
              <button onClick={() => copyOrderSummary(selectedOrder)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:text-gray-100 transition-colors">نسخ ملخص الطلب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
