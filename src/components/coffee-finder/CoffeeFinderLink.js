'use client';

import Link from 'next/link';
import { clearCoffeeFinderProgress } from '@/lib/coffeeFinderStorage';

// لینک به باریستای فراجهان.
// هر لینکی که از جای دیگر سایت به فایندر می‌رود باید از این کامپوننت استفاده کند،
// تا پیشرفت قبلی پاک شود و کاربر از اول شروع کند.
// (در صفحه‌های سروری نمی‌شود تابع onClick به Link داد؛ برای همین این کامپوننت کلاینتی است.)
export default function CoffeeFinderLink({
    locale,
    className,
    children,
}) {
    return (
        <Link
            href={`/${locale}/coffee-finder`}
            onClick={clearCoffeeFinderProgress}
            className={className}
        >
            {children}
        </Link>
    );
}