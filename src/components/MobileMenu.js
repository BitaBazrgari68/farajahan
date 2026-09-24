'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const currentLocale = params?.locale || 'fa';

  const menuItems = [
    { label: currentLocale === 'fa' ? 'فروشگاه' : 'Shop', href: '#' },
    { label: currentLocale === 'fa' ? 'قهوه تخصصی' : 'Specialty Coffee', href: '#' },
    { label: currentLocale === 'fa' ? 'قهوه فوری' : 'Instant Coffee', href: '#' },
    { label: currentLocale === 'fa' ? 'وبلاگ' : 'Blog', href: '#' },
    { label: currentLocale === 'fa' ? 'درباره ما' : 'About Us', href: '#' },
    { label: currentLocale === 'fa' ? 'تماس باما' : 'Contact', href: '#' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col gap-1.5 focus:outline-none"
      >
        <span
          className={`w-6 h-0.5 bg-slate-700 transition-all ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-slate-700 transition-all ${
            isOpen ? 'opacity-0' : ''
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-slate-700 transition-all ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        ></span>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
          <nav className="flex flex-col p-4 gap-2">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="text-slate-700 hover:text-amber-600 py-2 px-3 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}