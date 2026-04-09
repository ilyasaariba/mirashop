"use client";

import { useEffect, useState, useCallback, DragEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Users,
  LogOut,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Save,
} from "lucide-react";

/* ===================================================================
   TYPES
   =================================================================== */
type Lead = {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  quantity: number;
  order_status: string;
  created_at: string;
  products: { title: string } | null;
};

type Product = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
  display_order: number;
};

type View = "leads" | "products" | "categories" | "settings";

const STATUSES = ["Pending", "Confirmed", "Done"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_META: Record<
  Status,
  { label: string; color: string; headerBg: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "قيد الانتظار",
    color: "border-amber-400",
    headerBg: "bg-amber-50 border-b border-amber-200",
    icon: <Clock className="w-4 h-4 text-amber-500" />,
  },
  Confirmed: {
    label: "مؤكد",
    color: "border-blue-400",
    headerBg: "bg-blue-50 border-b border-blue-200",
    icon: <PackageCheck className="w-4 h-4 text-blue-500" />,
  },
  Done: {
    label: "مكتمل",
    color: "border-green-400",
    headerBg: "bg-green-50 border-b border-green-200",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  },
};

/* ===================================================================
   MAIN COMPONENT
   =================================================================== */
export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<View>("leads");

  /* ── Auth bootstrap ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-indigo-700 text-lg tracking-tight">
            <LayoutDashboard className="w-5 h-5" />
            Mirashop Admin
          </div>

          {/* Nav */}
          <nav className="flex gap-1">
            {(
              [
                { key: "leads", label: "الطلبات", icon: <Users className="w-4 h-4" /> },
                { key: "products", label: "المنتجات", icon: <ShoppingBag className="w-4 h-4" /> },
                { key: "categories", label: "الأقسام", icon: <Tag className="w-4 h-4" /> },
                { key: "settings", label: "الإعدادات", icon: <Settings className="w-4 h-4" /> },
              ] as { key: View; label: string; icon: React.ReactNode }[]
            ).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  view === key
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        {view === "leads" && <LeadsView />}
        {view === "products" && <ProductsView />}
        {view === "categories" && <CategoriesView />}
        {view === "settings" && <SettingsView />}
      </main>
    </div>
  );
}

/* ===================================================================
   LOGIN FORM
   =================================================================== */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4">
            <LayoutDashboard className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Mirashop Admin</h1>
          <p className="text-slate-500 text-sm mt-1">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error === "Invalid login credentials"
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
              : error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mirashop.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===================================================================
   LEADS VIEW — Kanban Board
   =================================================================== */
function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, full_name, phone, city, address, quantity, order_status, created_at, products(title)")
      .order("created_at", { ascending: false });
    setLeads((data as unknown as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (!lead || lead.order_status === status) {
      setDragId(null);
      return;
    }
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === dragId ? { ...l, order_status: status } : l))
    );
    await supabase.from("leads").update({ order_status: status }).eq("id", dragId);
    setDragId(null);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        إدارة الطلبات
        <span className="ml-2 text-sm font-normal text-slate-400">
          ({leads.length} طلب إجمالاً)
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map((status) => {
          const colLeads = leads.filter((l) => l.order_status === status);
          const meta = STATUS_META[status];
          return (
            <div
              key={status}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
              className={`bg-white rounded-2xl border-t-4 ${meta.color} shadow-sm flex flex-col min-h-[400px]`}
            >
              {/* Column header */}
              <div className={`${meta.headerBg} px-4 py-3 rounded-t-xl flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <span className="font-bold text-slate-700 text-sm">{meta.label}</span>
                </div>
                <span className="bg-white text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-slate-200">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    <GripVertical className="w-6 h-6 mb-1" />
                    اسحب البطاقات هنا
                  </div>
                )}
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    className={`bg-white border border-slate-200 rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all select-none ${
                      dragId === lead.id ? "opacity-40 scale-95" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-slate-800 text-sm">{lead.full_name}</p>
                      <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md w-fit mb-2">
                      {lead.products?.title ?? "—"}
                    </p>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>📞 {lead.phone}</p>
                      <p>📍 {lead.city}</p>
                      <p>🔢 الكمية: <span className="font-bold text-slate-700">{lead.quantity ?? 1}</span></p>
                      <p className="text-slate-400">
                        {new Date(lead.created_at).toLocaleDateString("ar-MA")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================================
   PRODUCTS VIEW
   =================================================================== */
function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from("products")
        .select("id, title, price, image_url, is_active, category_id")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, display_order").order("display_order"),
    ]);
    setProducts(prods ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    setSaving(true);
    await supabase.from("products").insert({
      title,
      image_url: imageUrl || null,
      description,
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      category_id: categoryId || null,
      is_active: true,
    });
    setTitle("");
    setImageUrl("");
    setDescription("");
    setPrice("");
    setOldPrice("");
    setCategoryId("");
    await fetchAll();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    setDeletingId(id);
    await supabase.from("products").delete().eq("id", id);
    setProducts((p) => p.filter((x) => x.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Add Product Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          إضافة منتج جديد
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              اسم المنتج *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حذاء رياضي"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              رابط الصورة الرئيسية
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              السعر (درهم) *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              السعر القديم (اختياري)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              placeholder="450"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              القسم
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— بدون قسم —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر للمنتج..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-60 text-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving ? "جاري الإضافة..." : "إضافة المنتج"}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            قائمة المنتجات
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({products.length})
            </span>
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">لا توجد منتجات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-700 line-clamp-1">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">
                      {p.price} <span className="text-xs font-normal text-slate-400">درهم</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.is_active ? "نشط" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================================
   CATEGORIES VIEW
   =================================================================== */
function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragCatId, setDragCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  const [name, setName] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("id, name, display_order")
      .order("display_order");
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const nextOrder = categories.length;
    await supabase.from("categories").insert({
      name,
      display_order: nextOrder,
    });
    setName("");
    await fetchCategories();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا القسم؟ سيتم إلغاء ربط المنتجات به.")) return;
    setDeletingId(id);
    await supabase.from("products").update({ category_id: null }).eq("category_id", id);
    await supabase.from("categories").delete().eq("id", id);
    const updated = categories.filter((x) => x.id !== id).map((c, i) => ({ ...c, display_order: i }));
    setCategories(updated);
    // Re-persist orders after deletion
    await Promise.all(
      updated.map((c) =>
        supabase.from("categories").update({ display_order: c.display_order }).eq("id", c.id)
      )
    );
    setDeletingId(null);
  };

  /* ── Drag & Drop handlers ── */
  const onCatDragStart = (e: DragEvent<HTMLTableRowElement>, id: string) => {
    setDragCatId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onCatDragOver = (e: DragEvent<HTMLTableRowElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCatId(id);
  };

  const onCatDrop = async (e: DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault();
    if (!dragCatId || dragCatId === targetId) {
      setDragCatId(null);
      setDragOverCatId(null);
      return;
    }

    const fromIndex = categories.findIndex((c) => c.id === dragCatId);
    const toIndex = categories.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const withNewOrders = reordered.map((c, i) => ({ ...c, display_order: i }));

    // Optimistic update
    setCategories(withNewOrders);
    setDragCatId(null);
    setDragOverCatId(null);

    // Persist to DB
    setReordering(true);
    await Promise.all(
      withNewOrders.map((c) =>
        supabase.from("categories").update({ display_order: c.display_order }).eq("id", c.id)
      )
    );
    setReordering(false);
  };

  const onCatDragEnd = () => {
    setDragCatId(null);
    setDragOverCatId(null);
  };

  return (
    <div className="space-y-8">
      {/* Add Category Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          إضافة قسم جديد
        </h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              اسم القسم *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: إلكترونيات"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-60 text-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {saving ? "جاري الإضافة..." : "إضافة القسم"}
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            الأقسام الحالية
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({categories.length})
            </span>
          </h2>
          {reordering && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              جاري الحفظ...
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">لا توجد أقسام بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <p className="text-xs text-slate-400 px-5 pt-3 pb-1">💡 اسحب الصفوف لإعادة ترتيب الأقسام</p>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3 w-8" />
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    اسم القسم
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    draggable
                    onDragStart={(e) => onCatDragStart(e, cat.id)}
                    onDragOver={(e) => onCatDragOver(e, cat.id)}
                    onDrop={(e) => onCatDrop(e, cat.id)}
                    onDragEnd={onCatDragEnd}
                    className={`transition-colors cursor-grab active:cursor-grabbing select-none ${
                      dragCatId === cat.id
                        ? "opacity-40 bg-indigo-50"
                        : dragOverCatId === cat.id
                        ? "bg-indigo-50 border-t-2 border-indigo-400"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <GripVertical className="w-4 h-4 text-slate-300" />
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">#{cat.display_order + 1}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================================
   SETTINGS VIEW
   =================================================================== */
type StoreSettings = {
  id: string;
  whatsapp_number: string;
  contact_email: string;
  footer_text: string;
};

function SettingsView() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings(data as StoreSettings);
          setWhatsapp(data.whatsapp_number ?? "");
          setEmail(data.contact_email ?? "");
          setFooterText(data.footer_text ?? "");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await supabase
      .from("store_settings")
      .update({
        whatsapp_number: whatsapp,
        contact_email: email,
        footer_text: footerText,
      })
      .eq("id", settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-500" />
        إعدادات المتجر
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              رقم واتساب
              <span className="text-slate-400 font-normal text-xs mr-2">(مثال: 212612345678)</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="212612345678"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              أدخل الرقم بصيغة دولية بدون + (يُستخدم في زر واتساب وفي الفوتر)
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              البريد الإلكتروني للتواصل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="support@mirashop.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Footer text */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              نص الفوتر (حقوق النشر)
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="© 2026 ميراشوب — جميع الحقوق محفوظة."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-60 text-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>

            {saved && (
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                تم الحفظ بنجاح!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
