import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/features/AboutSection';
import ReviewsSection from '@/components/features/ReviewsSection';
import FAQSection from '@/components/features/FAQSection';
import WhatsAppButton from '@/components/features/WhatsAppButton';
import { incrementVisit } from '@/lib/storage';
import tuaregSeal from '@/assets/tuareg-seal.png';

export default function About() {
  useEffect(() => { incrementVisit(); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-4">
            <img src={tuaregSeal} alt="ختم" className="w-12 h-12 opacity-70" />
            <div>
              <p className="text-amber text-sm font-body mb-1">من أنا</p>
              <h1 className="font-heading text-4xl text-ivory">نبذة عني</h1>
            </div>
          </div>
        </div>
        <AboutSection full />
        <ReviewsSection />
        <FAQSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
