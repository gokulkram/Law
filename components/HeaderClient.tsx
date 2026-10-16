"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/firm";
import Logo from "@/components/Logo";

// Firm phone/email come from the server wrapper (components/Header.tsx).
export default function HeaderClient({ phone, phoneHref, email }: { phone: string; phoneHref: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  // Free-review CTAs jump to the on-page form where there is one.
  const ctaHref = pathname === "/" ? "#contact" : pathname === "/contact" ? "#contact-form" : "/contact";

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar__left">
            <span>&#9742; <a href={phoneHref}>{phone}</a></span>
            <span>&#9993; <a href={`mailto:${email}`}>{email}</a></span>
          </div>
          <a className="topbar__cta" href={ctaHref}>Free Case Review - 24/7</a>
        </div>
      </div>

      <header className={`header${stuck ? " is-stuck" : ""}`}>
        <div className="container nav">
          <Link className="nav__logo" href="/" aria-label="California Law home">
            <Logo />
          </Link>
          <nav className={`nav__links${open ? " open" : ""}`} aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : undefined} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav__cta">
            <a className="btn btn--gold" href={ctaHref}>Free Consultation</a>
          </div>
          <button
            className={`nav__toggle${open ? " open" : ""}`}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
    </>
  );
}
