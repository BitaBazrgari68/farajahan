import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
    const formattedPrice = product.price.value.toLocaleString('fa-IR');

    return (
        <article className="group">
            {/* Product Image */}
            <Link href={product.href} className="block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
                    {product.image ? (
                        <Image
                            src={product.image.src}
                            alt={product.image.alt || product.name}
                            fill
                            unoptimized
                            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-text-muted">
                            بدون تصویر
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="mt-4">
                <Link href={product.href}>
                    <h2 className="font-sans text-base font-semibold leading-7 text-coffee-dark transition-colors group-hover:text-coffee">
                        {product.name}
                    </h2>
                </Link>

                {product.weight && (
                    <p className="mt-1 font-sans text-sm text-text-muted">
                        {product.weight}
                    </p>
                )}

                <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-sans text-base font-bold text-coffee-dark">
                        {formattedPrice}
                    </span>

                    <span className="font-sans text-sm text-text-muted">
                        {product.price.currency}
                    </span>
                </div>

                {!product.stock.available && (
                    <p className="mt-2 font-sans text-sm text-red-600">
                        ناموجود
                    </p>
                )}
            </div>
        </article>
    );
}