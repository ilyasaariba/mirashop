"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  ShieldCheck,
  Truck,
  Clock,
  ShoppingCart,
  Star,
  Zap,
  ChevronLeft,
  Package,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string;
  image_gallery: string[] | null;
  stock_quantity: number | null;
};

/* ─────────────────────────────────────────────────────────────
   LOGO (same as home)
───────────────────────────────────────────────────────────── */
function MiraLogo({ white = false }: { white?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 select-none" aria-label="Mirashop">
      <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <polygon points="9,0 18,12 9,24 0,12" fill="#FF6D00" opacity="0.95" />
        <polygon points="9,5 14,12 9,19 4,12" fill={white ? "rgba(255,255,255,0.4)" : "rgba(26,35,126,0.3)"} />
      </svg>
      <span className="font-readex-pro leading-none" style={{ letterSpacing: "-0.04em" }}>
        <span className="font-black text-xl" style={{ color: white ? "#FFFFFF" : "#1A237E" }}>Mira</span><span className="font-light text-xl" style={{ color: "#FF6D00" }}>shop</span>
      </span>
    </span>
  );
}


/* ─────────────────────────────────────────────────────────────
   TRUST STRIP
───────────────────────────────────────────────────────────── */
function TrustStrip() {
  const items = [
    { icon: <Truck className="w-4 h-4" />, label: "توصيل 48h" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "ضمان الجودة" },
    { icon: <Package className="w-4 h-4" />, label: "دفع عند الاستلام" },
    { icon: <Clock className="w-4 h-4" />, label: "عروض محدودة" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
      {items.map((t, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-slate-600 text-sm font-semibold"
        >
          <span className="text-[#FF6D00]">{t.icon}</span>
          {t.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REVIEWS ROW
───────────────────────────────────────────────────────────── */
function ReviewsRow() {
  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-700">4.9/5</span>
      <span className="text-xs text-slate-400">(+580 تقييم)</span>
      <span className="text-xs bg-green-50 text-green-700 font-bold border border-green-200 px-2 py-0.5 rounded-full">
        ✓ موثق
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORM STEP INDICATOR
───────────────────────────────────────────────────────────── */
function FormSteps() {
  return (
    <div className="flex items-center justify-center gap-0 mb-7 select-none">
      {[
        { n: "1", label: "بياناتك" },
        { n: "2", label: "العنوان" },
        { n: "3", label: "التأكيد" },
      ].map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#1A237E] text-white font-black flex items-center justify-center text-sm shadow-md shadow-indigo-200">
              {step.n}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{step.label}</span>
          </div>
          {i < 2 && (
            <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-l from-[#1A237E]/30 to-[#1A237E] mb-4 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INPUT COMPONENT
───────────────────────────────────────────────────────────── */
function FormInput({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-slate-700 font-bold text-sm">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        required={required}
        className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl
          focus:outline-none focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/10
          transition-all placeholder:text-slate-300 font-medium text-slate-800
          text-base shadow-sm"
        {...props}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────────── */
export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  // Form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProduct(data);
        setActiveImage(data?.image_url ?? "");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    // Mark all fields touched to show errors
    setTouched({ fullName: true, phone: true, city: true });
    if (!fullName || !phone || !city) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      const { error } = await supabase.from("leads").insert({
        product_id: product.id,
        full_name: fullName,
        phone,
        city,
        quantity,
      });
      if (error) throw error;
      setIsSubmitted(true);
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      setFormError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = useCallback(() => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* Discount */
  const discount =
    product?.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  const galleryImages = product
    ? [product.image_url, ...(product.image_gallery || [])].filter(Boolean)
    : [];

  const formReady = !!fullName && !!phone && !!city;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1A237E] flex items-center justify-center animate-pulse-ring">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] text-center font-cairo">
        <div>
          <p className="text-5xl mb-4">😕</p>
          <p className="text-xl text-slate-600 bg-white px-8 py-4 rounded-2xl shadow-md">
            المنتج غير موجود
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[#1A237E] font-bold hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F6FA] font-cairo">

      {/* ══ STICKY HEADER ══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-[#1A237E] transition-colors text-sm font-semibold group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">المتجر</span>
          </Link>

          <Link href="/" aria-label="Mirashop">
            <MiraLogo />
          </Link>

          {/* Desktop CTA in header */}
          <button
            onClick={scrollToForm}
            className="hidden sm:flex items-center gap-1.5 bg-[#FF6D00] hover:bg-[#E65100] text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-orange-200 hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4" />
            اطلب الآن
          </button>
          <div className="sm:hidden w-20" /> {/* Spacer to center logo on mobile */}
        </div>
      </header>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════ */}
      <main className="container mx-auto px-4 max-w-7xl pt-6 pb-32 lg:pb-16">

        {/* Desktop: 3-col | Mobile: single column scroll */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 xl:grid-cols-[1fr_360px]">

          {/* ── LEFT BLOCK: Gallery + Details ── */}
          <div>

            {/* Desktop: side-by-side | Mobile: stacked */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 mb-8">

              {/* GALLERY */}
              <div className="mb-6 lg:mb-0">
                {/* Main image */}
                <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-slate-100 group">
                  <Image
                    src={activeImage || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    priority
                  />
                  {/* Discount badge */}
                  {discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white font-black px-3 py-1.5 rounded-xl text-sm shadow-lg -rotate-2">
                      -{discount}% تخفيض
                    </div>
                  )}
                  {/* Gradient bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Thumbnail strip */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-hide px-0.5 pb-1">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                          activeImage === img
                            ? "border-[#1A237E] shadow-md"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT DETAILS */}
              <div className="animate-fade-up">
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-slate-900 leading-tight mb-4 font-readex-pro">
                  {product.title}
                </h1>

                {/* Reviews */}
                <ReviewsRow />

                {/* Price block */}
                <div className="flex items-center gap-4 mt-5 mb-1">
                  <div className="flex items-baseline gap-1 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 px-5 py-3 rounded-2xl shadow-sm">
                    <span className="text-4xl font-black text-red-600 leading-none font-readex-pro">
                      {product.price}
                    </span>
                    <span className="text-red-500 font-bold text-lg self-end pb-0.5">درهم</span>
                  </div>
                  {product.old_price && (
                    <div className="flex flex-col">
                      <span className="text-slate-400 line-through text-base">
                        {product.old_price} درهم
                      </span>
                      {discount && (
                        <span className="text-green-600 font-black text-sm">
                          وفّر {product.old_price - product.price} درهم!
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Scarcity */}
                {product.stock_quantity !== null && product.stock_quantity > 0 && (
                  <div className="mt-4 flex items-center gap-2.5 bg-orange-50 border border-orange-200 px-4 py-3 rounded-xl w-fit">
                    <span className="text-orange-500 text-xl animate-[spin_3s_linear_infinite]">🔥</span>
                    <span className="text-orange-700 font-black text-sm">
                      أسرع! لم يتبق سوى{" "}
                      <span className="text-orange-600 text-base">{product.stock_quantity}</span>{" "}
                      قطعة في المخزن
                    </span>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div className="mt-5 text-slate-600 text-base leading-relaxed whitespace-pre-wrap border-t border-slate-100 pt-5">
                    {product.description}
                  </div>
                )}

                {/* Trust strip */}
                <TrustStrip />


              </div>
            </div>

            {/* ── MOBILE ORDER FORM (below details) ── */}
            <div id="order-form" className="lg:hidden">
              <OrderForm
                product={product}
                fullName={fullName} setFullName={setFullName}
                phone={phone} handlePhoneChange={handlePhoneChange}
                city={city} setCity={setCity}
                quantity={quantity} setQuantity={setQuantity}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
                formError={formError}
                handleSubmit={handleSubmit}
                touched={touched} setTouched={setTouched}
              />
            </div>
          </div>

          {/* ── RIGHT BLOCK: Sticky Order Form (Desktop only) ── */}
          <div className="hidden lg:block">
            <div id="order-form" className="sticky top-20">
              <OrderForm
                product={product}
                fullName={fullName} setFullName={setFullName}
                phone={phone} handlePhoneChange={handlePhoneChange}
                city={city} setCity={setCity}
                quantity={quantity} setQuantity={setQuantity}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
                formError={formError}
                handleSubmit={handleSubmit}
                touched={touched} setTouched={setTouched}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ══ MOBILE BOTTOM STICKY CTA ══════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex gap-3 items-center">
          {/* Price pill */}
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">السعر</span>
            <span className="font-black text-[#FF6D00] text-xl leading-none">{product.price} <span className="text-xs font-semibold text-slate-400">درهم</span></span>
          </div>
          <button
            onClick={scrollToForm}
            className="flex-1 bg-[#FF6D00] hover:bg-[#E65100] text-white font-black py-4 rounded-2xl
              transition-all shadow-lg shadow-orange-300/50 flex items-center justify-center gap-2 text-lg
              active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            اطلب الآن — الدفع عند الاستلام
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-1.5 font-medium">
          🔒 الدفع عند الاستلام — بدون بطاقة بنكية — توصيل خلال 48 ساعة
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORDER FORM COMPONENT (shared mobile/desktop)
───────────────────────────────────────────────────────────── */
type OrderFormProps = {
  product: Product;
  fullName: string; setFullName: (v: string) => void;
  phone: string; handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  city: string; setCity: (v: string) => void;
  quantity: number; setQuantity: (v: number) => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  formError: string;
  handleSubmit: (e: React.FormEvent) => void;
  touched: Record<string, boolean>;
  setTouched: (v: Record<string, boolean>) => void;
};

function OrderForm({
  product,
  fullName, setFullName,
  phone, handlePhoneChange,
  city, setCity,
  quantity, setQuantity,
  isSubmitting,
  isSubmitted,
  formError,
  handleSubmit,
  touched, setTouched,
}: OrderFormProps) {

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-scale-in">
        {/* Success ring */}
        <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 ring-8 ring-green-50 shadow-inner">
          <Check className="w-12 h-12 text-green-500 stroke-[3]" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 font-readex-pro mb-3">
          تم استلام طلبك! 🎉
        </h3>
        <p className="text-slate-500 leading-relaxed mb-6">
          شكراً لك! سيتصل بك فريقنا قريباً لتأكيد التوصيل.
        </p>
        <div className="bg-[#1A237E]/5 border border-[#1A237E]/10 rounded-2xl p-4 text-sm text-slate-600">
          <p className="font-bold text-[#1A237E] mb-1">📦 {product.title}</p>
          <p>الكمية: {quantity} قطعة</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-[#1A237E] font-bold hover:underline text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          تصفح المزيد من المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#1A237E] via-[#FF6D00] to-[#1A237E]" />

      <div className="p-5">
        {/* Form header — compact */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 font-readex-pro leading-tight">
              أطلب الآن
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">الدفع عند الاستلام • توصيل 48h</p>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#FF6D00]/10 text-[#FF6D00] font-black text-xs px-2.5 py-1.5 rounded-full border border-[#FF6D00]/20 shrink-0">
            <Zap className="w-3 h-3" />
            احجز الآن
          </span>
        </div>

        {/* Error */}
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-bold text-center mb-3">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-bold text-sm">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setTouched({ ...touched, fullName: true }); }}
              onBlur={() => setTouched({ ...touched, fullName: true })}
              placeholder="محمد أحمد"
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all
                focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20
                placeholder:text-slate-300 font-medium text-slate-800 text-base
                ${touched.fullName && !fullName ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-[#1A237E]"}`}
            />
            {touched.fullName && !fullName && (
              <p className="text-red-500 text-xs font-semibold">يرجى إدخال الاسم الكامل</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-bold text-sm">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => { handlePhoneChange(e); setTouched({ ...touched, phone: true }); }}
              onBlur={() => setTouched({ ...touched, phone: true })}
              placeholder="0600000000"
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all
                focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20
                placeholder:text-slate-300 font-medium text-slate-800 text-base text-right
                ${touched.phone && !phone ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-[#1A237E]"}`}
            />
            {touched.phone && !phone && (
              <p className="text-red-500 text-xs font-semibold">يرجى إدخال رقم الهاتف</p>
            )}
          </div>

          {/* City + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold text-sm">
                المدينة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setTouched({ ...touched, city: true }); }}
                onBlur={() => setTouched({ ...touched, city: true })}
                placeholder="الدار البيضاء"
                className={`w-full px-3 py-3 bg-white border-2 rounded-xl transition-all
                  focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20
                  placeholder:text-slate-300 font-medium text-slate-800 text-sm
                  ${touched.city && !city ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-[#1A237E]"}`}
              />
              {touched.city && !city && (
                <p className="text-red-500 text-xs font-semibold">أدخل المدينة</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold text-sm">الكمية</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-3 bg-white border-2 border-slate-100 rounded-xl
                  focus:outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20
                  transition-all font-bold text-slate-800 text-base"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-[#1A237E]/5 border border-[#1A237E]/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">المجموع ({quantity} قطعة)</span>
            <span className="font-black text-[#1A237E] text-base">{product.price * quantity} درهم</span>
          </div>

          {/* Submit — always orange, shows field errors on click */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF6D00] hover:bg-[#E65100] text-white font-black text-lg py-4 rounded-2xl
              transition-all shadow-lg shadow-orange-300/40 flex items-center justify-center gap-2
              hover:scale-[1.01] active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </span>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                تأكيد الطلب — الدفع عند الاستلام
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
            بياناتك محمية — لا حاجة لبطاقة بنكية
          </div>
        </form>
      </div>
    </div>
  );
}
