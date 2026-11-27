// نگه‌داری پیشرفت باریستا تا بستن تب، تا با رفرش صفحه به اول برنگردد.
// فقط جواب‌ها، مرحله و وضعیت نتیجه ذخیره می‌شود؛ محصولات هر بار تازه از سرور می‌آیند.

import { coffeeFinderQuestions } from "@/data/coffeeFinder";
import {
    createInitialCoffeeFinderState,
    getVisibleQuestions,
} from "@/lib/coffeeFinder";

const STORAGE_KEY = "coffee_finder_progress";

// بعد از این مدت، پیشرفت قدیمی دیگر برگردانده نمی‌شود
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function loadCoffeeFinderProgress() {
    try {
        const raw = JSON.parse(
            sessionStorage.getItem(STORAGE_KEY) || "null"
        );

        if (!raw || typeof raw !== "object") return null;

        if (Date.now() - Number(raw.savedAt || 0) > MAX_AGE_MS) {
            return null;
        }

        const questions = coffeeFinderQuestions[raw.businessType];

        if (!questions) return null;

        // فقط پاسخ‌هایی که در فهرست سؤال‌ها هست پذیرفته می‌شود
        const state = createInitialCoffeeFinderState();

        state.businessType = raw.businessType;

        for (const question of questions) {
            const value = raw.answers?.[question.id];

            if (question.type === "multiple") {
                state.answers[question.id] = Array.isArray(value)
                    ? value.filter((item) =>
                          question.options.includes(item)
                      )
                    : [];
            } else if (question.options.includes(value)) {
                state.answers[question.id] = value;
            }
        }

        const visible = getVisibleQuestions(questions, state.answers);

        const lastStep = Math.max(visible.length - 1, 0);

        const step = Number.isInteger(raw.step)
            ? Math.min(Math.max(raw.step, 0), lastStep)
            : 0;

        return {
            state,
            step,
            started: true,
            completed: raw.completed === true,
        };
    } catch {
        return null;
    }
}

export function saveCoffeeFinderProgress({ state, step, completed }) {
    try {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                businessType: state.businessType,
                answers: state.answers,
                step,
                completed,
                savedAt: Date.now(),
            })
        );
    } catch {
        // ذخیره‌سازی در دسترس نیست؛ فقط رفرش صفحه پیشرفت را از دست می‌دهد
    }
}

export function clearCoffeeFinderProgress() {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // ذخیره‌سازی در دسترس نیست
    }
}