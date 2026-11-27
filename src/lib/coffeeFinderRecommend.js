import { mapWooProduct } from '@/lib/wordpress/mappers';
import { isPhoneOrder } from '@/lib/phoneOrder';
import { coffeeFinderQuestions } from '@/data/coffeeFinder';

export const MAX_RESULTS = 3;

/* ============================================================
   یکدست‌سازی متن
   ارقام فارسی و عربی، نیم‌فاصله، فاصله و اعراب حذف می‌شود تا
   «میوه ای» و «میوه‌ای» یا «کلد برو» و «کلدبرو» یکی حساب شوند.
============================================================ */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function normalize(value) {
    return String(value ?? '')
        .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
        .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d))
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[\u200c\u200e\u200f\s]/g, '')
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .toLowerCase();
}

function toNumber(value) {
    const number = parseFloat(
        normalize(value).replace(/[٫,]/g, '.')
    );

    return Number.isFinite(number) ? number : null;
}

const keyed = (entries) =>
    new Map(
        Object.entries(entries).map(([key, id]) => [normalize(key), id])
    );

/* ============================================================
   نام ویژگی‌ها و مقدارهای شناخته‌شده (همان که در ووکامرس ثبت شده)
============================================================ */

const ATTR = {
    type: normalize('نوع محصول'),
    arabica: normalize('درصد عربیکا'),
    // «شدت» در ووکامرس یعنی اسیدیته
    acidity: normalize('شدت'),
    flavors: normalize('طعم غالب'),
    services: normalize('مناسب سرویس'),
    pack: normalize('وزن بسته (کیلوگرم)'),
    powderKind: normalize('نوع نوشیدنی پودری'),
};

const KIND_IDS = keyed({
    'دانه قهوه': 'beans',
    پودری: 'powder',
    'قهوه فوری': 'instant',
    'نوشیدنی میوه ای': 'juice',
});

const FLAVOR_IDS = keyed({
    شکلاتی: 'chocolate',
    آجیلی: 'nutty',
    'میوه ای': 'fruity',
    شیرین: 'sweet',
    تلخ: 'bitter',
    ترش: 'sour',
    کاراملی: 'caramel',
    گلی: 'floral',
    مرکباتی: 'citrus',
    'ادویه ای': 'spicy',
});

const SERVICE_IDS = keyed({
    اسپرسو: 'espresso',
    'نوشیدنی شیری': 'milkBased',
    'قهوه دمی': 'filter',
    'کلد برو': 'coldBrew',
});

const POWDER_IDS = keyed({
    کاپوچینو: 'cappuccino',
    'شکلات داغ': 'hotChocolate',
    ماسالا: 'masala',
    'چای کرک': 'chaiKarak',
    'کافی میکس': 'coffeeMix',
});

// نام گزینه‌های تنوع آسیاب در ووکامرس برای هر روش دم
const GRIND_LABELS = {
    espresso: ['اسپرسو ماشین خانگی'],
    mokaPot: ['موکاپات'],
    filter: ['فیلتر ماشین'],
    frenchPress: ['فرنچ پرس'],
    aeropress: ['اروپرس', 'آئروپرس', 'ایروپرس'],
    chemex: ['کمکس'],
    v60: ['V60'],
    turkish: ['سایر'],
};

const WHOLE_BEANS_PREFIX = normalize('بدون آسیاب');

/* ============================================================
   جدول‌های امتیازدهی
============================================================ */

// پاسخ «شدت» به درصد عربیکای مطلوب (عربیکای بیشتر یعنی ملایم‌تر)
const INTENSITY_TARGET_ARABICA = {
    mild: 100,
    balanced: 60,
    strong: 25,
    veryStrong: 0,
};

// جایگاه مطلوب قیمت هر کیلو بین محصولات (۰ ارزان‌ترین، ۱ گران‌ترین)
const BUDGET_TARGET = {
    economy: 0,
    medium: 0.5,
    professional: 0.85,
};

// اندازه‌ی بسته‌ی مناسب (کیلوگرم) برای مصرف ماهانه‌ی کافه
const CAFE_TARGET_KG = {
    lessThan5kg: 1.5,
    '5To15kg': 5,
    '15To30kg': 10,
    '30To50kg': 15,
    '50To100kg': 15,
    moreThan100kg: 15,
};

// اندازه‌ی بسته‌ی مناسب برای تعداد افراد دفتر
const OFFICE_TARGET_KG = {
    oneToFive: 1.5,
    sixToFifteen: 4,
    sixteenToThirty: 8,
    thirtyOneToFifty: 12,
    moreThanFifty: 15,
};

const POWDER_TARGET_KG = {
    small: 0.25,
    one: 1,
    large: 1.75,
};

const WEIGHTS = {
    strength: 0.4,
    flavor: 0.25,
    pack: 0.2,
    budget: 0.15,
};

const clamp01 = (number) => Math.min(1, Math.max(0, number));

// فاصله‌ی لگاریتمی دو اندازه‌ی بسته: ۱ یعنی یکی، ۰ یعنی ۱۵ برابر فاصله
function packScore(packKg, targetKg) {
    if (!packKg || !targetKg) return null;

    return clamp01(
        1 - Math.abs(Math.log(packKg / targetKg)) / Math.log(15)
    );
}

/* ============================================================
   خواندن محصول ووکامرس
============================================================ */

export function parseFinderProduct(raw) {
    const attributes = new Map();

    for (const attribute of raw?.attributes || []) {
        attributes.set(
            normalize(attribute.name),
            (attribute.terms || [])
                .map((term) => String(term?.name ?? '').trim())
                .filter(Boolean)
        );
    }

    const values = (key) => attributes.get(key) || [];

    const idsOf = (key, dictionary) =>
        values(key)
            .map((value) => dictionary.get(normalize(value)))
            .filter(Boolean);

    const kinds = idsOf(ATTR.type, KIND_IDS);

    const kind =
        ['beans', 'powder', 'instant', 'juice'].find((item) =>
            kinds.includes(item)
        ) || null;

    const mapped = mapWooProduct(raw);

    const eligible =
        Boolean(kind) &&
        kind !== 'juice' &&
        raw.is_in_stock !== false &&
        raw.is_purchasable !== false &&
        !isPhoneOrder(mapped) &&
        mapped.price.value > 0;

    return {
        id: raw.id,
        slug: raw.slug,
        name: raw.name,
        kind,
        eligible,

        type: mapped.type,
        price: mapped.price.value,
        image: mapped.image?.src || null,
        variations: mapped.variations,

        packKg: toNumber(values(ATTR.pack)[0]),
        arabica: toNumber(values(ATTR.arabica)[0]),
        acidity: toNumber(values(ATTR.acidity)[0]),
        flavors: idsOf(ATTR.flavors, FLAVOR_IDS),
        services: idsOf(ATTR.services, SERVICE_IDS),
        powderKind: idsOf(ATTR.powderKind, POWDER_IDS)[0] || null,
    };
}

/* ============================================================
   ورودی کاربر
============================================================ */

export function sanitizeInput(body) {
    if (!body || typeof body !== 'object') return null;

    const businessType = Object.keys(coffeeFinderQuestions).includes(
        body.businessType
    )
        ? body.businessType
        : null;

    if (!businessType) return null;

    const answers = {};

    for (const question of coffeeFinderQuestions[businessType]) {
        const value = body.answers?.[question.id];

        if (question.type === 'multiple') {
            answers[question.id] = Array.isArray(value)
                ? value.filter((item) => question.options.includes(item))
                : [];
        } else if (question.options.includes(value)) {
            answers[question.id] = value;
        }
    }

    return {
        businessType,
        answers,
        lang: body.lang === 'en' ? 'en' : 'fa',
    };
}

// پاسخ‌ها را به «قصد خرید» تبدیل می‌کند
function readIntent({ businessType, answers: a }) {
    if (businessType === 'wholesale') {
        return { mode: 'contact' };
    }

    if (businessType === 'home') {
        if (a.homeProductKind === 'powder') {
            return {
                mode: 'powder',
                powderKind: a.powderKind,
                powderSize: a.powderSize,
            };
        }

        if (a.homeProductKind === 'instant') {
            return { mode: 'instant' };
        }

        const wantsWholeBeans =
            a.hasGrinder === 'yes' ||
            !a.brewMethod ||
            a.brewMethod === 'none';

        return {
            mode: 'beans',
            intensity: a.intensity,
            flavors: a.flavors || [],
            budget: a.budget,
            service: null,
            targetKg: null,
            // کاربر خانگی فقط بسته‌های کوچک را می‌بیند
            maxPackKg: 2,
            grind: wantsWholeBeans ? 'whole' : a.brewMethod,
        };
    }

    if (businessType === 'cafe') {
        return {
            mode: 'beans',
            intensity: a.intensity,
            flavors: a.customerFlavor || [],
            budget: a.monthlyBudget,
            service: a.serviceType || null,
            targetKg: CAFE_TARGET_KG[a.monthlyCoffeeConsumption] || null,
            maxPackKg: null,
            grind: 'whole',
        };
    }

    // office
    const method = a.officeBrewMethod;

    if (method === 'instant') return { mode: 'instant' };
    if (method === 'capsule') return { mode: 'none' };

    return {
        mode: 'beans',
        intensity: a.intensity,
        flavors: a.officeFlavor || [],
        budget: a.officeBudget,
        service:
            { espressoMachine: 'espresso', filter: 'filter' }[method] ||
            null,
        targetKg: OFFICE_TARGET_KG[a.numberOfUsers] || null,
        maxPackKg: null,
        grind:
            method === 'filter'
                ? 'filter'
                : method === 'mokaPot'
                  ? 'mokaPot'
                  : 'whole',
    };
}

/* ============================================================
   امتیازدهی دانه‌ی قهوه و میکس
============================================================ */

function flavorScore(product, wanted) {
    let sum = 0;
    const matched = [];

    for (const id of wanted) {
        let value;

        // ترش بودن را از اسیدیته می‌خوانیم، چون پیوسته است
        if (id === 'sour' && product.acidity != null) {
            value = clamp01(product.acidity / 5);
        } else {
            value = product.flavors.includes(id) ? 1 : 0;
        }

        sum += value;

        if (value >= 0.6) matched.push(id);
    }

    return { score: sum / wanted.length, matched };
}

function pricePerKg(product) {
    return product.packKg ? product.price / product.packKg : null;
}

function rankBeans(products, intent) {
    let pool = products.filter((product) => product.kind === 'beans');

    if (intent.maxPackKg) {
        pool = pool.filter(
            (product) => (product.packKg ?? Infinity) <= intent.maxPackKg
        );
    }

    // نوع سرویس شرط سخت است، مگر اینکه هیچ محصولی با آن نخواند
    if (intent.service) {
        const matching = pool.filter((product) =>
            product.services.includes(intent.service)
        );

        if (matching.length > 0) pool = matching;
    }

    if (pool.length === 0) return [];

    const perKg = pool.map(pricePerKg).filter((n) => n != null);
    const minPrice = Math.min(...perKg);
    const maxPrice = Math.max(...perKg);

    const budgetTarget = BUDGET_TARGET[intent.budget];

    const scored = pool.map((product) => {
        const parts = {};

        if (intent.intensity) {
            parts.strength =
                product.arabica == null
                    ? 0.5
                    : clamp01(
                          1 -
                              Math.abs(
                                  INTENSITY_TARGET_ARABICA[intent.intensity] -
                                      product.arabica
                              ) /
                                  70
                      );
        }

        let matchedFlavors = [];

        if (intent.flavors.length > 0) {
            const flavor = flavorScore(product, intent.flavors);

            parts.flavor = flavor.score;
            matchedFlavors = flavor.matched;
        }

        if (intent.targetKg) {
            parts.pack = packScore(product.packKg, intent.targetKg) ?? 0.5;
        }

        const own = pricePerKg(product);

        if (budgetTarget !== undefined && own != null) {
            const position =
                maxPrice === minPrice
                    ? 0.5
                    : (own - minPrice) / (maxPrice - minPrice);

            parts.budget = clamp01(1 - Math.abs(position - budgetTarget));
        }

        const used = Object.keys(parts);
        const totalWeight = used.reduce((sum, key) => sum + WEIGHTS[key], 0);

        const score = totalWeight
            ? used.reduce((sum, key) => sum + WEIGHTS[key] * parts[key], 0) /
              totalWeight
            : 0.5;

        return { product, score, parts, matchedFlavors };
    });

    scored.sort(
        (a, b) => b.score - a.score || a.product.id - b.product.id
    );

    return scored;
}

/* ============================================================
   تنوع آسیاب
============================================================ */

function pickVariation(product, grind) {
    if (product.variations.length === 0) return null;

    const options = product.variations.map((variation) => ({
        variation,
        label: normalize(variation.label),
    }));

    if (grind === 'whole') {
        return (
            options.find((option) =>
                option.label.startsWith(WHOLE_BEANS_PREFIX)
            )?.variation || null
        );
    }

    const accepted = (GRIND_LABELS[grind] || []).map(normalize);

    return (
        options.find((option) => accepted.includes(option.label))
            ?.variation || null
    );
}

/* ============================================================
   پودری‌ها
============================================================ */

function rankPowders(products, intent) {
    const pool = products.filter(
        (product) =>
            product.kind === 'powder' &&
            product.powderKind === intent.powderKind
    );

    const target = POWDER_TARGET_KG[intent.powderSize];

    return pool
        .map((product) => ({
            product,
            score: (target && packScore(product.packKg, target)) ?? 0.5,
        }))
        .sort((a, b) => b.score - a.score || a.product.id - b.product.id);
}

/* ============================================================
   خروجی
============================================================ */

function beanReasons(item, intent, variation) {
    const reasons = [];

    if (variation) {
        reasons.push(
            intent.grind === 'whole'
                ? { key: 'wholeBeans' }
                : { key: 'grind', method: intent.grind }
        );
    }

    if (item.parts.strength >= 0.6) {
        reasons.push({ key: 'strength', intensity: intent.intensity });
    }

    if (item.matchedFlavors.length > 0) {
        reasons.push({ key: 'flavors', flavors: item.matchedFlavors });
    }

    if (intent.service && item.product.services.includes(intent.service)) {
        reasons.push({ key: 'service', service: intent.service });
    }

    if (item.parts.pack >= 0.7) {
        reasons.push({ key: 'pack', kg: item.product.packKg });
    }

    if (item.parts.budget >= 0.7) {
        reasons.push({ key: 'budget' });
    }

    return reasons.slice(0, 3);
}

function toResult(product, variation, reasons) {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        type: product.type,
        packKg: product.packKg,
        variations: product.variations,
        suggestedVariationId: variation?.id ?? null,
        reasons,
    };
}

export function recommend(input, rawProducts) {
    const intent = readIntent(input);

    if (intent.mode === 'contact') return { mode: 'contact', products: [] };
    if (intent.mode === 'none') return { mode: 'none', products: [] };

    const products = rawProducts
        .map(parseFinderProduct)
        .filter((product) => product.eligible);

    if (intent.mode === 'powder') {
        const ranked = rankPowders(products, intent).slice(0, MAX_RESULTS);

        return {
            mode: 'powder',
            products: ranked.map(({ product }) =>
                toResult(product, null, [
                    { key: 'powderKind', kind: intent.powderKind },
                    { key: 'powderSize', kg: product.packKg },
                ])
            ),
        };
    }

    if (intent.mode === 'instant') {
        return {
            mode: 'instant',
            products: products
                .filter((product) => product.kind === 'instant')
                .slice(0, MAX_RESULTS)
                .map((product) =>
                    toResult(product, null, [{ key: 'instant' }])
                ),
        };
    }

    const ranked = rankBeans(products, intent).slice(0, MAX_RESULTS);

    return {
        mode: 'beans',
        products: ranked.map((item) => {
            const variation = pickVariation(item.product, intent.grind);

            return toResult(
                item.product,
                variation,
                beanReasons(item, intent, variation)
            );
        }),
    };
}