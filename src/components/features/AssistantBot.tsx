import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBotSettings } from '@/lib/storage';
import tuaregSeal from '@/assets/tuareg-seal.png';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  buttons?: { label: string; action: string }[];
}

export default function AssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const botSettings = getBotSettings();

  useEffect(() => {
    if (!botSettings.enabled) return;
    const timer = setTimeout(() => setShowGreeting(true), botSettings.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: botSettings.welcomeText,
        isBot: true,
        buttons: botSettings.questions.map(q => ({ label: q.label, action: q.id })),
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!botSettings.enabled) return null;

  const handleButtonAction = (action: string) => {
    const question = botSettings.questions.find(q => q.id === action);
    if (!question) return;

    if (question.action === 'whatsapp') {
      window.open(`https://wa.me/${botSettings.whatsappNumber}?text=${encodeURIComponent('أهلاً، أريد الاستفسار...')}`, '_blank');
      return;
    }
    if (question.action === 'faq') {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
      return;
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: question.label, isBot: false },
      {
        id: (Date.now() + 1).toString(),
        text: question.answer,
        isBot: true,
        buttons: question.action === 'gallery'
          ? [{ label: 'فتح المعرض', action: 'go-gallery' }]
          : question.action === 'order'
          ? [{ label: 'نموذج الطلب', action: 'go-order' }]
          : [{ label: 'واتساب', action: 'go-whatsapp' }],
      },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'شكراً! للحصول على إجابة أفضل تواصل عبر واتساب.',
        isBot: true,
        buttons: [{ label: 'واتساب', action: 'go-whatsapp' }],
      }]);
    }, 800);
  };

  const renderButton = (btn: { label: string; action: string }) => {
    if (btn.action === 'go-gallery')
      return <Link key={btn.action} to="/gallery" className="text-xs px-2.5 py-1.5 rounded-lg border border-amber/40 text-amber hover:bg-amber/10 transition-colors font-body" onClick={() => setIsOpen(false)}>{btn.label}</Link>;
    if (btn.action === 'go-order')
      return <Link key={btn.action} to="/order" className="text-xs px-2.5 py-1.5 rounded-lg border border-amber/40 text-amber hover:bg-amber/10 transition-colors font-body" onClick={() => setIsOpen(false)}>{btn.label}</Link>;
    if (btn.action === 'go-whatsapp')
      return <button key={btn.action} onClick={() => window.open(`https://wa.me/${botSettings.whatsappNumber}`, '_blank')} className="text-xs px-2.5 py-1.5 rounded-lg border border-amber/40 text-amber hover:bg-amber/10 transition-colors font-body">{btn.label}</button>;
    return <button key={btn.action} onClick={() => handleButtonAction(btn.action)} className="text-xs px-2.5 py-1.5 rounded-lg border border-amber/40 text-amber hover:bg-amber/10 transition-colors font-body">{btn.label}</button>;
  };

  return (
    <>
      {showGreeting && !isOpen && (
        <div
          className="fixed bottom-24 left-5 z-40 glass-card rounded-2xl p-3 max-w-[200px] animate-slide-up cursor-pointer"
          onClick={() => { setIsOpen(true); setShowGreeting(false); }}
        >
          <p className="font-body text-ivory text-xs leading-relaxed">أهلاً! هل تبحث عن عمل جاهز أم خدمة مخصصة؟</p>
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[hsl(240,35%,18%)] rotate-45 border-b border-l border-amber/20" />
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 left-5 z-50 w-[320px] sm:w-[360px] glass-card rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-indigo/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={tuaregSeal} alt="مساعد" className="w-9 h-9" />
                <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="font-body text-ivory text-sm font-medium">المساعد الذكي</p>
                <p className="font-body text-silver text-xs">متصل الآن</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-ivory-muted transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-[80%] space-y-2">
                  <div className={`rounded-2xl px-3 py-2.5 text-xs font-body leading-relaxed ${msg.isBot ? 'bg-indigo text-ivory rounded-tr-sm' : 'amber-gradient text-ink rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                  {msg.buttons && <div className="flex flex-wrap gap-1.5">{msg.buttons.map(btn => renderButton(btn))}</div>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border/40">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 text-ivory text-xs font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors"
              />
              <button onClick={handleSend} className="w-9 h-9 rounded-xl amber-gradient flex items-center justify-center text-ink hover:opacity-90 transition-opacity">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => { setIsOpen(!isOpen); setShowGreeting(false); }}
        className="fixed bottom-6 left-5 z-50 w-14 h-14 rounded-full amber-gradient flex items-center justify-center shadow-lg shadow-amber/30 hover:opacity-90 transition-all active:scale-95 md:bottom-8"
        aria-label="المساعد الذكي"
      >
        {isOpen ? <X size={22} className="text-ink" /> : <img src={tuaregSeal} alt="bot" className="w-8 h-8" />}
      </button>
    </>
  );
}
