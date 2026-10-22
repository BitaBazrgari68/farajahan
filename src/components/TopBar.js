'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

// آدرس همین صفحه در زبان دیگر. صفحه‌ی محصول در هر زبان slug جدا دارد،
// پس با عوض شدن زبان به فروشگاه همان زبان می‌رود.
function getSwitchedPath(pathname, locale) {
  const segments = (pathname || '/').split('/');

  segments[1] = locale;

  if (segments[2] === 'product') {
    return `/${locale}/shop`;
  }

  return segments.join('/') || `/${locale}`;
}

export default function TopBar() {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = params?.locale || 'fa';

  return (
    <div className="bg-coffee-dark text-cream">
      <div className="container mx-auto flex items-center justify-center px-4 py-2 text-sm">

        {/* Language Switcher */}
        <div className="flex items-center gap-3">

          {/* Persian */}
          <Link
            href={getSwitchedPath(pathname, 'fa')}
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
            href={getSwitchedPath(pathname, 'en')}
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