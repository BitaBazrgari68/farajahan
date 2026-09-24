'use client';

import { useEffect, useRef, useState } from 'react';

export default function FAQMotion({ children, delay = 0 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.15,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`
                transition-all
                duration-[900ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-10 opacity-0'
                }
            `}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}