# E-commerce Architecture Blueprint

This document serves as the master blueprint for the high-converting e-commerce strategy developed for Mirashop. **Whenever you start a new software project, simply provide this file to the AI so it instantly knows your exact coding stack, database organization, and marketing integrations.**

## Core Technology Stack
- **Framework**: Next.js (App Router variant)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Analytics**: TikTok Pixel + Server-Side Events API 

---

## Database Schema (Supabase)
To recreate this infrastructure mathematically perfect, here are the core tables and columns needed:

### 1. `products`
*   `id` (uuid, primary key)
*   `title` (text)
*   `description` (text)
*   `price` (numeric)
*   `old_price` (numeric)
*   `image_url` (text)
*   `image_gallery` (text array)
*   `stock_quantity` (numeric)

### 2. `categories`
*   `id` (uuid, primary key)
*   `name` (text)
*   `slug` (text)

### 3. `leads` (The Sales Pipeline)
*   `id` (uuid, primary key)
*   `product_id` (uuid, foreign key)
*   `full_name` (text)
*   `phone` (text)
*   `city` (text)
*   `quantity` (numeric)
*   `status` (text: 'pending', 'confirmed', 'shipped', 'cancelled')

### 4. `store_settings`
*   `id` (integer, primary key)
*   `contact_whatsapp` (text)
*   `contact_email` (text)
*   `contact_phone` (text)

---

## Marketing Architecture (Advanced)

### TikTok Pixel & Events API (with Deduplication)
We utilized a hybrid tracking model to guarantee 100% conversion accuracy:
1. **Client Browser Funnel**: Standard `ttq.track` events installed for `ViewContent`, `AddToCart`, `InitiateCheckout`, and `Purchase`.
2. **Server-Side Tunnel**: A secure backend endpoint (`src/app/api/tiktok/route.ts`) that fires the `Purchase` event directly to TikTok's CAPI (Conversions API) to bypass iOS restrictions and Ad-Blockers.
3. **Deduplication Engine**: Both the client and server paths share an identical `event_id` string when verifying a single purchase. The payload also securely hashes the customer's phone number using `SHA-256` for Advanced Audience Matching.

---

## Next-Gen UI / UX Features Built

1. **Swipeable Image Carousel**: Main product images utilize CSS `snap-mandatory snap-x`. Active thumbnails synchronize perfectly with the customer's swiping gestures.
2. **Smart Auto-Hiding CTA**: An `IntersectionObserver` watches the main order form. When the customer naturally scrolls down to view the inputs, the glowing mobile sticky "Order Now" button automatically retracts to prevent visual overload.
3. **Frictionless One-Page Checkout**: Arabic-first psychology where the customer sees the product details, reviews, and immediately completes the order without ever changing web pages or seeing a shopping cart.

---

## How to use this Template for the Next Store
1. Clone this project folder completely.
2. Spin up a new Supabase Project.
3. Replace the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. Swap the `NEXT_PUBLIC_TIKTOK_PIXEL_ID` and `TIKTOK_ACCESS_TOKEN` in `.env.local`.
5. Update branding, deploy, and launch ads.
