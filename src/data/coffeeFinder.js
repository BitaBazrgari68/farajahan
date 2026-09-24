export const coffeeFinderQuestions = {
    home: [
        {
            id: 'experience',
            type: 'single',
            options: [
                'beginner',
                'intermediate',
                'professional',
            ],
        },
        {
            id: 'drinkingTime',
            type: 'single',
            options: [
                'morning',
                'daytime',
                'evening',
                'allDay',
            ],
        },
        {
            id: 'dailyCups',
            type: 'single',
            options: [
                'one',
                'two',
                'threeToFour',
                'moreThanFour',
            ],
        },
        {
            id: 'brewMethod',
            type: 'single',
            options: [
                'espresso',
                'mokaPot',
                'v60',
                'frenchPress',
                'aeropress',
                'turkish',
                'none',
            ],
        },
        {
            id: 'flavors',
            type: 'multiple',
            options: [
                'chocolate',
                'caramel',
                'nutty',
                'fruity',
                'floral',
                'citrus',
                'spicy',
                'sweet',
            ],
        },
        {
            id: 'intensity',
            type: 'single',
            options: [
                'mild',
                'balanced',
                'strong',
                'veryStrong',
            ],
        },
        {
            id: 'caffeine',
            type: 'single',
            options: [
                'low',
                'medium',
                'high',
                'veryHigh',
            ],
        },
        {
            id: 'arabicaRobusta',
            type: 'single',
            options: [
                '100Arabica',
                'arabicaDominant',
                'balancedBlend',
                'robustaDominant',
                '100Robusta',
                'noPreference',
            ],
        },
        {
            id: 'hasGrinder',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'equipmentStatus',
            type: 'single',
            options: [
                'complete',
                'partial',
                'none',
            ],
        },
        {
            id: 'equipment',
            type: 'multiple',
            options: [
                'espressoMachine',
                'grinder',
                'mokaPot',
                'v60',
                'frenchPress',
                'aeropress',
                'kettle',
                'scale',
                'tamper',
                'server',
                'none',
            ],
        },
        {
            id: 'budget',
            type: 'single',
            options: [
                'economy',
                'medium',
                'professional',
                'unlimited',
            ],
        },
        {
            id: 'quantity',
            type: 'single',
            options: [
                '250g',
                '500g',
                '1kg',
                'moreThan1kg',
            ],
        },
    ],

    cafe: [
        {
            id: 'cafeBusinessType',
            type: 'single',
            options: [
                'cafe',
                'restaurant',
                'hotel',
                'bakery',
                'cafeRestaurant',
                'other',
            ],
        },
        {
            id: 'serviceType',
            type: 'single',
            options: [
                'espresso',
                'milkBased',
                'filter',
                'coldBrew',
                'mixed',
            ],
        },
        {
            id: 'dailyCoffeeDrinks',
            type: 'single',
            options: [
                'lessThan30',
                '30To70',
                '70To150',
                '150To300',
                'moreThan300',
            ],
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
            id: 'hasEspressoMachine',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'hasIndustrialGrinder',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'customerFlavor',
            type: 'multiple',
            options: [
                'chocolate',
                'caramel',
                'nutty',
                'fruity',
                'floral',
                'spicy',
                'balanced',
                'strong',
            ],
        },
        {
            id: 'priority',
            type: 'multiple',
            options: [
                'qualityAndFlavor',
                'price',
                'profitMargin',
                'highCaffeine',
                'moreCrema',
                'consistency',
            ],
        },
        {
            id: 'arabicaRobusta',
            type: 'single',
            options: [
                '100Arabica',
                'arabicaDominant',
                'balancedBlend',
                'robustaDominant',
                '100Robusta',
                'noPreference',
            ],
        },
        {
            id: 'monthlyBudget',
            type: 'single',
            options: [
                'economy',
                'medium',
                'professional',
                'unlimited',
            ],
        },
        {
            id: 'needsEquipment',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'equipmentNeeded',
            type: 'multiple',
            options: [
                'grinder',
                'tamper',
                'scale',
                'pitcher',
                'knockBox',
                'kettle',
                'other',
            ],
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
            id: 'officeDailyCups',
            type: 'single',
            options: [
                'lessThan10',
                '10To30',
                '30To50',
                'moreThan50',
            ],
        },
        {
            id: 'officeBrewMethod',
            type: 'single',
            options: [
                'espressoMachine',
                'capsule',
                'mokaPot',
                'instant',
                'filter',
                'none',
            ],
        },
        {
            id: 'coffeeType',
            type: 'single',
            options: [
                'arabica',
                'robusta',
                'blend',
                'noPreference',
            ],
        },
        {
            id: 'officeFlavor',
            type: 'multiple',
            options: [
                'chocolate',
                'caramel',
                'nutty',
                'fruity',
                'floral',
                'spicy',
            ],
        },
        {
            id: 'monthlyConsumption',
            type: 'single',
            options: [
                'lessThan2kg',
                '2To5kg',
                '5To10kg',
                'moreThan10kg',
            ],
        },
        {
            id: 'officeNeedsEquipment',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'officeBudget',
            type: 'single',
            options: [
                'economy',
                'medium',
                'professional',
                'unlimited',
            ],
        },
    ],

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
            id: 'wholesaleCoffeeType',
            type: 'single',
            options: [
                'arabica',
                'robusta',
                'blend',
                'noPreference',
            ],
        },
        {
            id: 'quality',
            type: 'single',
            options: [
                'economy',
                'commercial',
                'premium',
                'specialty',
            ],
        },
        {
            id: 'orderVolume',
            type: 'single',
            options: [
                '10To30kg',
                '30To100kg',
                '100To500kg',
                '500kgTo1Ton',
                'moreThan1Ton',
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
            id: 'wholesaleFlavor',
            type: 'multiple',
            options: [
                'chocolate',
                'caramel',
                'nutty',
                'fruity',
                'floral',
                'spicy',
                'balanced',
                'strong',
            ],
        },
        {
            id: 'packaging',
            type: 'single',
            options: [
                '250g',
                '500g',
                '1kg',
                '5kg',
                '10kg',
                'bulk',
            ],
        },
        {
            id: 'brand',
            type: 'single',
            options: [
                'farajahan',
                'ownBrand',
                'noBrand',
            ],
        },
        {
            id: 'customPackaging',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'sampleBeforeOrder',
            type: 'single',
            options: [
                'yes',
                'no',
            ],
        },
        {
            id: 'wholesaleBudget',
            type: 'single',
            options: [
                'economy',
                'medium',
                'professional',
                'unlimited',
            ],
        },
    ],
};

export const coffeeFinderFinalQuestions = [
    {
        id: 'basketType',
        type: 'single',
        options: [
            'economy',
            'farajahanRecommended',
            'professional',
        ],
    },
    {
        id: 'removeProduct',
        type: 'single',
        options: [
            'yes',
            'no',
        ],
    },
    {
        id: 'addProduct',
        type: 'single',
        options: [
            'yes',
            'no',
        ],
    },
    {
        id: 'changeQuantity',
        type: 'single',
        options: [
            'yes',
            'no',
        ],
    },
    {
        id: 'confirmBasket',
        type: 'single',
        options: [
            'confirm',
        ],
    },
];