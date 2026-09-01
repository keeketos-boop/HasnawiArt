import { useState } from 'react';
import { adminLogout, exportData, getActivityLog } from '@/lib/storage';
import { Check, Download, Key, Bell, Shield, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'backup' | 'activity'>('account');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [notifSettings, setNotifSettings] = useState({ whatsapp: true, internal: true, sound: false });

  const activityLog = getActivityLog();

  const handleChangePw = () => {
    if (!currentPw || !newPw) { toast.error('جميع الحقول مطلوبة'); return; }
    if (newPw !== confirmPw) { toast.error('كلمتا المرور غير متطابقتين'); return; }
    if (newPw.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    // Save new password in settings
    const settings = JSON.parse(localStorage.getItem('hasnawi_settings') || '{}');
    settings.adminPassword = newPw;
    localStorage.setItem('hasnawi_settings', JSON.stringify(settings));
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success('تم تغيير كلمة المرور');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasnawi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل النسخة الاحتياطية');
  };

  const tabs = [
    { id: 'account' as const, label: 'الحساب', Icon: Key },
    { id: 'security' as const, label: 'الأمان', Icon: Shield },
    { id: 'notifications' as const, label: 'الإشعارات', Icon: Bell },
    { id: 'backup' as const, label: 'النسخ الاحتياطي', Icon: Download },
    { id: 'activity' as const, label: 'سجل النشاط', Icon: Clock },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">الإعدادات</h1>
        <p className="text-sm text-gray-400">إعدادات الحساب والأمان والنظام</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-gray-800 rounded-xl p-1 border border-gray-700/50">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${activeTab === id ? 'bg-amber-600 text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Account */}
      {activeTab === 'account' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">تغيير كلمة المرور</h2>
          <div className="max-w-sm space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">كلمة المرور الحالية</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 pr-10 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="••••••••" />
                <button onClick={() => setShowPw(!showPw)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">كلمة المرور الجديدة</label>
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">تأكيد كلمة المرور</label>
              <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="••••••••" />
            </div>
            <button onClick={handleChangePw} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
              <Check size={14} /> حفظ
            </button>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 mb-3">كلمة المرور الافتراضية: admin2024</p>
            <button onClick={() => { adminLogout(); window.location.reload(); }} className="px-4 py-2 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 text-sm transition-colors">
              تسجيل الخروج من جميع الأجهزة
            </button>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">إعدادات الأمان</h2>
          <div className="space-y-3">
            {[
              { label: 'التحقق بخطوتين (2FA)', desc: 'طبقة حماية إضافية — قادم قريباً', disabled: true },
              { label: 'CAPTCHA في نماذج الطلب', desc: 'حماية من الطلبات الآلية', disabled: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                <div>
                  <p className="text-sm text-gray-300">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button disabled={item.disabled} className={`px-3 py-1.5 rounded-lg text-xs ${item.disabled ? 'bg-gray-700/50 text-gray-600 cursor-not-allowed' : 'bg-green-900/40 text-green-400'}`}>
                  {item.disabled ? 'قريباً' : 'مفعّل'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">إعدادات الإشعارات</h2>
          <div className="space-y-3">
            {[
              { key: 'whatsapp' as const, label: 'إشعارات واتساب', desc: 'رسائل واتساب عند الطلبات والاستفسارات' },
              { key: 'internal' as const, label: 'الإشعارات الداخلية', desc: 'إشعارات داخل لوحة التحكم' },
              { key: 'sound' as const, label: 'التنبيهات الصوتية', desc: 'صوت عند وصول إشعار جديد' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                <div>
                  <p className="text-sm text-gray-300">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifSettings(n => ({ ...n, [item.key]: !n[item.key] }))}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${notifSettings[item.key] ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}`}
                >
                  {notifSettings[item.key] ? 'مفعّل' : 'معطّل'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup */}
      {activeTab === 'backup' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">النسخ الاحتياطي</h2>
          <p className="text-xs text-gray-400">قم بتنزيل نسخة من جميع بياناتك (طلبات، تقييمات، أعمال، إعدادات) بصيغة JSON</p>
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
            <Download size={16} /> تنزيل نسخة احتياطية
          </button>
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
            <p className="text-xs text-gray-400">آخر نسخة: {new Date().toLocaleDateString('ar-LY')}</p>
          </div>
        </div>
      )}

      {/* Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">سجل النشاط</h2>
          {activityLog.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">لا يوجد نشاط مسجّل</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLog.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 font-medium">{log.action}</p>
                    <p className="text-xs text-gray-500 truncate">{log.details}</p>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">{new Date(log.date).toLocaleString('ar-LY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
