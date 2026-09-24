export function mapWooProduct(product) {
    const image = product.images?.[0];

    const weightAttribute = product.attributes?.find(
        (attribute) => attribute.name === 'وزن'
    );

    return {
        id: product.id,

        name: product.name,

        slug: product.slug,

        href: product.permalink,

        image: image
            ? {
                src: encodeURI(image.src),
                alt: image.alt || product.name,
            }
            : null,

        price: {
            value: Number(product.prices?.price || 0),
            currency: product.prices?.currency_symbol || '',
        },

        sale: {
            active: product.on_sale,
            value: Number(product.prices?.sale_price || 0),
        },

        stock: {
            available: product.is_in_stock,
            purchasable: product.is_purchasable,
        },

        weight: weightAttribute?.terms?.[0]?.name || null,

        rating: Number(product.average_rating || 0),

        reviewCount: Number(product.review_count || 0),

        // دسته‌بندی‌های محصول
        categories: product.categories?.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
        })) || [],
    };
}