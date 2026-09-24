'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TopBar() {
  const params = useParams();
  const currentLocale = params?.locale || 'fa';

  return (
    <div className="bg-coffee-dark text-cream">
      <div className="container mx-auto flex items-center justify-center px-4 py-2 text-sm">

        {/* Language Switcher */}
        <div className="flex items-center gap-3">

          {/* Persian */}
          <Link
            href="/fa"
            className={`
              flex items-center gap-2 transition-all duration-300
              ${
                currentLocale === 'fa'
                  ? 'text-gold font-bold'
                  : 'text-cream hover:text-gold-light'
              }
            `}
          >
            <span className="fi fi-ir text-base"></span>
            <span>فارسی</span>
          </Link>


          {/* Divider */}
          <div className="h-4 w-px bg-gold-dark"></div>


          {/* English */}
          <Link
            href="/en"
            className={`
              flex items-center gap-2 transition-all duration-300
              ${
                currentLocale === 'en'
                  ? 'text-gold font-bold'
                  : 'text-cream hover:text-gold-light'
              }
            `}
          >
            <span className="fi fi-gb text-base"></span>
            <span>English</span>
          </Link>


        </div>

      </div>
    </div>
  );
}