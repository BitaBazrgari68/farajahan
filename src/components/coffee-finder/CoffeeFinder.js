'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { coffeeFinderQuestions } from '@/data/coffeeFinder';
import CoffeeFinderResults from '@/components/coffee-finder/CoffeeFinderResults';
import {
    loadCoffeeFinderProgress,
    saveCoffeeFinderProgress,
    clearCoffeeFinderProgress,
} from '@/lib/coffeeFinderStorage';

import {
    createInitialCoffeeFinderState,
    setCoffeeFinderBusinessType,
    updateCoffeeFinderAnswer,
    toggleCoffeeFinderMultipleAnswer,
    getVisibleQuestions,
    estimateTotalSteps,
} from '@/lib/coffeeFinder';

export default function CoffeeFinder() {
    const locale = useLocale();
    const t = useTranslations('coffeeFinder');

    const isRTL = locale === 'fa' || locale === 'ar';

    const [state, setState] = useState(
        createInitialCoffeeFinderState()
    );

    const [step, setStep] = useState(0);

    const [started, setStarted] = useState(false);

    const [completed, setCompleted] = useState(false);

    // بازیابی بعد از mount (نه در state اولیه، تا با رندر سرور ناسازگار نشود)
    const [restored, setRestored] = useState(false);

    useEffect(() => {
        const saved = loadCoffeeFinderProgress();

        if (saved) {
            setState(saved.state);
            setStep(saved.step);
            setStarted(saved.started);
            setCompleted(saved.completed);
        }

        setRestored(true);
    }, []);

    // ذخیره فقط بعد از پایان بازیابی، تا حالت خالی اولیه پیشرفت ذخیره‌شده را پاک نکند
    useEffect(() => {
        if (!restored) return;

        if (!started) {
            clearCoffeeFinderProgress();
            return;
        }

        saveCoffeeFinderProgress({ state, step, completed });
    }, [restored, state, step, started, completed]);

    /*
     * همه‌ی سؤال‌های مسیر انتخاب‌شده
     */
    const allQuestions = useMemo(() => {
        if (!state.businessType) {
            return [];
        }

        return coffeeFinderQuestions[state.businessType] || [];
    }, [state.businessType]);

    /*
     * فقط سؤال‌هایی که با پاسخ‌های قبلی نمایش داده می‌شوند
     */
    const questions = useMemo(
        () => getVisibleQuestions(allQuestions, state.answers),
        [allQuestions, state.answers]
    );

    const totalSteps = estimateTotalSteps(allQuestions, state.answers);

    const currentQuestion = questions[step];

    /*
     * Select business type
     * پاسخ‌های مسیر قبلی پاک می‌شود، چون بعضی سؤال‌ها بین مسیرها مشترک است
     */
    function handleBusinessTypeSelect(type) {
        setState(
            setCoffeeFinderBusinessType(
                createInitialCoffeeFinderState(),
                type
            )
        );

        setStep(0);
        setCompleted(false);
        setStarted(true);
    }

    /*
     * Single choice
     */
    function handleSingleAnswer(value) {
        setState((currentState) =>
            updateCoffeeFinderAnswer(
                currentState,
                currentQuestion.id,
                value
            )
        );
    }

    /*
     * Multiple choice
     */
    function handleMultipleAnswer(value) {
        setState((currentState) =>
            toggleCoffeeFinderMultipleAnswer(
                currentState,
                currentQuestion.id,
                value
            )
        );
    }

    /*
     * Continue
     */
    function handleNext() {
        if (!currentQuestion) {
            return;
        }

        const answer = state.answers[currentQuestion.id];

        if (
            currentQuestion.type === 'single' &&
            !answer
        ) {
            return;
        }

        if (
            currentQuestion.type === 'multiple' &&
            (!answer || answer.length === 0)
        ) {
            return;
        }

        if (step < questions.length - 1) {
            setStep((currentStep) => currentStep + 1);
        } else {
            setCompleted(true);
        }
    }

    /*
     * Previous
     */
    function handlePrevious() {
        if (step > 0) {
            setStep((currentStep) => currentStep - 1);
            return;
        }

        // اولین سؤال: برگشت به صفحه‌ی انتخاب هدف خرید
        setStarted(false);
    }

    /*
     * Restart
     */
    function handleRestart() {
        setState(createInitialCoffeeFinderState());
        setStep(0);
        setCompleted(false);
        setStarted(false);
    }

    /*
     * Start screen
     */
    if (!started) {
        const businessTypes = [
            {
                id: 'home',
                title: t('businessTypes.home.title'),
                description: t(
                    'businessTypes.home.description'
                ),
            },
            {
                id: 'cafe',
                title: t('businessTypes.cafe.title'),
                description: t(
                    'businessTypes.cafe.description'
                ),
            },
            {
                id: 'office',
                title: t('businessTypes.office.title'),
                description: t(
                    'businessTypes.office.description'
                ),
            },
            {
                id: 'wholesale',
                title: t('businessTypes.wholesale.title'),
                description: t(
                    'businessTypes.wholesale.description'
                ),
            },
        ];

        return (
            <section
                dir={isRTL ? 'rtl' : 'ltr'}
                className="px-4 sm:px-6 lg:px-8"            >
                <div className="mx-auto max-w-5xl rounded-3xl bg-coffee-dark px-6 py-10 sm:px-10 lg:px-16 lg:py-14 [background-image:url('/images/coffee-finder/bg-start.jpg')] bg-center bg-no-repeat bg-cover">

                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-sm font-medium tracking-wide text-gold">
                            {t('eyebrow')}
                        </span>

                        <h2 className="mt-3 text-3xl font-bold leading-tight text-cream sm:text-4xl">
                            {t('title')}
                        </h2>

                        <p className="mt-4 text-base leading-8 text-cream/70 sm:text-lg">
                            {t('description')}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {businessTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() =>
                                    handleBusinessTypeSelect(
                                        type.id
                                    )
                                }
                                className="group rounded-2xl border border-cream/10 bg-coffee-brown/50 p-6 text-start transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-coffee-brown"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-cream">
                                            {type.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-7 text-cream/90">
                                            {type.description}
                                        </p>
                                    </div>

                                    <span className="mt-1 text-gold transition-transform duration-300 group-hover:-translate-x-1">
                                        {isRTL ? '←' : '→'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    /*
     * Result screen
     * محصولات پیشنهادی از مسیر سرور و ویژگی‌های ووکامرس می‌آید.
     */
    if (completed) {
        return (
            <CoffeeFinderResults
                businessType={state.businessType}
                answers={state.answers}
                onBack={() => {
                    setCompleted(false);
                    setStep(Math.max(questions.length - 1, 0));
                }}
                onRestart={handleRestart}
            />
        );
    }

    /*
     * Question screen
     */
    if (!currentQuestion) {
        return null;
    }

    const questionTranslationKey =
        currentQuestion.translationKey ||
        currentQuestion.id;

    const selectedAnswer =
        state.answers[currentQuestion.id];

    const progress = Math.min(
        100,
        ((step + 1) / Math.max(totalSteps, 1)) * 100
    );

    return (
        <section
            dir={isRTL ? 'rtl' : 'ltr'}
            className="px-4 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">

                {/* Progress */}
                <div className="mb-8">
                    <div className="mb-3 flex items-center justify-between text-sm text-text-muted">
                        <span>
                            {t('progress', {
                                current: step + 1,
                                total: totalSteps,
                            })}
                        </span>

                        <span>
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-cream/40">
                        <div
                            className="h-full rounded-full bg-gold transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="rounded-3xl bg-coffee-dark px-6 py-8 sm:px-10 sm:py-12 [background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/images/coffee-finder/shape.png')] [background-position:top_left] bg-no-repeat">
                    <div className="mx-auto max-w-2xl">

                        <span className="text-sm font-medium text-gold">
                            {t('questionLabel')}
                        </span>

                        <h2 className="mt-3 text-2xl font-bold leading-tight text-cream sm:text-3xl lg:text-4xl">
                            {t(
                                `questions.${questionTranslationKey}.title`
                            )}
                        </h2>

                        {/* Options */}
                        <div className="mt-8 grid gap-3">
                            {currentQuestion.options.map((option) => {

                                const isSelected =
                                    currentQuestion.type === 'multiple'
                                        ? selectedAnswer?.includes(option)
                                        : selectedAnswer === option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            currentQuestion.type === 'multiple'
                                                ? handleMultipleAnswer(option)
                                                : handleSingleAnswer(option)
                                        }
                                        className={`w-full rounded-2xl border px-5 py-4 text-start text-sm font-medium transition-all duration-300 sm:text-base ${isSelected
                                            ? 'border-gold bg-gold/10 text-gold'
                                            : 'border-cream/10 bg-coffee-brown/30 text-cream hover:border-gold/40 hover:bg-coffee-brown/60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">

                                            <span>
                                                {t(
                                                    `questions.${questionTranslationKey}.options.${option}`
                                                )}
                                            </span>

                                            <span
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected
                                                    ? 'border-gold bg-gold text-coffee-deep'
                                                    : 'border-cream/30'
                                                    }`}
                                            >
                                                {isSelected ? '✓' : ''}
                                            </span>

                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="mt-10 flex items-center justify-between gap-4">

                            <button
                                type="button"
                                onClick={handlePrevious}

                                className="rounded-full border border-cream/15 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-cream/30 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {t('previous')}
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light"
                            >
                                {step === questions.length - 1
                                    ? t('finish')
                                    : t('next')}
                            </button>

                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}