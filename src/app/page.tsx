"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ShieldCheck, Truck, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "../lib/supabase";

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

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .limit(1)
          .single();

        if (error) throw error;
        setProduct(data);
        if (data) {
          setActiveImage(data.image_url);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsSubmitting(true);
    setFormError("");

    try {
      const { error } = await supabase.from("leads").insert({
        product_id: product.id,
        full_name: fullName,
        phone,
        city,
        address,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting order:", error);
      setFormError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center font-cairo">
        <p className="text-xl text-gray-600">لا يوجد منتج حالياً</p>
      </div>
    );
  }

  // Combine image_url and image_gallery, filtering out any empty spots
  const galleryImages = [product.image_url, ...(product.image_gallery || [])].filter(Boolean);

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 font-cairo pb-20">
      {/* Sticky Header (Mobile friendly) */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-2xl font-bold font-readex-pro text-primary text-center">Mirashop</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl mt-6 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Right Side: Product Gallery & Details */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Product Image Gallery */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 group relative">
                {product.old_price && product.old_price > product.price && (
                  <div className="absolute top-4 right-4 bg-secondary text-white font-bold px-3 py-1 rounded-full z-10 text-sm shadow-md">
                    تخفيض محدود
                  </div>
                )}
                <Image
                  src={activeImage || "/placeholder.jpg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
              
              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImage === img ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} - صورة ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Block */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <h2 className="text-3xl lg:text-4xl font-bold font-readex-pro text-primary mb-4 leading-tight">
                {product.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex bg-[#FEE2E2] px-5 py-2.5 rounded-xl scale-105 transform origin-right shadow-sm border border-red-100">
                  <span className="text-3xl font-bold text-red-600 ml-1">{product.price}</span>
                  <span className="text-red-600 font-bold self-end pb-1">درهم</span>
                </div>
                {product.old_price && (
                  <div className="text-gray-400 line-through text-lg flex items-center bg-gray-100 px-3 py-1 rounded-lg">
                    <span>{product.old_price}</span>
                    <span className="ml-1 text-sm">درهم</span>
                  </div>
                )}
              </div>

              {/* Urgency/Stock Indicator */}
              {product.stock_quantity !== null && product.stock_quantity > 0 && (
                <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-5 py-3.5 rounded-xl font-bold mb-6 border border-orange-100 animate-pulse w-max max-w-full shadow-sm">
                  <span className="text-xl">🔥</span>
                  <span>أسرع! لم يتبق سوى {product.stock_quantity} قطع في المخزن</span>
                </div>
              )}

              {/* Scroll-to-Form CTA */}
              <button
                onClick={scrollToForm}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xl py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center mb-6 lg:hidden"
              >
                اطلب الآن والدفع عند الاستلام
              </button>

              <div className="prose prose-lg text-gray-600 mb-8 max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-secondary"><Truck className="w-5 h-5" /></div>
                  <span>توصيل سريع</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-secondary"><ShieldCheck className="w-5 h-5" /></div>
                  <span>ضمان الجودة</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-secondary"><ShoppingCart className="w-5 h-5" /></div>
                  <span>الدفع عند الاستلام</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-secondary"><Clock className="w-5 h-5" /></div>
                  <span>عروض محدودة</span>
                </div>
              </div>
              
              {/* Desktop CTA */}
              <button
                onClick={scrollToForm}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xl py-4 mt-8 rounded-xl transition-all shadow-lg shadow-primary/30 hidden lg:flex items-center justify-center transform hover:-translate-y-1"
              >
                اطلب الآن والدفع عند الاستلام
              </button>
            </div>
          </div>

          {/* Left Side: Call to Action Container */}
          <div className="lg:col-span-2 relative">
            <div className="sticky top-24">
              <div id="order-form" className="bg-white rounded-2xl shadow-xl border-t-4 border-primary overflow-hidden">
                {isSubmitted ? (
                  <div className="bg-green-50 p-10 text-center h-full flex flex-col justify-center items-center animate-fade-in py-16">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <Check className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold font-readex-pro text-green-800 mb-3">تم الاستلام بنجاح</h4>
                    <p className="text-green-700 text-lg leading-relaxed">
                      شكراً لك! تم استلام طلبك، سنتصل بك قريباً لتأكيد التوصيل.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 lg:p-8">
                    <h3 className="text-3xl font-bold font-readex-pro text-center text-primary mb-3">
                      أطلب الآن
                    </h3>
                    <p className="text-center text-gray-500 mb-8 text-sm font-medium">
                      المرجو إدخال معلوماتك وسنتصل بك لتأكيد الطلب
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {formError && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 font-semibold text-center">
                          {formError}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="block text-gray-700 font-bold text-sm">الاسم الكامل *</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-gray-400"
                            placeholder="محمد أحمد"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-gray-700 font-bold text-sm">رقم الهاتف *</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            dir="ltr"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-right placeholder:text-gray-400"
                            placeholder="06 XX XX XX XX"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="block text-gray-700 font-bold text-sm">المدينة *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-gray-400"
                            placeholder="الدار البيضاء"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-gray-700 font-bold text-sm">العنوان الكامل *</label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-right placeholder:text-gray-400"
                            placeholder="الحي، الزنقة، رقم الدار"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-secondary hover:bg-orange-600 text-white font-bold text-xl py-4 pb-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center mt-4 disabled:opacity-75 relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isSubmitting ? (
                             "جاري الإرسال..."
                          ) : (
                            <>
                              تأكيد الطلب الآن
                              <ShoppingCart className="w-6 h-6 animate-pulse" />
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
