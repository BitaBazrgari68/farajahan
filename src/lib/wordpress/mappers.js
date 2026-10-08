export function mapWooProduct(product) {
    const image = product.images?.[0];

    const weightAttribute = product.attributes?.find(
        (attribute) => attribute.name === 'وزن'
    );

    const isVariable = product.type === 'variable';

    // ویژگی‌ای که تنوع‌ها بر پایه‌ی آن ساخته شده‌اند (مثلاً «انتخاب میزان آسیاب»)
    const variationAttributes = isVariable
        ? (product.attributes || []).filter(
            (attribute) => attribute.has_variations
        )
        : [];

    return {
        id: product.id,

        name: product.name,

        slug: product.slug,

        href: product.permalink,

        type: product.type,

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

        // فقط وقتی گزینه‌های کالای متغیر قیمت متفاوت دارند پر می‌شود
        priceRange: product.prices?.price_range
            ? {
                min: Number(product.prices.price_range.min_amount || 0),
                max: Number(product.prices.price_range.max_amount || 0),
            }
            : null,

        sale: {
            active: product.on_sale,
            value: Number(product.prices?.sale_price || 0),
        },

        stock: {
            available: product.is_in_stock,
            purchasable: product.is_purchasable,
        },

        // اگر وزن خودش ویژگی تنوع‌ساز باشد، فقط اولین مقدارش را نشان نمی‌دهیم
        weight: weightAttribute?.has_variations
            ? null
            : weightAttribute?.terms?.[0]?.name || null,

        // نام ویژگی تنوع‌ساز و فهرست گزینه‌ها (فقط برای کالای متغیر)
        variationAttributeName:
            variationAttributes.map((attribute) => attribute.name).join(' / ') ||
            null,

        variations: isVariable
            ? (product.variations || []).map((variation) => ({
                id: variation.id,
                label:
                    variation.attributes
                        ?.map((attribute) => attribute.value)
                        .filter(Boolean)
                        .join(' / ') || String(variation.id),
            }))
            : [],

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