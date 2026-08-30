import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '@/lib/api';
import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
  const [waNumber, setWaNumber] = useState('218910000000');

  useEffect(() => {
    fetchSiteSettings().then(s => setWaNumber(s.whatsappNumber || '218910000000'));
  }, []);

  return (
    <a
      href={`https://wa.me/${waNumber}?text=${encodeURIComponent('مرحباً، أودّ الاستفسار عن أعمالك الفنية.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-4 z-40 md:bottom-6 w-14 h-14 rounded-2xl bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white transition-all hover:scale-110"
      aria-label="تواصل عبر واتساب"
    >
      <MessageSquare size={24} />
    </a>
  );
}
