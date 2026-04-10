"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const FALLBACK_PHONE = "212768186124"; // always shows even if DB fetch fails

export default function WhatsAppButton() {
  const [phone, setPhone] = useState<string>(FALLBACK_PHONE);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("whatsapp_number")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_number) setPhone(data.whatsapp_number);
      });
  }, []);

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="whatsapp-fab"
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="white"
        aria-hidden="true"
      >
        <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.13.562 4.195 1.604 6.012L.412 22.428l4.524-1.186c1.761.968 3.766 1.488 5.766 1.488 6.647 0 12.03-5.383 12.03-12.03S18.678 0 12.031 0zm0 20.73c-1.77 0-3.504-.476-5.027-1.378l-.36-.214-3.364.882.898-3.277-.235-.373a10.024 10.024 0 0 1-1.536-5.337c0-5.545 4.512-10.059 10.056-10.059 5.545 0 10.056 4.514 10.056 10.059.001 5.543-4.512 10.058-10.056 10.058zm5.518-7.532c-.302-.151-1.791-.884-2.068-.985-.276-.1-.476-.151-.678.151-.202.302-.782.985-.959 1.187-.176.202-.352.226-.654.075-1.428-.707-2.585-1.554-3.415-3.003-.211-.365.203-.339.783-1.498.075-.151.038-.276-.025-.427-.062-.151-.678-1.637-.931-2.24-.244-.582-.493-.504-.678-.513-.176-.009-.377-.009-.578-.009-.202 0-.528.076-.805.377-.276.302-1.056 1.031-1.056 2.515 0 1.484 1.081 2.918 1.233 3.119.151.202 2.128 3.245 5.158 4.553 1.942.84 2.651.905 3.535.83.69-.059 1.791-.73 2.043-1.436.251-.707.251-1.309.176-1.436-.077-.127-.277-.202-.579-.353z" />
      </svg>
      <span className="whatsapp-fab-pulse" />
    </a>
  );
}
