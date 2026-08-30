import { useState, useEffect } from 'react';
import { fetchOrders } from '@/lib/api';
import type { Order } from '@/types';
import { Users, Loader2 } from 'lucide-react';

interface CustomerRecord {
  phone: string;
  name: string;
  orders: Order[];
  totalAmount: number;
  lastDate: string;
}

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders().then(data => { setOrders(data); setLoading(false); });
  }, []);

  // Build unique customers from orders
  const customerMap = new Map<string, CustomerRecord>();
  orders.forEach(o => {
    const key = o.customerPhone;
    if (customerMap.has(key)) {
      const c = customerMap.get(key)!;
      c.orders.push(o);
      c.totalAmount += o.totalAmount || 0;
      if (new Date(o.dateCreated) > new Date(c.lastDate)) c.lastDate = o.dateCreated;
    } else {
      customerMap.set(key, { phone: key, name: o.customerName, orders: [o], totalAmount: o.totalAmount || 0, lastDate: o.dateCreated });
    }
  });

  const customers = Array.from(customerMap.values()).filter(c =>
    !search || c.name.includes(search) || c.phone.includes(search)
  ).sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">العملاء</h1>
        <p className="text-sm text-gray-400">{customers.length} عميل فريد</p>
      </div>

      <div className="relative max-w-xs">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-4 pl-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
      </div>

      {customers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <Users size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">لا يوجد عملاء بعد</p>
          <p className="text-gray-600 text-xs mt-1">ستظهر بيانات العملاء هنا بعد إرسال الطلبات</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">العميل</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">عدد الطلبات</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">إجمالي المبالغ</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">آخر طلب</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">واتساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {customers.map(c => (
                <tr key={c.phone} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-400 font-semibold text-sm flex-shrink-0">{c.name[0]}</div>
                      <div>
                        <p className="text-sm text-gray-200">{c.name}</p>
                        <p className="text-xs text-gray-500" dir="ltr">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-gray-300">{c.orders.length}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-green-400">{c.totalAmount.toLocaleString()} د.ل</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{new Date(c.lastDate).toLocaleDateString('ar-LY')}</span></td>
                  <td className="px-4 py-3">
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${c.name}`)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1.5 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors">واتساب</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
