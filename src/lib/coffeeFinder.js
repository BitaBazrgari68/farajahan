export function createInitialCoffeeFinderState() {
    return {
        businessType: null,

        answers: {
            // Home
            experience: null,
            drinkingTime: null,
            dailyCups: null,
            brewMethod: null,
            flavors: [],
            intensity: null,
            caffeine: null,
            arabicaRobusta: null,
            hasGrinder: null,
            equipmentStatus: null,
            equipment: [],
            budget: null,
            quantity: null,

            // Cafe / Restaurant
            cafeBusinessType: null,
            serviceType: null,
            dailyCoffeeDrinks: null,
            monthlyCoffeeConsumption: null,
            hasEspressoMachine: null,
            hasIndustrialGrinder: null,
            customerFlavor: [],
            priority: [],
            monthlyBudget: null,
            needsEquipment: null,
            equipmentNeeded: [],

            // Office
            numberOfUsers: null,
            officeDailyCups: null,
            officeBrewMethod: null,
            coffeeType: null,
            officeFlavor: [],
            monthlyConsumption: null,
            officeNeedsEquipment: null,
            officeBudget: null,

            // Wholesale
            purchasePurpose: null,
            productType: null,
            wholesaleCoffeeType: null,
            quality: null,
            orderVolume: null,
            monthlyVolume: null,
            wholesaleFlavor: [],
            packaging: null,
            brand: null,
            customPackaging: null,
            sampleBeforeOrder: null,
            wholesaleBudget: null,
        },

        final: {
            basketType: null,
            removeProduct: null,
            addProduct: null,
            changeQuantity: null,
            confirmBasket: false,
        },
    };
}

export function setCoffeeFinderBusinessType(
    state,
    businessType
) {
    return {
        ...state,
        businessType,
    };
}

export function updateCoffeeFinderAnswer(
    state,
    questionId,
    value
) {
    return {
        ...state,

        answers: {
            ...state.answers,
            [questionId]: value,
        },
    };
}

export function toggleCoffeeFinderMultipleAnswer(
    state,
    questionId,
    value
) {
    const currentValues = state.answers[questionId] || [];

    const exists = currentValues.includes(value);

    const newValues = exists
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

    return {
        ...state,

        answers: {
            ...state.answers,
            [questionId]: newValues,
        },
    };
}

export function updateCoffeeFinderFinalAnswer(
    state,
    questionId,
    value
) {
    return {
        ...state,

        final: {
            ...state.final,
            [questionId]: value,
        },
    };
}