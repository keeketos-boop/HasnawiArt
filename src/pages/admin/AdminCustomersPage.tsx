import { useState } from 'react';
import { getOrders } from '@/lib/storage';
import { Search, User } from 'lucide-react';

export default function AdminCustomersPage() {
  const orders = getOrders();
  const [search, setSearch] = useState('');

  // Build customer list from orders
  const customerMap = new Map<string, { name: string; phone: string; orderCount: number; totalAmount: number; lastOrder: string }>();
  orders.forEach(order => {
    const key = order.customerPhone;
    if (customerMap.has(key)) {
      const c = customerMap.get(key)!;
      c.orderCount++;
      c.totalAmount += order.totalAmount || 0;
      if (order.dateCreated > c.lastOrder) c.lastOrder = order.dateCreated;
    } else {
      customerMap.set(key, {
        name: order.customerName,
        phone: order.customerPhone,
        orderCount: 1,
        totalAmount: order.totalAmount || 0,
        lastOrder: order.dateCreated,
      });
    }
  });

  const customers = Array.from(customerMap.values())
    .filter(c => !search || c.name.includes(search) || c.phone.includes(search))
    .sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime());

  const customerOrders = (phone: string) => orders.filter(o => o.customerPhone === phone);

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">العملاء</h1>
        <p className="text-sm text-gray-400">{customers.length} عميل</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-8 pl-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
      </div>

      {customers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <User size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">لا توجد بيانات عملاء بعد</p>
          <p className="text-gray-600 text-xs mt-1">ستظهر بيانات العملاء بعد استلام أول طلب</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">العميل</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">الطلبات</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">الإجمالي</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">آخر طلب</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {customers.map(c => (
                <tr key={c.phone} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 text-sm font-semibold flex-shrink-0">{c.name[0]}</div>
                      <div>
                        <p className="text-sm text-gray-200 font-medium">{c.name}</p>
                        <p className="text-xs text-gray-500" dir="ltr">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-gray-300">{c.orderCount}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-amber-400">{c.totalAmount > 0 ? `${c.totalAmount.toLocaleString()} د.ل` : '—'}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{new Date(c.lastOrder).toLocaleDateString('ar-LY')}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelectedPhone(c.phone)} className="px-2 py-1 rounded-lg bg-gray-700 text-gray-400 hover:text-gray-200 text-xs transition-colors">الملف</button>
                      <a href={`https://wa.me/${c.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 text-xs transition-colors">واتساب</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Profile Modal */}
      {selectedPhone && (() => {
        const c = customerMap.get(selectedPhone);
        if (!c) return null;
        const cOrders = customerOrders(selectedPhone);
        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhone(null)}>
            <div className="bg-gray-800 rounded-2xl p-5 max-w-md w-full border border-gray-700 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 text-xl font-bold">{c.name[0]}</div>
                <div>
                  <h3 className="text-gray-100 font-semibold">{c.name}</h3>
                  <p className="text-gray-400 text-sm" dir="ltr">{c.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-lg font-bold text-amber-400">{c.orderCount}</p><p className="text-xs text-gray-500">طلبات</p></div>
                <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-lg font-bold text-green-400">{c.totalAmount > 0 ? c.totalAmount.toLocaleString() : '—'}</p><p className="text-xs text-gray-500">إجمالي</p></div>
                <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-lg font-bold text-blue-400">{new Date(c.lastOrder).toLocaleDateString('ar-LY', { month: 'short', day: 'numeric' })}</p><p className="text-xs text-gray-500">آخر طلب</p></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">سجل الطلبات</p>
                <div className="space-y-2">
                  {cOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 text-xs">
                      <div><p className="text-amber-400 font-mono">{o.orderNumber}</p><p className="text-gray-500 truncate max-w-[180px]">{o.artworkTitle || o.serviceTitle}</p></div>
                      <span className="text-gray-400">{new Date(o.dateCreated).toLocaleDateString('ar-LY')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${c.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium text-center">واتساب</a>
                <button onClick={() => setSelectedPhone(null)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-gray-300 text-sm">إغلاق</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
