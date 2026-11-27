import { wordpressFetch } from './client';

// همه‌ی محصولات فروشگاه برای امتیازدهی فایندر.
// ویژگی‌ها (نوع محصول، درصد عربیکا، طعم و ...) مستقیم از ووکامرس خوانده می‌شود،
// پس هر ویرایش در پیشخوان بعد از حداکثر ۶۰ ثانیه اعمال می‌شود.
export async function getFinderProducts(locale = 'fa') {
  const params = new URLSearchParams({
    per_page: '100',
    lang: locale,
  });

  const products = await wordpressFetch(
    `wc/store/v1/products?${params.toString()}`,
    {
      next: { revalidate: 60 },
    }
  );

  return Array.isArray(products) ? products : [];
}