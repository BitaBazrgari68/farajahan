import Link from 'next/link';
import { getProductCategories } from '@/lib/wordpress/categories';

export default async function ProductCategories() {
  const categories = await getProductCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            دسته‌بندی محصولات
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="rounded-xl border p-6 transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">
                {category.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {category.count} محصول
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}