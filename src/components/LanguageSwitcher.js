'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();

  const currentLocale = params?.locale || 'fa';

  const languages = [
    {
      code: 'fa',
      name: 'فارسی',
      flag: '🇮🇷',
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'ar',
      name: 'العربية',
      flag: '🇸🇦',
    },
  ];


  const switchLanguage = (locale) => {
    const segments = pathname.split('/');

    segments[1] = locale;

    return segments.join('/');
  };


  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale)
    || languages[0];


  return (
    <div className="relative group">

      {/* Current Language */}
      <button
        className="
          flex items-center gap-2
          text-coffee-dark
          hover:text-gold
          transition
        "
      >
        <span className="text-lg">
          {currentLanguage.flag}
        </span>

        <span>
          {currentLanguage.name}
        </span>

        <ChevronDown size={16} />
      </button>


      {/* Dropdown */}
      <div
        className="
          absolute right-0 top-full mt-3
          w-40
          bg-background
          border border-cream
          shadow-lg
          rounded-xl
          overflow-hidden

          opacity-0
          invisible

          group-hover:opacity-100
          group-hover:visible

          transition-all duration-200
          z-50
        "
      >

        {languages.map((language) => (

          <Link
            key={language.code}
            href={switchLanguage(language.code)}
            className={`
              flex items-center gap-3
              px-4 py-3
              transition

              ${
                currentLocale === language.code
                ? 'bg-cream text-gold font-bold'
                : 'text-coffee-dark hover:bg-gold-light'
              }
            `}
          >

            <span className="text-lg">
              {language.flag}
            </span>

            <span>
              {language.name}
            </span>

          </Link>

        ))}

      </div>

    </div>
  );
}