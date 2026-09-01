import { useState, useEffect } from 'react';
import { fetchOrders } from '@/lib/api';
import type { Order } from '@/types';
import { BarChart2, Users, Link2, Award } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AdminReferralsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders().then(data => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  const refMap = new Map<string, { code: string; count: number; totalValue: number }>();
  orders.forEach(o => {
    if (!o.referralCode) return;
    const code = o.referralCode;
    if (refMap.has(code)) {
      const r = refMap.get(code)!;
      r.count++;
      r.totalValue += o.totalAmount || 0;
    } else {
      refMap.set(code, { code, count: 1, totalValue: o.totalAmount || 0 });
    }
  });
  const referrals = Array.from(refMap.values()).sort((a, b) => b.count - a.count);
  const totalPoints = referrals.reduce((s, r) => s + r.count * 100 + Math.floor(r.totalValue / 10), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">الإحالات والنقاط</h1>
        <p className="text-sm text-gray-400">نظام الإحالات — المرحلة الثانية</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'روابط إحالة', value: referrals.length, Icon: Link2, color: 'text-blue-400', bg: 'bg-blue-900/30' },
          { label: 'إحالات ناجحة', value: orders.filter(o => o.referralCode).length, Icon: Users, color: 'text-green-400', bg: 'bg-green-900/30' },
          { label: 'إجمالي النقاط', value: totalPoints, Icon: Award, color: 'text-amber-400', bg: 'bg-amber-900/30' },
          { label: 'قيمة الطلبات', value: `${orders.filter(o => o.referralCode).reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()} د.ل`, Icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-900/30' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-gray-800 rounded-xl border border-gray-700/50 p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
      {referrals.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <Link2 size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">لا توجد إحالات بعد</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">كود الإحالة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">عدد الطلبات</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">قيمة الطلبات</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">النقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {referrals.map(r => (
                <tr key={r.code} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3"><span className="text-sm text-amber-400 font-mono">{r.code}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-gray-300">{r.count}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-green-400">{r.totalValue.toLocaleString()} د.ل</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-purple-400">{r.count * 100 + Math.floor(r.totalValue / 10)} نقطة</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="bg-gray-800 rounded-xl border border-amber-600/20 p-5">
        <p className="text-amber-400 text-sm font-medium mb-2">قادم قريباً — المرحلة الثانية</p>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• إنشاء روابط إحالة مخصصة لكل عميل</li>
          <li>• 100 نقطة لكل عميل جديد + 1 نقطة لكل 10 دنانير</li>
          <li>• صفحة محيل تفصيلية وتحويل نقاط لخصومات</li>
        </ul>
      </div>
    </div>
  );
}
