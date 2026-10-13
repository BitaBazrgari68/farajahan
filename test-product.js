import { getProductBySlug } from './src/lib/wordpress/products.js';

const slug = 'میکس-70-درصد-روبوستا-ویژه';

try {
  const product = await getProductBySlug(slug, 'fa');

  console.log(
    JSON.stringify(
      product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.prices?.price,
            image: product.images?.[0]?.src,
          }
        : null,
      null,
      2
    )
  );
} catch (error) {
  console.error('Product test failed:', error);
}