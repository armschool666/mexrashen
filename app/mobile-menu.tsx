"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";

export type MobileNavItem = {
  key: string;
  href: string;
  label: string;
  children?: { key: string; href: string; label: string }[];
};

export function MobileMenu({ items }: { items: MobileNavItem[] }) {
  const t = useTranslations("mobileMenu");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Keep --header-h CSS variable in sync with real header height
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    const update = () => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Close on click outside the nav and burger button
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        navRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Auto-close on scroll so the menu never obscures content mid-scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => close();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <>
      <button
        ref={btnRef}
        className={`burger-btn${open ? " burger-btn--open" : ""}`}
        aria-label={open ? t("closeLabel") : t("openLabel")}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="mobile-nav"
        ref={navRef}
        className={`mobile-nav${open ? " mobile-nav--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-nav-body">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded === item.key;

            if (!hasChildren) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={close}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.key} className="mobile-nav-group">
                <button
                  className={`mobile-nav-toggle${isExpanded ? " mobile-nav-toggle--open" : ""}`}
                  onClick={() => setExpanded(isExpanded ? null : item.key)}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow">{isExpanded ? "▴" : "▾"}</span>
                </button>
                {isExpanded && (
                  <div className="mobile-nav-sub">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="mobile-nav-sub-link"
                        onClick={close}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
