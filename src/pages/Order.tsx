import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import OrderForm from '@/components/features/OrderForm';
import WhatsAppButton from '@/components/features/WhatsAppButton';

export default function Order() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-amber text-sm font-body mb-2">ابدأ الآن</p>
            <h1 className="font-heading text-4xl sm:text-5xl text-ivory mb-3">اطلب / احجز</h1>
            <p className="font-body text-ivory-muted max-w-lg mx-auto">
              سواء كنت تريد عملاً جاهزاً أو خدمة مخصصة، أنا هنا لأحقق رؤيتك بإبداع وحرفية.
            </p>
          </div>

          <OrderForm />
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
