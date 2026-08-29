import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <div className="font-heading text-8xl text-amber mb-4">٤٠٤</div>
        <h1 className="font-heading text-3xl text-ivory mb-3">الصفحة غير موجودة</h1>
        <p className="font-body text-ivory-muted mb-8">الرابط الذي طلبته غير موجود أو تم نقله.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl amber-gradient text-ink font-medium font-body hover:opacity-90 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
