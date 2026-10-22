'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Menu"
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
          <nav className="flex flex-col p-4 gap-1">
            {items.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-2 px-3 font-medium text-coffee-dark hover:text-gold transition"
                >
                  {item.label}
                </Link>

                {item.submenu && (
                  <div className="ms-4 border-s border-cream">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={close}
                        className="block py-2 px-3 text-sm text-coffee-dark/80 hover:text-gold transition"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}