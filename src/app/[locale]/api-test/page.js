import { getProductCategories } from '@/lib/wordpress/categories';

export default async function ApiTestPage() {
  const categories = await getProductCategories();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        WooCommerce Categories API Test
      </h1>

      <pre className="overflow-auto rounded-lg bg-gray-100 p-6 text-sm">
        {JSON.stringify(categories, null, 2)}
      </pre>
    </main>
  );
}