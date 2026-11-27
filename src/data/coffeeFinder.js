// سؤال‌های باریستای فراجهان.
// هر سؤال فقط به ویژگی‌ای وصل است که واقعاً روی محصولات ووکامرس ثبت شده؛
// سؤالی که نشود با آن محصولی را امتیاز داد، اینجا نیست.
//
// showWhen: سؤال فقط وقتی نمایش داده می‌شود که پاسخ سؤال دیگر
// یکی از مقدارهای فهرست باشد. مثال: { homeProductKind: ['beans'] }

const intensityOptions = ['mild', 'balanced', 'strong', 'veryStrong'];

// فقط طعم‌هایی که روی محصولات ثبت شده است.
// برای افزودن طعم تازه: گزینه را اینجا اضافه کنید و ترجمه‌اش را در fa.json و en.json
const flavorOptions = [
    'chocolate',
    'nutty',
    'fruity',
    'sweet',
    'bitter',
    'sour',
];

const budgetOptions = ['economy', 'medium', 'professional', 'unlimited'];

const whenBeans = { homeProductKind: ['beans'] };
const whenPowder = { homeProductKind: ['powder'] };

// برای قهوه‌ی فوری و کپسولی، سؤال‌های طعم و بودجه معنا ندارد
const whenOfficeBeans = {
    officeBrewMethod: ['espressoMachine', 'filter', 'mokaPot', 'none'],
};

export const coffeeFinderQuestions = {
    home: [
        {
            id: 'homeProductKind',
            type: 'single',
            options: ['beans', 'powder', 'instant'],
        },
        {
            id: 'brewMethod',
            type: 'single',
            showWhen: whenBeans,
            options: [
                'espresso',
                'mokaPot',
                'filter',
                'frenchPress',
                'aeropress',
                'chemex',
                'v60',
                'turkish',
                'none',
            ],
        },
        {
            id: 'hasGrinder',
            type: 'single',
            showWhen: whenBeans,
            options: ['yes', 'no'],
        },
        {
            id: 'intensity',
            type: 'single',
            showWhen: whenBeans,
            options: intensityOptions,
        },
        {
            id: 'flavors',
            type: 'multiple',
            showWhen: whenBeans,
            options: flavorOptions,
        },
        {
            id: 'budget',
            type: 'single',
            showWhen: whenBeans,
            options: budgetOptions,
        },
        {
            id: 'powderKind',
            type: 'single',
            showWhen: whenPowder,
            options: [
                'cappuccino',
                'hotChocolate',
                'masala',
                'chaiKarak',
                'coffeeMix',
            ],
        },
        {
            id: 'powderSize',
            type: 'single',
            showWhen: whenPowder,
            options: ['small', 'one', 'large'],
        },
    ],

    cafe: [
        {
            id: 'serviceType',
            type: 'single',
            options: ['espresso', 'milkBased', 'filter', 'coldBrew'],
        },
        {
            id: 'intensity',
            type: 'single',
            options: intensityOptions,
        },
        {
            id: 'customerFlavor',
            type: 'multiple',
            options: flavorOptions,
        },
        {
            id: 'monthlyCoffeeConsumption',
            type: 'single',
            options: [
                'lessThan5kg',
                '5To15kg',
                '15To30kg',
                '30To50kg',
                '50To100kg',
                'moreThan100kg',
            ],
        },
        {
            id: 'monthlyBudget',
            type: 'single',
            options: budgetOptions,
        },
    ],

    office: [
        {
            id: 'numberOfUsers',
            type: 'single',
            options: [
                'oneToFive',
                'sixToFifteen',
                'sixteenToThirty',
                'thirtyOneToFifty',
                'moreThanFifty',
            ],
        },
        {
            id: 'officeBrewMethod',
            type: 'single',
            options: [
                'espressoMachine',
                'filter',
                'mokaPot',
                'instant',
                'capsule',
                'none',
            ],
        },
        {
            id: 'intensity',
            type: 'single',
            showWhen: whenOfficeBeans,
            options: intensityOptions,
        },
        {
            id: 'officeFlavor',
            type: 'multiple',
            showWhen: whenOfficeBeans,
            options: flavorOptions,
        },
        {
            id: 'officeBudget',
            type: 'single',
            showWhen: whenOfficeBeans,
            options: budgetOptions,
        },
    ],

    // خرید عمده محصول مستقیم پیشنهاد نمی‌شود؛ جواب‌ها فقط مسیر را مشخص می‌کنند
    // و خروجی، تماس با فروش است.
    wholesale: [
        {
            id: 'purchasePurpose',
            type: 'single',
            options: [
                'resale',
                'cafeSupply',
                'retailStore',
                'wholesaleDistribution',
                'export',
                'industrialUse',
            ],
        },
        {
            id: 'productType',
            type: 'single',
            options: [
                'greenBeans',
                'roastedCoffee',
                'groundCoffee',
                'customBlend',
            ],
        },
        {
            id: 'monthlyVolume',
            type: 'single',
            options: [
                'lessThan100kg',
                '100To500kg',
                '500kgTo1Ton',
                '1To5Ton',
                'moreThan5Ton',
            ],
        },
        {
            id: 'brand',
            type: 'single',
            options: ['farajahan', 'ownBrand', 'noBrand'],
        },
        {
            id: 'sampleBeforeOrder',
            type: 'single',
            options: ['yes', 'no'],
        },
    ],
};