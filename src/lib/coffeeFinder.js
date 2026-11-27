export function createInitialCoffeeFinderState() {
    return {
        businessType: null,

        answers: {
            // Home
            homeProductKind: null,
            brewMethod: null,
            hasGrinder: null,
            intensity: null,
            flavors: [],
            budget: null,
            powderKind: null,
            powderSize: null,

            // Cafe
            serviceType: null,
            customerFlavor: [],
            monthlyCoffeeConsumption: null,
            monthlyBudget: null,

            // Office
            numberOfUsers: null,
            officeBrewMethod: null,
            officeFlavor: [],
            officeBudget: null,

            // Wholesale
            purchasePurpose: null,
            productType: null,
            monthlyVolume: null,
            brand: null,
            sampleBeforeOrder: null,
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

/*
 * سؤال‌های مشروط
 */

export function isQuestionVisible(question, answers) {
    const conditions = question.showWhen;

    if (!conditions) return true;

    return Object.entries(conditions).every(([id, allowed]) =>
        allowed.includes(answers[id])
    );
}

export function getVisibleQuestions(questions, answers) {
    return questions.filter((question) =>
        isQuestionVisible(question, answers)
    );
}

// تعداد کل مرحله‌ها برای نوار پیشرفت.
// تا وقتی پاسخ سؤال کنترل‌کننده مشخص نیست، طولانی‌ترین شاخه را حساب می‌کنیم
// تا عدد کل بعد از اولین پاسخ جابه‌جا نشود.
export function estimateTotalSteps(questions, answers) {
    const visibleCount = getVisibleQuestions(questions, answers).length;

    const branches = new Map();

    for (const question of questions) {
        if (!question.showWhen || isQuestionVisible(question, answers)) {
            continue;
        }

        for (const [controlId, allowed] of Object.entries(
            question.showWhen
        )) {
            // پاسخ داده شده ولی مطابق نیست: این سؤال واقعاً پنهان است
            if (answers[controlId]) continue;

            const counts = branches.get(controlId) || new Map();

            for (const value of allowed) {
                counts.set(value, (counts.get(value) || 0) + 1);
            }

            branches.set(controlId, counts);
        }
    }

    let extra = 0;

    for (const counts of branches.values()) {
        extra += Math.max(...counts.values());
    }

    return visibleCount + extra;
}