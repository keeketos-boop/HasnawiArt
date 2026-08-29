import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import GalleryGrid from '@/components/features/GalleryGrid';
import WhatsAppButton from '@/components/features/WhatsAppButton';
import { ArtCategory } from '@/types';

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'ready' | 'services' | null;
  const initialCat = searchParams.get('category') as ArtCategory | null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-amber text-sm font-body mb-2">إبداع بلا حدود</p>
            <h1 className="font-heading text-4xl sm:text-5xl text-ivory mb-3">معرض الأعمال</h1>
            <p className="font-body text-ivory-muted max-w-lg">
              مجموعة متنوعة من الأعمال الفنية الأصيلة والخدمات المخصصة، كل قطعة تحمل روح الصحراء وعمق التراث.
            </p>
          </div>
          <GalleryGrid
            showTabs
            showFilters
            initialCategory={initialCat || 'all'}
          />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
