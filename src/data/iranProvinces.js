// کد استان‌ها مطابق WooCommerce (country = IR)
export const IRAN_PROVINCES = [
    { code: "ABZ", fa: "البرز", en: "Alborz" },
    { code: "ADL", fa: "اردبیل", en: "Ardabil" },
    { code: "BHR", fa: "بوشهر", en: "Bushehr" },
    { code: "CHB", fa: "چهارمحال و بختیاری", en: "Chaharmahal and Bakhtiari" },
    { code: "EAZ", fa: "آذربایجان شرقی", en: "East Azerbaijan" },
    { code: "ESF", fa: "اصفهان", en: "Isfahan" },
    { code: "FRS", fa: "فارس", en: "Fars" },
    { code: "GIL", fa: "گیلان", en: "Gilan" },
    { code: "GLS", fa: "گلستان", en: "Golestan" },
    { code: "GZN", fa: "قزوین", en: "Qazvin" },
    { code: "HDN", fa: "همدان", en: "Hamadan" },
    { code: "HRZ", fa: "هرمزگان", en: "Hormozgan" },
    { code: "ILM", fa: "ایلام", en: "Ilam" },
    { code: "KBD", fa: "کهگیلویه و بویراحمد", en: "Kohgiluyeh and Boyer-Ahmad" },
    { code: "KHZ", fa: "خوزستان", en: "Khuzestan" },
    { code: "KRD", fa: "کردستان", en: "Kurdistan" },
    { code: "KRH", fa: "کرمانشاه", en: "Kermanshah" },
    { code: "KRN", fa: "کرمان", en: "Kerman" },
    { code: "LRS", fa: "لرستان", en: "Lorestan" },
    { code: "MKZ", fa: "مرکزی", en: "Markazi" },
    { code: "MZN", fa: "مازندران", en: "Mazandaran" },
    { code: "NKH", fa: "خراسان شمالی", en: "North Khorasan" },
    { code: "QHM", fa: "قم", en: "Qom" },
    { code: "RKH", fa: "خراسان رضوی", en: "Razavi Khorasan" },
    { code: "SBN", fa: "سیستان و بلوچستان", en: "Sistan and Baluchestan" },
    { code: "SKH", fa: "خراسان جنوبی", en: "South Khorasan" },
    { code: "SMN", fa: "سمنان", en: "Semnan" },
    { code: "THR", fa: "تهران", en: "Tehran" },
    { code: "WAZ", fa: "آذربایجان غربی", en: "West Azerbaijan" },
    { code: "YZD", fa: "یزد", en: "Yazd" },
    { code: "ZJN", fa: "زنجان", en: "Zanjan" },
];

export const IRAN_PROVINCE_CODES = new Set(
    IRAN_PROVINCES.map((p) => p.code)
);

export function getProvinceName(code, locale) {
    const province = IRAN_PROVINCES.find((p) => p.code === code);

    if (!province) return "";

    return locale === "fa" ? province.fa : province.en;
}