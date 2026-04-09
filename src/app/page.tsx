"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Headset,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Category = { id: string; name: string; display_order: number };
type Product = {
  id: string;
  title: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
};
type StoreSettings = {
  whatsapp_number: string;
  contact_email: string;
  footer_text: string;
};

/* ─────────────────────────────────────────────────────────────
   SVG LOGO COMPONENT
───────────────────────────────────────────────────────────── */
function MiraLogo({ white = false }: { white?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 select-none"
      aria-label="Mirashop"
    >
      {/* Diamond icon */}
      <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <polygon points="9,0 18,12 9,24 0,12" fill="#FF6D00" opacity="0.95" />
        <polygon points="9,5 14,12 9,19 4,12" fill={white ? "rgba(255,255,255,0.4)" : "rgba(26,35,126,0.3)"} />
      </svg>
      {/* Wordmark */}
      <span className="font-readex-pro leading-none" style={{ letterSpacing: "-0.04em" }}>
        <span
          className="font-black text-xl"
          style={{ color: white ? "#FFFFFF" : "#1A237E" }}
        >Mira</span><span
          className="font-light text-xl"
          style={{ color: "#FF6D00" }}
        >shop</span>
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOCIAL PROOF TICKER
───────────────────────────────────────────────────────────── */
const tickerItems = [
  "⭐⭐⭐⭐⭐ — محمد من الدار البيضاء اشترى للتو",
  "🔥 47 شخصاً يتصفحون الآن",
  "✅ سلمى من الرباط: «منتج رائع وتوصيل سريع»",
  "🚀 580 طلب تم تسليمه هذا الأسبوع",
  "⭐⭐⭐⭐⭐ — ياسين من مراكش: «ممتاز وسعر في المتناول»",
  "🛡 الدفع عند الاستلام — لا مخاطرة إطلاقاً",
  "⭐⭐⭐⭐⭐ — فاطمة من فاس: «جودة فوق توقعاتي»",
  "📦 توصيل لجميع مدن المغرب خلال 48 ساعة",
];

function SocialProofTicker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="bg-[#1A237E] text-white overflow-hidden py-2.5 border-b border-[#283593]">
      <div className="flex gap-10 animate-ticker whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium shrink-0 opacity-90">
            {item}
            <span className="mx-5 text-[#FF6D00]">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TRUST BADGES
───────────────────────────────────────────────────────────── */
const trustBadges = [
  { icon: <Truck className="w-6 h-6" />, title: "شحن سريع 48h", desc: "لجميع مدن المغرب" },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "دفع عند الاستلام", desc: "بدون بطاقة بنكية" },
  { icon: <RotateCcw className="w-6 h-6" />, title: "إرجاع مجاني", desc: "استبدال بدون تعقيد" },
  { icon: <Headset className="w-6 h-6" />, title: "دعم 24/7", desc: "فريقنا في خدمتك" },
];

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-6 w-1/3 mt-1" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#FF6D00]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image wrapper */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-md tracking-tight">
            -{discount}%
          </span>
        )}

        {/* Hover CTA overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A237E]/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end pb-4 justify-center">
          <span className="text-white font-bold text-sm px-4 py-1.5 bg-[#FF6D00] rounded-full shadow-md">
            اطلب الآن
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#1A237E] transition-colors">
          {product.title}
        </h3>
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-black text-[#FF6D00] text-lg leading-none">
              {product.price}
              <span className="text-xs font-semibold text-slate-400 mr-0.5"> درهم</span>
            </span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">
                {product.old_price} درهم
              </span>
            )}
          </div>
          {/* Stars micro-social-proof */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[10px] text-slate-400 mr-1">(+200)</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY SECTION — auto grid or carousel based on count
───────────────────────────────────────────────────────────── */
const CAROUSEL_THRESHOLD = 5; // more than this → carousel

function CategorySection({ title, products }: { title: string; products: Product[] }) {
  const useCarousel = products.length > CAROUSEL_THRESHOLD;
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* scroll one card width */
  const scrollBy = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild
      ? (track.firstElementChild as HTMLElement).offsetWidth + 12
      : 200;
    track.scrollBy({ left: dir === "left" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

  /* auto-scroll every 30 s */
  useEffect(() => {
    if (!useCarousel) return;
    const start = () => {
      autoRef.current = setInterval(() => {
        const track = trackRef.current;
        if (!track) return;
        const atEnd =
          track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        if (atEnd) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth =
            track.firstElementChild
              ? (track.firstElementChild as HTMLElement).offsetWidth + 12
              : 200;
          track.scrollBy({ left: -cardWidth, behavior: "smooth" });
        }
      }, 30000);
    };
    start();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [useCarousel]);

  return (
    <section className="mb-14 animate-fade-up">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 bg-[#FF6D00] rounded-full shrink-0" />
        <h2 className="text-xl lg:text-2xl font-black text-slate-800 font-readex-pro">
          {title}
        </h2>
        <span className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
        <span className="text-slate-400 text-xs font-semibold shrink-0 bg-gray-100 px-2.5 py-1 rounded-full">
          {products.length} منتج
        </span>
      </div>

      {useCarousel ? (
        /* ── Carousel layout ── */
        <div className="relative group/carousel">
          {/* Left arrow (in RTL this scrolls forward) */}
          <button
            onClick={() => scrollBy("left")}
            aria-label="التالي"
            className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-slate-600 hover:text-[#FF6D00] hover:border-[#FF6D00]/40 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div ref={trackRef} className="product-carousel-track">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Right arrow (in RTL this scrolls back) */}
          <button
            onClick={() => scrollBy("right")}
            aria-label="السابق"
            className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-slate-600 hover:text-[#FF6D00] hover:border-[#FF6D00]/40 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* ── Standard grid ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: cats }, { data: prods }, { data: storeData }] = await Promise.all([
          supabase
            .from("categories")
            .select("id, name, display_order")
            .order("display_order", { ascending: true }),
          supabase
            .from("products")
            .select("id, title, price, old_price, image_url, is_active, category_id")
            .eq("is_active", true),
          supabase
            .from("store_settings")
            .select("whatsapp_number, contact_email, footer_text")
            .limit(1)
            .single(),
        ]);
        setCategories(cats ?? []);
        setProducts(prods ?? []);
        if (storeData) setSettings(storeData);
      } catch (err) {
        console.error("Error loading storefront:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* Group by category */
  const productsByCategory = categories.reduce<Record<string, Product[]>>((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.category_id === cat.id);
    return acc;
  }, {});
  const uncategorised = products.filter((p) => !p.category_id);

  /* Filter for category pill nav */
  const displayedProducts =
    activeCategory === "all"
      ? products
      : activeCategory === "other"
      ? uncategorised
      : productsByCategory[activeCategory] ?? [];

  const categoriesWithProducts = categories.filter(
    (c) => (productsByCategory[c.id] ?? []).length > 0,
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-cairo">

      {/* ── Social proof ticker ────────────────────────────── */}
      <SocialProofTicker />

      {/* ── Sticky Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" aria-label="Mirashop Home">
            <MiraLogo />
          </Link>

          {/* Desktop nav hint */}
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm">
            <Zap className="w-4 h-4 text-[#FF6D00]" />
            <span>شحن مجاني للطلبات فوق 500 درهم</span>
          </div>

          {/* CTA */}
          <a
            href="#catalog"
            className="flex items-center gap-1.5 bg-[#FF6D00] hover:bg-[#E65100] text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-orange-200 hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>دفع عند الاستلام</span>
          </a>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="container mx-auto px-4 max-w-7xl pt-8 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A237E] via-[#283593] to-[#1A237E] shadow-2xl">

          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 right-8 w-64 h-64 rounded-full bg-[#FF6D00]/20 blur-2xl pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 lg:p-14">
            {/* Copy */}
            <div className="md:w-1/2 animate-fade-up">
              <span className="inline-flex items-center gap-2 bg-[#FF6D00]/20 text-[#FF8F29] text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 border border-[#FF6D00]/30">
                <Zap className="w-3.5 h-3.5" />
                وجهتك الأولى للتسوق بالمغرب
              </span>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-5 font-readex-pro">
                كل ما تحتاجه<br />
                <span className="text-[#FF8F29]">بنقرة واحدة</span>
              </h1>
              <p className="text-white/75 text-base lg:text-lg mb-8 leading-relaxed max-w-md">
                تسوق من مئات المنتجات المختارة بعناية، مع الدفع عند الاستلام والتوصيل لجميع مدن المغرب.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF6D00] hover:bg-[#E65100] text-white font-black py-4 px-8 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-orange-900/40 text-lg font-readex-pro"
                >
                  تسوق الآن
                  <ChevronLeft className="w-5 h-5" />
                </a>
                <div className="flex items-center gap-3 text-white/70 text-sm font-medium self-center sm:self-auto">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {["1A237E", "283593", "FF6D00"].map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-[#283593]"
                        style={{ background: `#${c}` }}
                      />
                    ))}
                  </div>
                  +2,400 عميل راضٍ
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="md:w-1/2 w-full relative h-[220px] sm:h-[300px] md:h-[380px] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop"
                alt="ميراشوب — تسوق متنوع"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A237E]/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ───────────────────────────────────── */}
      <section className="container mx-auto px-4 max-w-7xl py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl px-4 py-4 flex items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#FF6D00]/30 transition-all duration-300"
            >
              <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#FFF3E8] text-[#FF6D00]">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-800 text-sm leading-tight">{badge.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catalog ────────────────────────────────────────── */}
      <section id="catalog" className="container mx-auto px-4 max-w-7xl pb-24 pt-2">

        {/* Category pill nav */}
        {categoriesWithProducts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8 sticky top-16 z-40 bg-[#F5F6FA] pt-4 -mx-4 px-4">
            {[
              { id: "all", name: "الكل" },
              ...categoriesWithProducts,
              ...(uncategorised.length > 0 ? [{ id: "other", name: "أخرى" }] : []),
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                  activeCategory === cat.id
                    ? "bg-[#1A237E] text-white border-[#1A237E] shadow-md shadow-indigo-200"
                    : "bg-white text-slate-600 border-gray-200 hover:border-[#1A237E]/40 hover:bg-indigo-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {activeCategory === "all" ? (
              <>
                {categoriesWithProducts.map((cat) => (
                  <CategorySection
                    key={cat.id}
                    title={cat.name}
                    products={productsByCategory[cat.id]}
                  />
                ))}
                {uncategorised.length > 0 && (
                  <CategorySection title="منتجات أخرى" products={uncategorised} />
                )}
              </>
            ) : (
              <CategorySection
                title={
                  activeCategory === "other"
                    ? "منتجات أخرى"
                    : (categoriesWithProducts.find((c) => c.id === activeCategory)?.name ?? "")
                }
                products={displayedProducts}
              />
            )}

            {products.length === 0 && (
              <div className="text-center py-32">
                <p className="text-slate-300 text-7xl mb-6">🛍</p>
                <p className="text-slate-500 text-xl font-readex-pro">
                  لا توجد منتجات متاحة حالياً
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#0D1257] text-slate-300 pt-14 pb-8 border-t-4 border-[#FF6D00]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
            {/* Brand */}
            <div>
              <MiraLogo white />
              <p className="text-slate-400 text-sm mt-3 max-w-xs leading-relaxed">
                وجهتك الأولى للتسوق الإلكتروني بالمغرب. منتجات موثوقة، توصيل سريع، ودفع آمن عند الاستلام.
              </p>
            </div>
            {/* Trust items */}
            <div className="flex flex-col gap-3 text-sm">
              {trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <span className="text-[#FF6D00]">{b.icon}</span>
                  <span>{b.title}</span>
                </div>
              ))}
            </div>
            {/* Contact — dynamic from store_settings */}
            <div className="text-sm text-slate-400 space-y-2">
              <p className="font-bold text-white text-base mb-3">تواصل معنا</p>
              {settings?.contact_email ? (
                <p>
                  📧{" "}
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-[#FF8F29] transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </p>
              ) : (
                <p>📧 support@mirashop.com</p>
              )}
              {settings?.whatsapp_number ? (
                <p>
                  📞{" "}
                  <a
                    href={`https://wa.me/${settings.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF8F29] transition-colors"
                  >
                    +{settings.whatsapp_number}
                  </a>
                </p>
              ) : (
                <p>📞 +212 600-000000</p>
              )}
              <p>🕐 متاح 24/7</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 text-center text-xs text-slate-600">
            {settings?.footer_text || "© 2026 ميراشوب — جميع الحقوق محفوظة."}
          </div>
        </div>
      </footer>
    </div>
  );
}
