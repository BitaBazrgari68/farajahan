'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { coffeeFinderQuestions } from '@/data/coffeeFinder';

import {
    createInitialCoffeeFinderState,
    setCoffeeFinderBusinessType,
    updateCoffeeFinderAnswer,
    toggleCoffeeFinderMultipleAnswer,
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

    /*
     * Questions belonging to the selected business type
     */
    const questions = useMemo(() => {
        if (!state.businessType) {
            return [];
        }

        return coffeeFinderQuestions[state.businessType] || [];
    }, [state.businessType]);

    const currentQuestion = questions[step];

    /*
     * Select business type
     */
    function handleBusinessTypeSelect(type) {
        setState((currentState) =>
            setCoffeeFinderBusinessType(
                currentState,
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
        }
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
                className="px-4 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-5xl rounded-3xl bg-coffee-dark px-6 py-10 sm:px-10 lg:px-16 lg:py-14 [background-image:url('/images/coffee-finder/bg-start.jpg')] bg-center bg-no-repeat bg-cover">

                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-sm font-medium tracking-wide text-gold">
                            {t('eyebrow')}
                        </span>

                        <h1 className="mt-3 text-3xl font-bold leading-tight text-cream sm:text-4xl">
                            {t('title')}
                        </h1>

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
                                        <h2 className="text-lg font-semibold text-cream">
                                            {type.title}
                                        </h2>

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
     *
     * Temporary step for testing.
     * Later this section will be replaced with the AI recommendation flow.
     */
    if (completed) {
        return (
            <section
                dir={isRTL ? 'rtl' : 'ltr'}
                className="px-4  sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-4xl">

                    <div className="rounded-3xl bg-coffee-dark px-6 py-10 sm:px-10 sm:py-12">

                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-medium tracking-wide text-gold">
                                {t('resultLabel')}
                            </span>

                            <h1 className="mt-3 text-3xl font-bold leading-tight text-cream sm:text-4xl">
                                {t('resultTitle')}
                            </h1>

                            <p className="mt-4 text-base leading-8 text-cream/70 sm:text-lg">
                                {t('resultDescription')}
                            </p>
                        </div>

                        {/* Selected Business Type */}
                        <div className="mt-10 rounded-2xl border border-cream/10 bg-coffee-brown/30 p-5">
                            <span className="text-sm text-text-muted">
                                {t('selectedType')}
                            </span>

                            <p className="mt-2 text-lg font-semibold text-cream">
                                {t(
                                    `businessTypes.${state.businessType}.title`
                                )}
                            </p>
                        </div>

                        {/* Answers */}
                        <div className="mt-4 rounded-2xl border border-cream/10 bg-coffee-brown/30 p-5">
                            <span className="text-sm text-text-muted">
                                {t('answersPreview')}
                            </span>

                            <pre
                                dir="ltr"
                                className="mt-4 overflow-x-auto rounded-xl bg-coffee-deep p-4 text-left text-xs leading-7 text-cream/80"
                            >
                                {JSON.stringify(
                                    state.answers,
                                    null,
                                    2
                                )}
                            </pre>
                        </div>

                        {/* Temporary Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

                            <button
                                type="button"
                                onClick={() => {
                                    setCompleted(false);
                                    setStep(
                                        questions.length - 1
                                    );
                                }}
                                className="rounded-full border border-cream/15 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-cream/30"
                            >
                                {t('backToQuestions')}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    console.log(
                                        'Coffee Finder Profile:',
                                        {
                                            businessType:
                                                state.businessType,
                                            answers:
                                                state.answers,
                                        }
                                    );
                                }}
                                className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light"
                            >
                                {t('continueToRecommendation')}
                            </button>

                        </div>
                    </div>
                </div>
            </section>
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

    const progress =
        ((step + 1) / questions.length) * 100;

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
                                total: questions.length,
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

                {/* Main Question Area */}
                

                    {/* Question Card */}
                    <div className="rounded-3xl bg-coffee-dark px-6 py-8 sm:px-10 sm:py-12 [background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/images/coffee-finder/shape.png')] [background-position:top_left] bg-no-repeat">
                        <div className="mx-auto max-w-2xl">

                            <span className="text-sm font-medium text-gold">
                                {t('questionLabel')}
                            </span>

                            <h1 className="mt-3 text-2xl font-bold leading-tight text-cream sm:text-3xl lg:text-4xl">
                                {t(
                                    `questions.${questionTranslationKey}.title`
                                )}
                            </h1>

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
                                    disabled={step === 0}
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