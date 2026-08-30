import { useState, useEffect } from 'react';
import { fetchBotSettings } from '@/lib/api';
import type { BotSettings } from '@/types';
import { X, MessageSquare, Send } from 'lucide-react';
import tuaregSeal from '@/assets/tuareg-seal.png';
import { DEFAULT_BOT } from '@/lib/defaults';
import { useNavigate } from 'react-router-dom';

export default function AssistantBot() {
  const [botSettings, setBotSettings] = useState<BotSettings>(DEFAULT_BOT);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  const [shown, setShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBotSettings().then(s => {
      setBotSettings(s);
      if (s.enabled) {
        setTimeout(() => {
          if (!shown) {
            setMessages([{ from: 'bot', text: s.welcomeText }]);
            setShown(true);
          }
        }, (s.delaySeconds || 4) * 1000);
      }
    });
  }, []);

  if (!botSettings.enabled) return null;

  const handleQuestion = (q: BotSettings['questions'][0]) => {
    setMessages(m => [...m, { from: 'user', text: q.label }, { from: 'bot', text: q.answer }]);
    if (q.action === 'gallery') { setTimeout(() => { navigate('/gallery'); setOpen(false); }, 800); }
    else if (q.action === 'order') { setTimeout(() => { navigate('/order'); setOpen(false); }, 800); }
    else if (q.action === 'faq') { setTimeout(() => { document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); }, 800); }
    else if (q.action === 'whatsapp') {
      setTimeout(() => {
        window.open(`https://wa.me/${botSettings.whatsappNumber}?text=${encodeURIComponent('مرحباً، أودّ الاستفسار.')}`, '_blank');
      }, 500);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => { setOpen(!open); if (!shown) { setMessages([{ from: 'bot', text: botSettings.welcomeText }]); setShown(true); } }}
        className="fixed bottom-24 right-4 z-40 md:bottom-6 w-14 h-14 rounded-2xl bg-indigo border border-amber/30 shadow-xl shadow-ink/40 flex items-center justify-center transition-all hover:scale-110"
        aria-label="المساعد الذكي"
      >
        {open ? <X size={20} className="text-ivory" /> : <img src={tuaregSeal} alt="" className="w-8 h-8" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-44 right-4 z-50 md:bottom-24 w-80 rounded-2xl bg-ink border border-border shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '60vh' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-indigo/50">
            <img src={tuaregSeal} alt="" className="w-8 h-8" />
            <div>
              <p className="font-body text-ivory text-sm font-medium">المساعد الذكي</p>
              <p className="text-xs text-silver font-body">نشط الآن</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl font-body text-sm leading-relaxed ${msg.from === 'user' ? 'bg-amber/20 text-ivory' : 'bg-indigo text-ivory-muted border border-border'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="p-3 border-t border-border space-y-2">
            <p className="text-xs text-silver font-body">اختر سؤالاً:</p>
            <div className="flex flex-col gap-1.5">
              {botSettings.questions.map(q => (
                <button key={q.id} onClick={() => handleQuestion(q)} className="text-right px-3 py-2 rounded-lg border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory transition-all text-xs font-body flex items-center gap-2">
                  <MessageSquare size={12} className="text-amber flex-shrink-0" />
                  {q.label}
                </button>
              ))}
              <a href={`https://wa.me/${botSettings.whatsappNumber}?text=${encodeURIComponent('مرحباً')}`} target="_blank" rel="noopener noreferrer" className="text-right px-3 py-2 rounded-lg bg-green-900/30 border border-green-700/40 text-green-400 transition-all text-xs font-body flex items-center gap-2">
                <Send size={12} className="flex-shrink-0" />
                تواصل مباشر عبر واتساب
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
