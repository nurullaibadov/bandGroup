import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
    end,
    duration = 2,
    suffix = '',
    prefix = ''
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000);

            if (progress < 1) {
                setCount(Math.floor(end * progress));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

interface StatsCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
    gradient: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    value,
    label,
    suffix,
    prefix,
    gradient
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
            <div className="relative bg-white/5 dark:bg-white/5 light:bg-gray-100 backdrop-blur-xl border border-white/10 dark:border-white/10 light:border-gray-200 rounded-3xl p-8 transition-all duration-300">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6`}>
                    {icon}
                </div>
                <div className="text-5xl font-black mb-2 bg-gradient-to-br ${gradient} bg-clip-text text-transparent">
                    <AnimatedCounter end={value} suffix={suffix} prefix={prefix} />
                </div>
                <div className="text-gray-400 dark:text-gray-400 light:text-gray-600 font-medium">{label}</div>
            </div>
        </motion.div>
    );
};
